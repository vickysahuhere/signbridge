import { createClient } from '@supabase/supabase-js';
import { joinRoom } from 'trystero/nostr';

/**
 * supabaseClient.js
 * 
 * Manages signaling channels for WebRTC peer connection (NETW-01, NETW-03):
 * 1. Cloud-connected Supabase Realtime when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
 * 2. Decentralized, zero-database, zero-account public WebRTC relay (via Nostr public relays)
 *    combined with local BroadcastChannel for seamless cross-device and cross-tab multi-user operation.
 */

const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export const isSupabaseConfigured = () => Boolean(envUrl && envKey && !envUrl.includes('placeholder'));

// Default public client or fallback simulation
export const supabase = isSupabaseConfigured()
  ? createClient(envUrl, envKey, {
      realtime: {
        params: {
          eventsPerSecond: 20
        }
      }
    })
  : null;

/**
 * Generates a clean, human-readable room identifier.
 * e.g. "isl-room-42", "maple-isl-88"
 */
export function generateRoomId() {
  const adjectives = ['maple', 'cedar', 'sky', 'river', 'ember', 'solar', 'ocean', 'wave'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `isl-${adj}-${num}`;
}

/**
 * Normalizes and extracts room ID from URL search or defaults.
 * @param {string} searchString - e.g. "?room=isl-sky-42"
 * @returns {string} Clean alphanumeric room ID
 */
export function extractRoomId(searchString = '') {
  if (typeof searchString !== 'string') return generateRoomId();
  const params = new URLSearchParams(searchString.startsWith('?') ? searchString : `?${searchString}`);
  const room = params.get('room');
  if (room && /^[a-zA-Z0-9_-]+$/.test(room)) {
    return room.toLowerCase();
  }
  return '';
}

/**
 * Factory for Realtime Room Channels.
 * Wraps either Supabase Realtime Channel or cross-tab BroadcastChannel fallback.
 * @param {string} roomId
 * @param {object} options
 */
export function getRoomChannel(roomId, options = {}) {
  const channelName = `room:${roomId}`;

  if (isSupabaseConfigured() && supabase) {
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: options.userId || `user_${Date.now()}` }
      }
    });

    return {
      type: 'supabase',
      channel,
      subscribe: (callback) => channel.subscribe(callback),
      unsubscribe: () => channel.unsubscribe(),
      sendBroadcast: async (event, payload) => {
        return channel.send({
          type: 'broadcast',
          event,
          payload
        });
      },
      trackPresence: async (state) => {
        return channel.track(state);
      },
      onBroadcast: (event, handler) => {
        return channel.on('broadcast', { event }, (payload) => handler(payload.payload));
      },
      onPresenceSync: (handler) => {
        return channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          handler(state);
        });
      }
    };
  }

  // Decentralized, Zero-Database, Zero-Account Public WebRTC Relay
  // Uses public Nostr ephemeral in-memory relays across the internet + local BroadcastChannel for cross-tab sync
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`signbridge_${channelName}`) : null;
  const broadcastHandlers = new Map();
  const presenceSyncHandlers = [];
  const presences = new Map();
  let currentPresenceState = null;

  let trysteroRoom = null;
  let trysteroSendBroadcast = null;
  let trysteroSendPresence = null;

  const notifyPresenceSync = () => {
    const presenceObj = {};
    presences.forEach((val, key) => {
      presenceObj[key] = val;
    });
    presenceSyncHandlers.forEach((handler) => {
      try {
        handler(presenceObj);
      } catch (err) {
        console.warn('[Signaling] presenceSyncHandler error:', err);
      }
    });
  };

  // Only initialize decentralized Nostr relay in live browser environments
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  if (isBrowser) {
    try {
      trysteroRoom = joinRoom({ appId: 'signbridge-isl-98' }, roomId);

      const chatAction = trysteroRoom.makeAction('chat_broadcast');
      const presenceAction = trysteroRoom.makeAction('presence_sync');

      trysteroSendBroadcast = (data) => chatAction.send(data);
      trysteroSendPresence = (state, peerId) => presenceAction.send(state, peerId);

      // When remote peer connects across the internet
      trysteroRoom.onPeerJoin = (peerId) => {
        if (currentPresenceState && trysteroSendPresence) {
          trysteroSendPresence(currentPresenceState, peerId);
        }
      };

      // When remote peer disconnects
      trysteroRoom.onPeerLeave = (peerId) => {
        presences.delete(peerId);
        notifyPresenceSync();
      };

      // Receive broadcast event from remote peer across the internet
      chatAction.onReceive = (data) => {
        if (data && data.event && broadcastHandlers.has(data.event)) {
          broadcastHandlers.get(data.event).forEach((fn) => {
            try {
              fn(data.payload);
            } catch (err) {
              console.warn('[Signaling] broadcast handler error:', err);
            }
          });
        }
      };

      // Receive presence state from remote peer across the internet
      presenceAction.onReceive = (peerState, peerId) => {
        if (peerState) {
          presences.set(peerId, [{ ...peerState, userId: peerId }]);
          notifyPresenceSync();
        }
      };
    } catch (err) {
      console.warn('[Signaling] Decentralized relay initialization notice:', err);
    }
  }

  // Cross-tab local synchronization (same machine)
  if (bc) {
    bc.onmessage = (msg) => {
      const data = msg.data;
      if (!data) return;

      if (data.event === '__presence_sync__' && data.payload) {
        const peerKey = data.payload.userId || 'local_tab';
        presences.set(peerKey, [data.payload]);
        notifyPresenceSync();
      } else if (data.event && broadcastHandlers.has(data.event)) {
        broadcastHandlers.get(data.event).forEach((fn) => {
          try {
            fn(data.payload);
          } catch (err) {
            console.warn('[Signaling] Local BC handler error:', err);
          }
        });
      }
    };
  }

  return {
    type: 'decentralized-zero-database',
    channel: bc,
    subscribe: (callback) => {
      if (callback) callback('SUBSCRIBED');
      return Promise.resolve('SUBSCRIBED');
    },
    unsubscribe: () => {
      if (trysteroRoom) {
        try {
          trysteroRoom.leave();
        } catch {}
      }
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
    },
    sendBroadcast: async (event, payload) => {
      // 1. Send to remote peers across the internet
      if (trysteroSendBroadcast) {
        try {
          trysteroSendBroadcast({ event, payload });
        } catch {}
      }
      // 2. Send to local tabs on same machine
      if (bc) {
        try {
          bc.postMessage({ event, payload });
        } catch {}
      }
      return { status: 'ok' };
    },
    trackPresence: async (state) => {
      currentPresenceState = state;
      // 1. Announce to remote peers across the internet
      if (trysteroSendPresence) {
        try {
          trysteroSendPresence(state);
        } catch {}
      }
      // 2. Announce to local tabs on same machine
      if (bc) {
        try {
          bc.postMessage({ event: '__presence_sync__', payload: state });
        } catch {}
      }
      return 'ok';
    },
    onBroadcast: (event, handler) => {
      if (!broadcastHandlers.has(event)) {
        broadcastHandlers.set(event, []);
      }
      broadcastHandlers.get(event).push(handler);
    },
    onPresenceSync: (handler) => {
      presenceSyncHandlers.push(handler);
    }
  };
}

export default {
  supabase,
  isSupabaseConfigured,
  generateRoomId,
  extractRoomId,
  getRoomChannel
};
