import { useState, useEffect, useCallback, useRef } from 'react';
import { extractRoomId, generateRoomId, getRoomChannel } from '../network/supabaseClient.js';

/**
 * useRoomConnection
 * 
 * Manages instant room creation, URL parameters, role selection, and Realtime signaling (NETW-01, NETW-03).
 */
export function useRoomConnection() {
  const [roomId, setRoomId] = useState(() => {
    if (typeof window !== 'undefined') {
      const parsed = extractRoomId(window.location.search);
      return parsed || generateRoomId();
    }
    return generateRoomId();
  });

  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'text_partner' || urlRole === 'partner') {
        return 'text_partner';
      }
    }
    return 'signer';
  });

  const [userName, setUserName] = useState(() => (role === 'signer' ? 'Aarav (Signer)' : 'Priya (Text)'));
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [transportType, setTransportType] = useState('p2p'); // 'p2p' | 'broadcast'
  const [peerPresence, setPeerPresence] = useState({ isOnline: false, role: null, name: '' });
  const [channelInstance, setChannelInstance] = useState(null);

  const userIdRef = useRef(`user_${Math.random().toString(36).slice(2, 9)}`);

  // Synchronize URL query parameter without page reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('room') !== roomId || url.searchParams.get('role') !== role) {
        url.searchParams.set('room', roomId);
        url.searchParams.set('role', role);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [roomId, role]);

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
                  role: p.role,
                  name: p.name || 'Partner'
                });
              }
            });
          }
        });
      }

      if (!peerFound) {
        setPeerPresence({ isOnline: false, role: null, name: '' });
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

  // Broadcast message sender (WebSocket fallback NETW-03)
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

  // Copy shareable invitation link
  const getRoomShareUrl = useCallback((targetRole = 'text_partner') => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', roomId);
    url.searchParams.set('role', targetRole);
    return url.toString();
  }, [roomId]);

  return {
    roomId,
    setRoomId,
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
