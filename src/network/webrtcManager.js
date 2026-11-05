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
    onMessage = () => {},
    onStatusChange = () => {},
    onFallbackTrigger = () => {},
    sendSignaling = () => {}
  } = {}) {
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.onFallbackTrigger = onFallbackTrigger;
    this.sendSignaling = sendSignaling;

    this.peerConnection = null;
    this.dataChannel = null;
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

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignaling({
          type: 'CANDIDATE',
          candidate: event.candidate
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
   * Starts call as initiator (Signer), creates data channel and creates SDP offer.
   */
  async startCall() {
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
        sdp: offer
      });
    } catch (err) {
      console.warn('[WebRTCManager] Offer generation failed, triggering fallback:', err);
      this.status = 'failed';
      this.onStatusChange('failed');
    }
  }

  /**
   * Listens as receiver (Text Partner) when remote offer arrives.
   */
  async handleRemoteOffer(offerSdp) {
    this.isInitiator = false;
    const pc = this.initPeerConnection();
    if (!pc) return;

    pc.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sendSignaling({
        type: 'ANSWER',
        sdp: answer
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
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp));
    } catch (err) {
      console.warn('[WebRTCManager] Remote answer failed:', err);
    }
  }

  /**
   * Adds remote ICE candidate.
   */
  async handleRemoteCandidate(candidate) {
    if (!this.peerConnection || !candidate) return;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('[WebRTCManager] Error adding ICE candidate:', err);
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
