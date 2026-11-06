/**
 * webrtcManager.js
 * 
 * Manages peer-to-peer WebRTC connection and RTCDataChannel messaging (NETW-02, NETW-04):
 * - STUN/TURN negotiation with Cloudflare & Google public STUN servers.
 * - Opens RTCDataChannel("isl-chat") for <20ms direct UDP messaging.
 * - Streams live partial sign tokens in real time (NETW-04).
 * - Automatic fallback trigger to WebSocket broadcast if P2P is blocked (NETW-03).
 */

export const STUN_SERVERS = [
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.l.google.com:19302' }
];

export class WebRTCManager {
  constructor({
    userId = null,
    onMessage = () => {},
    onStatusChange = () => {},
    onFallbackTrigger = () => {},
    sendSignaling = () => {},
    onRemoteStream = () => {}
  } = {}) {
    this.userId = userId;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.onFallbackTrigger = onFallbackTrigger;
    this.sendSignaling = sendSignaling;
    this.onRemoteStream = onRemoteStream;

    this.peerConnection = null;
    this.dataChannel = null;
    this.localStream = null;
    this.remoteStream = null;
    this.candidateQueue = [];
    this.status = 'idle'; // 'idle' | 'connecting' | 'connected' | 'failed' | 'closed'
    this.isInitiator = false;
  }

  /**
   * Initializes RTCPeerConnection instance if WebRTC is supported.
   */
  initPeerConnection() {
    if (typeof RTCPeerConnection === 'undefined') {
      this.status = 'failed';
      this.onStatusChange('failed', 'WebRTC not supported in this runtime');
      return null;
    }

    if (this.peerConnection) {
      this.close();
    }

    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
    this.peerConnection = pc;

    // Attach local stream tracks if already available
    if (this.localStream) {
      try {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream);
        });
      } catch (err) {
        console.warn('[WebRTCManager] Error adding initial tracks:', err);
      }
    }

    // Handle remote media tracks (P2P video streaming)
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignaling({
          type: 'CANDIDATE',
          candidate: event.candidate,
          senderId: this.userId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        this.status = 'connected';
        this.onStatusChange('connected');
      } else if (state === 'failed' || state === 'disconnected') {
        this.status = 'failed';
        this.onStatusChange('failed');
      }
    };

    return pc;
  }

  /**
   * Attaches or updates local video/audio media stream tracks.
   */
  setLocalStream(stream) {
    this.localStream = stream;
    if (!this.peerConnection || this.peerConnection.signalingState === 'closed') return;

    if (!stream) {
      // Remove tracks if stream cleared
      const senders = this.peerConnection.getSenders();
      senders.forEach((sender) => {
        if (sender.track) {
          try {
            this.peerConnection.removeTrack(sender);
          } catch {}
        }
      });
      return;
    }

    const senders = this.peerConnection.getSenders();
    stream.getTracks().forEach((track) => {
      const existingSender = senders.find((s) => s.track && s.track.kind === track.kind);
      if (existingSender) {
        try {
          existingSender.replaceTrack(track);
        } catch (err) {
          console.warn('[WebRTCManager] replaceTrack error:', err);
        }
      } else {
        try {
          this.peerConnection.addTrack(track, stream);
        } catch (err) {
          console.warn('[WebRTCManager] addTrack error:', err);
        }
      }
    });
  }

  /**
   * Starts call as initiator, creates data channel and creates SDP offer.
   */
  async startCall(localStream = null) {
    if (localStream) {
      this.localStream = localStream;
    }
    this.isInitiator = true;
    const pc = this.initPeerConnection();
    if (!pc) return;

    this.status = 'connecting';
    this.onStatusChange('connecting');

    // Create reliable ordered data channel
    const dc = pc.createDataChannel('isl-chat', { ordered: true });
    this.setupDataChannel(dc);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.sendSignaling({
        type: 'OFFER',
        sdp: offer,
        senderId: this.userId
      });
    } catch (err) {
      console.warn('[WebRTCManager] Offer generation failed, triggering fallback:', err);
      this.status = 'failed';
      this.onStatusChange('failed');
    }
  }

  /**
   * Listens as receiver when remote offer arrives.
   */
  async handleRemoteOffer(offerSdp, localStream = null) {
    if (localStream) {
      this.localStream = localStream;
    }
    this.isInitiator = false;
    let pc = this.peerConnection;
    if (!pc || pc.signalingState === 'closed') {
      pc = this.initPeerConnection();
    }
    if (!pc) return;

    pc.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      await this.drainCandidateQueue();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sendSignaling({
        type: 'ANSWER',
        sdp: answer,
        senderId: this.userId
      });
    } catch (err) {
      console.warn('[WebRTCManager] Answer generation failed, triggering fallback:', err);
      this.status = 'failed';
      this.onStatusChange('failed');
    }
  }

  /**
   * Sets remote answer description when received by initiator.
   */
  async handleRemoteAnswer(answerSdp) {
    if (!this.peerConnection || this.peerConnection.signalingState === 'closed') return;
    try {
      if (this.peerConnection.signalingState === 'have-local-offer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp));
        await this.drainCandidateQueue();
      }
    } catch (err) {
      console.warn('[WebRTCManager] Remote answer failed:', err);
    }
  }

  /**
   * Adds remote ICE candidate or buffers it until remote description is set.
   */
  async handleRemoteCandidate(candidate) {
    if (!this.peerConnection || !candidate || this.peerConnection.signalingState === 'closed') return;
    try {
      if (this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        this.candidateQueue.push(candidate);
      }
    } catch (err) {
      console.warn('[WebRTCManager] Error adding ICE candidate:', err);
    }
  }

  /**
   * Drains buffered ICE candidates after remote description is applied.
   */
  async drainCandidateQueue() {
    if (!this.peerConnection || this.candidateQueue.length === 0) return;
    const queued = [...this.candidateQueue];
    this.candidateQueue = [];
    for (const cand of queued) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.warn('[WebRTCManager] Error draining ICE candidate:', err);
      }
    }
  }

  /**
   * Configures RTCDataChannel event listeners.
   */
  setupDataChannel(dc) {
    this.dataChannel = dc;

    dc.onopen = () => {
      this.status = 'connected';
      this.onStatusChange('connected');
    };

    dc.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        this.onMessage(parsed);
      } catch (err) {
        console.warn('[WebRTCManager] Malformed packet received:', event.data);
      }
    };

    dc.onclose = () => {
      this.status = 'closed';
      this.onStatusChange('closed');
    };

    dc.onerror = (err) => {
      console.warn('[WebRTCManager] DataChannel error:', err);
      this.status = 'failed';
      this.onStatusChange('failed');
    };
  }

  /**
   * Sends packet directly over RTCDataChannel or triggers fallback (NETW-03).
   */
  sendMessage(packet) {
    const isP2pOpen = this.dataChannel && this.dataChannel.readyState === 'open';

    if (isP2pOpen) {
      try {
        this.dataChannel.send(JSON.stringify(packet));
        return { transport: 'p2p', success: true };
      } catch (err) {
        console.warn('[WebRTCManager] Direct P2P send failed, falling back:', err);
      }
    }

    // Automatic fallback to WebSocket broadcast (NETW-03)
    this.onFallbackTrigger(packet);
    return { transport: 'broadcast-fallback', success: true };
  }

  /**
   * Streams live partial sign tokens across channel in real time (NETW-04).
   */
  sendPartialSigning({ glosses = [], previewText = '', sender = 'Signer' }) {
    const packet = {
      type: 'PARTIAL_SIGNING',
      glosses,
      previewText,
      sender,
      timestamp: Date.now()
    };
    return this.sendMessage(packet);
  }

  /**
   * Sends final committed sentence message.
   */
  sendCommittedSentence({ id, glosses = [], text = '', sender = 'Signer', timestamp }) {
    const packet = {
      type: 'COMMITTED_MESSAGE',
      id: id || Date.now(),
      glosses,
      text,
      sender,
      senderRole: 'signer',
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    return this.sendMessage(packet);
  }

  /**
   * Sends text reply from partner.
   */
  sendTextReply({ id, text = '', sender = 'Partner', timestamp }) {
    const packet = {
      type: 'TEXT_REPLY',
      id: id || Date.now(),
      text,
      sender,
      senderRole: 'text_partner',
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    return this.sendMessage(packet);
  }

  /**
   * Closes active connection.
   */
  close() {
    if (this.dataChannel) {
      try { this.dataChannel.close(); } catch {}
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch {}
      this.peerConnection = null;
    }
    this.status = 'closed';
  }
}

export default WebRTCManager;
