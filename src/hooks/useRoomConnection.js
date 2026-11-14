import { useState, useEffect, useCallback, useRef } from 'react';
import { extractRoomId, generateRoomId, normalizeRoomCode, getRoomChannel } from '../network/supabaseClient.js';

/**
 * useRoomConnection
 * 
 * Manages instant room creation, URL parameters, role selection, and Realtime signaling (NETW-01, NETW-03).
 */
export function useRoomConnection() {
  const [roomId, setRoomIdState] = useState(() => {
    if (typeof window !== 'undefined') {
      const parsed = extractRoomId(window.location.search);
      return parsed || generateRoomId();
    }
    return generateRoomId();
  });

  const setRoomId = useCallback((newId) => {
    const clean = normalizeRoomCode(newId);
    if (clean) {
      setRoomIdState(clean);
    }
  }, []);

  const userIdRef = useRef(`user_${Math.random().toString(36).slice(2, 9)}`);

  const [role, setRole] = useState('signer');

  const [userName, setUserNameState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('sanket_user_name');
      if (saved) return saved;
    }
    return `User-${userIdRef.current.slice(-4).toUpperCase()}`;
  });

  const setUserName = useCallback((name) => {
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    setUserNameState(trimmed);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sanket_user_name', trimmed);
    }
  }, []);

  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [transportType, setTransportType] = useState('p2p'); // 'p2p' | 'broadcast'
  const [peerPresence, setPeerPresence] = useState({ isOnline: false, userId: null, role: null, name: '' });
  const [channelInstance, setChannelInstance] = useState(null);

  // Synchronize URL query parameter without page reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('room') !== roomId) {
        url.searchParams.set('room', roomId);
        url.searchParams.delete('role');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [roomId]);

  // Connect to room channel
  useEffect(() => {
    let isMounted = true;
    const roomChannel = getRoomChannel(roomId, { userId: userIdRef.current });
    setChannelInstance(roomChannel);

    // Track presence
    roomChannel.trackPresence({
      userId: userIdRef.current,
      role,
      name: userName,
      joinedAt: Date.now()
    });

    roomChannel.onPresenceSync((presenceState) => {
      if (!isMounted) return;
      let peerFound = false;

      if (presenceState && typeof presenceState === 'object') {
        Object.values(presenceState).forEach(presences => {
          if (Array.isArray(presences)) {
            presences.forEach(p => {
              if (p.userId !== userIdRef.current) {
                peerFound = true;
                setPeerPresence({
                  isOnline: true,
                  userId: p.userId,
                  role: p.role || 'peer',
                  name: p.name || 'Partner'
                });
              }
            });
          }
        });
      }

      if (!peerFound) {
        setPeerPresence({ isOnline: false, userId: null, role: null, name: '' });
      }
    });

    roomChannel.subscribe((status) => {
      if (!isMounted) return;
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setConnectionStatus('disconnected');
      }
    });

    return () => {
      isMounted = false;
      roomChannel.unsubscribe();
    };
  }, [roomId, role, userName]);

  // Broadcast message sender (WebSocket / P2P fallback NETW-03)
  const sendBroadcastMessage = useCallback(async (event, payload) => {
    if (channelInstance) {
      await channelInstance.sendBroadcast(event, {
        ...payload,
        senderId: userIdRef.current,
        senderRole: role,
        senderName: userName,
        timestamp: Date.now()
      });
    }
  }, [channelInstance, role, userName]);

  // Copy shareable invitation link (guarantees direct navigation into chat room)
  const getRoomShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', roomId);
    url.searchParams.set('page', 'chat');
    url.searchParams.delete('role');
    return url.toString();
  }, [roomId]);

  return {
    roomId,
    setRoomId,
    userId: userIdRef.current,
    role,
    setRole,
    userName,
    setUserName,
    connectionStatus,
    transportType,
    setTransportType,
    peerPresence,
    channelInstance,
    sendBroadcastMessage,
    getRoomShareUrl
  };
}

export default useRoomConnection;
