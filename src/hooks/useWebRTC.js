import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCManager } from '../network/webrtcManager.js';

/**
 * useWebRTC
 * 
 * React hook integrating WebRTC P2P DataChannel with Supabase fallback (NETW-02, NETW-03, NETW-04).
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

  // Initialize WebRTCManager
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
        setRemoteStream(stream);
      },
      onFallbackTrigger: (packet) => {
        // Fallback over Supabase broadcast WebSocket (NETW-03)
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

  // Synchronize local media stream with active peer connection
  useEffect(() => {
    if (rtcManagerRef.current) {
      rtcManagerRef.current.setLocalStream(localStream);
    }
  }, [localStream]);

  // Handle incoming Supabase Realtime broadcast signals & fallback packets (Symmetric negotiation)
  useEffect(() => {
    if (!channelInstance) return;

    channelInstance.onBroadcast('webrtc-signal', async (signal) => {
      if (!rtcManagerRef.current || !signal) return;
      // Drop self-originated broadcast echoes
      if (signal.senderId && signal.senderId === userId) return;

      if (signal.type === 'OFFER') {
        await rtcManagerRef.current.handleRemoteOffer(signal.sdp, localStream);
      } else if (signal.type === 'ANSWER') {
        await rtcManagerRef.current.handleRemoteAnswer(signal.sdp);
      } else if (signal.type === 'CANDIDATE') {
        await rtcManagerRef.current.handleRemoteCandidate(signal.candidate);
      }
    });

    channelInstance.onBroadcast('chat-packet', (packet) => {
      // Received packet via WebSocket broadcast fallback
      setConnectionMode('websocket');
      setRttMs(54);
      handleIncomingPacket(packet);
    });
  }, [channelInstance, userId, localStream, handleIncomingPacket]);

  // Deterministic call initiation: Peer with lexicographically higher userId initiates
  // This guarantees zero glare/collision and symmetrical connection setup without roles
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

  // Public send helpers
  const sendPartialSigning = useCallback(({ glosses, previewText }) => {
    if (rtcManagerRef.current) {
      rtcManagerRef.current.sendPartialSigning({
        glosses,
        previewText,
        sender: userName
      });
    }
  }, [userName]);

  const sendCommittedSentence = useCallback((sentence) => {
    if (rtcManagerRef.current) {
      rtcManagerRef.current.sendCommittedSentence({
        id: sentence.id || Date.now(),
        glosses: sentence.glosses || [],
        text: sentence.text || '',
        sender: userName,
        timestamp: sentence.timestamp
      });
    }
  }, [userName]);

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
    // Also add to local history
    setIncomingMessages((prev) => [packet, ...prev]);
  }, [userName]);

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
