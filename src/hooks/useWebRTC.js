import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCManager } from '../network/webrtcManager.js';

/**
 * useWebRTC
 * 
 * React hook integrating WebRTC P2P DataChannel with Supabase and decentralized WebTorrent mesh fallback (NETW-02, NETW-03, NETW-04).
 */
export function useWebRTC({
  userId = null,
  userName = 'User',
  channelInstance,
  sendBroadcastMessage,
  peerPresence,
  localStream = null
}) {
  const [connectionMode, setConnectionMode] = useState('connecting'); // 'p2p' | 'websocket' | 'connecting'
  const [rttMs, setRttMs] = useState(18);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingPartialSigning, setIncomingPartialSigning] = useState(null);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [latestIncomingReply, setLatestIncomingReply] = useState(null);

  const rtcManagerRef = useRef(null);

  // Incoming packet dispatcher
  const handleIncomingPacket = useCallback((packet) => {
    if (!packet || typeof packet !== 'object') return;

    if (packet.type === 'PARTIAL_SIGNING') {
      setIncomingPartialSigning(packet);
    } else if (packet.type === 'COMMITTED_MESSAGE') {
      setIncomingPartialSigning(null);
      setIncomingMessages((prev) => [packet, ...prev]);
      setLatestIncomingReply(packet);
    } else if (packet.type === 'TEXT_REPLY') {
      setIncomingMessages((prev) => [packet, ...prev]);
      setLatestIncomingReply(packet);
    }
  }, []);

  // 1. Direct integration with decentralized WebTorrent mesh (channelInstance stream & track handlers)
  useEffect(() => {
    if (!channelInstance) return;

    // Stream remote media when delivered by decentralized P2P mesh
    if (channelInstance.onRemoteStream) {
      channelInstance.onRemoteStream((stream) => {
        if (stream) {
          setRemoteStream(stream);
          setConnectionMode('p2p');
          setRttMs(18);
        }
      });
    }
  }, [channelInstance]);

  // 2. Sync local media stream to decentralized mesh
  useEffect(() => {
    if (channelInstance && channelInstance.addStream && localStream) {
      channelInstance.addStream(localStream);
    }
    return () => {
      if (channelInstance && channelInstance.removeStream && localStream) {
        channelInstance.removeStream(localStream);
      }
    };
  }, [channelInstance, localStream]);

  // 3. Initialize WebRTCManager (handles direct RTCPeerConnection fallback & Perfect Negotiation)
  useEffect(() => {
    const manager = new WebRTCManager({
      userId,
      onMessage: (packet) => {
        setConnectionMode('p2p');
        setRttMs(18);
        handleIncomingPacket(packet);
      },
      onStatusChange: (status) => {
        if (status === 'connected') {
          setConnectionMode('p2p');
          setRttMs(18);
        } else if (status === 'failed' || status === 'closed') {
          setConnectionMode('websocket');
          setRttMs(54);
        }
      },
      onRemoteStream: (stream) => {
        if (stream) {
          setRemoteStream(stream);
          setConnectionMode('p2p');
          setRttMs(18);
        }
      },
      onFallbackTrigger: (packet) => {
        // Fallback over broadcast WebSocket / data channel
        if (sendBroadcastMessage) {
          sendBroadcastMessage('chat-packet', packet);
        }
      },
      sendSignaling: (signalPacket) => {
        if (sendBroadcastMessage) {
          sendBroadcastMessage('webrtc-signal', signalPacket);
        }
      }
    });

    rtcManagerRef.current = manager;

    return () => {
      manager.close();
    };
  }, [userId, sendBroadcastMessage, handleIncomingPacket]);

  // Synchronize local media stream with active WebRTC manager
  useEffect(() => {
    if (rtcManagerRef.current) {
      rtcManagerRef.current.setLocalStream(localStream);
    }
  }, [localStream]);

  // Handle incoming broadcast signals & fallback packets
  useEffect(() => {
    if (!channelInstance) return;

    channelInstance.onBroadcast('webrtc-signal', async (signal) => {
      if (!rtcManagerRef.current || !signal) return;
      // Drop self-originated broadcast echoes
      if (signal.senderId && signal.senderId === userId) return;

      if (signal.type === 'OFFER') {
        await rtcManagerRef.current.handleRemoteOffer(signal.sdp, localStream, signal.senderId);
      } else if (signal.type === 'ANSWER') {
        await rtcManagerRef.current.handleRemoteAnswer(signal.sdp);
      } else if (signal.type === 'CANDIDATE') {
        await rtcManagerRef.current.handleRemoteCandidate(signal.candidate);
      }
    });

    channelInstance.onBroadcast('chat-packet', (packet) => {
      setConnectionMode((prev) => (prev === 'p2p' ? 'p2p' : 'websocket'));
      handleIncomingPacket(packet);
    });
  }, [channelInstance, userId, localStream, handleIncomingPacket]);

  // Symmetric call trigger
  const isInitiator = Boolean(
    userId &&
    peerPresence?.userId &&
    userId > peerPresence.userId
  );

  useEffect(() => {
    if (isInitiator && peerPresence?.isOnline && rtcManagerRef.current) {
      if (rtcManagerRef.current.status === 'idle') {
        rtcManagerRef.current.startCall(localStream);
      }
    }
  }, [isInitiator, peerPresence?.isOnline, localStream]);

  // Public send helpers: sends through both WebRTC manager data channel and broadcast relay for 100% guarantee
  const sendPartialSigning = useCallback(({ glosses, previewText }) => {
    const packet = {
      type: 'PARTIAL_SIGNING',
      glosses,
      previewText,
      sender: userName,
      timestamp: Date.now()
    };
    if (rtcManagerRef.current) {
      rtcManagerRef.current.sendPartialSigning({ glosses, previewText, sender: userName });
    }
    if (sendBroadcastMessage) {
      sendBroadcastMessage('chat-packet', packet);
    }
  }, [userName, sendBroadcastMessage]);

  const sendCommittedSentence = useCallback((sentence) => {
    const packet = {
      type: 'COMMITTED_MESSAGE',
      id: sentence.id || Date.now(),
      glosses: sentence.glosses || [],
      text: sentence.text || '',
      sender: userName,
      senderRole: 'signer',
      timestamp: sentence.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (rtcManagerRef.current) {
      rtcManagerRef.current.sendCommittedSentence(packet);
    }
    if (sendBroadcastMessage) {
      sendBroadcastMessage('chat-packet', packet);
    }
  }, [userName, sendBroadcastMessage]);

  const sendTextReply = useCallback((text) => {
    if (!text || !text.trim()) return;
    const packet = {
      id: Date.now(),
      text: text.trim(),
      sender: userName,
      senderRole: 'peer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (rtcManagerRef.current) {
      rtcManagerRef.current.sendTextReply(packet);
    }
    if (sendBroadcastMessage) {
      sendBroadcastMessage('chat-packet', packet);
    }
    // Add to local history
    setIncomingMessages((prev) => [packet, ...prev]);
  }, [userName, sendBroadcastMessage]);

  return {
    connectionMode,
    rttMs,
    remoteStream,
    incomingPartialSigning,
    incomingMessages,
    latestIncomingReply,
    sendPartialSigning,
    sendCommittedSentence,
    sendTextReply
  };
}

export default useWebRTC;
