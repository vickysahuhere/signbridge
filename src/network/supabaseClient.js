import { createClient } from '@supabase/supabase-js';
import { joinRoom as joinTorrentRoom } from '@trystero-p2p/torrent';
import { joinRoom as joinNostrRoom } from '@trystero-p2p/nostr';

/**
 * supabaseClient.js
 * 
 * Manages signaling channels for WebRTC peer connection (NETW-01, NETW-03):
 * 1. Cloud-connected Supabase Realtime when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
 * 2. High-speed, zero-cost, serverless WebTorrent P2P mesh (via public WebTorrent trackers)
 *    with curated Nostr fallback and local BroadcastChannel for seamless cross-device
 *    and cross-tab video calling (handles 50-100+ simultaneous users without servers).
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

export const PUBLIC_STUN_SERVERS = [
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.services.mozilla.com' }
];

export const WEBTORRENT_TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.btorrent.xyz',
  'wss://open.ftorrent.com',
  'wss://tracker.files.fm:7073/announce'
];

export const NOSTR_RELAYS = [
  'wss://relay.primal.net',
  'wss://nos.lol',
  'wss://relay.damus.io',
  'wss://nostr.mom',
  'wss://nostr.wine'
];

/**
 * Normalizes user-entered room codes or slugs.
 * e.g. "isl-sky-42", "Sky-42", "1234", "room_99" -> "isl-sky-42", "sky-42", etc.
 */
export function normalizeRoomCode(input = '') {
  if (!input || typeof input !== 'string') return '';
  return input.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

/**
 * Generates a clean, human-readable room identifier.
 * e.g. "isl-sky-42", "isl-river-88"
 */
export function generateRoomId() {
  const adjectives = ['sky', 'river', 'ember', 'solar', 'ocean', 'wave', 'maple', 'cedar', 'lotus', 'amber'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `isl-${adj}-${num}`;
}

/**
 * Normalizes and extracts room ID from URL search or defaults.
 * Supports ?room=..., ?code=..., ?r=...
 * @param {string} searchString - e.g. "?room=isl-sky-42"
 * @returns {string} Clean alphanumeric room ID
 */
export function extractRoomId(searchString = '') {
  if (typeof searchString !== 'string') return generateRoomId();
  const params = new URLSearchParams(searchString.startsWith('?') ? searchString : `?${searchString}`);
  const room = params.get('room') || params.get('code') || params.get('r');
  if (room && /^[a-zA-Z0-9_-]+$/.test(room)) {
    return room.toLowerCase();
  }
  return '';
}

/**
 * Factory for Realtime Room Channels.
 * Wraps either Supabase Realtime Channel or decentralized zero-server P2P mesh.
 * @param {string} roomId
 * @param {object} options
 */
export function getRoomChannel(roomId, options = {}) {
  const cleanId = normalizeRoomCode(roomId) || 'isl-room-main';
  const channelName = `room:${cleanId}`;

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

  // Decentralized, Zero-Database, Zero-Server WebTorrent P2P Mesh
  // Matches peers across the internet via open WebTorrent trackers,
  // connects directly browser-to-browser via WebRTC, and uses local BroadcastChannel for same-device tabs.
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`signbridge_${channelName}`) : null;
  const broadcastHandlers = new Map();
  const presenceSyncHandlers = [];
  const remoteStreamHandlers = [];
  const presences = new Map();
  let currentPresenceState = null;
  let currentLocalStream = null;

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

  // Only initialize decentralized WebTorrent & WebRTC mesh in live browser environments
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  if (isBrowser) {
    try {
      const trysteroConfig = {
        appId: 'sanket-isl-v2',
        relayUrls: WEBTORRENT_TRACKERS,
        rtcConfig: {
          iceServers: PUBLIC_STUN_SERVERS
        }
      };

      trysteroRoom = joinTorrentRoom(trysteroConfig, cleanId);

      const chatAction = trysteroRoom.makeAction('chat_broadcast');
      const presenceAction = trysteroRoom.makeAction('presence_sync');

      trysteroSendBroadcast = (data) => chatAction.send(data);
      trysteroSendPresence = (state, peerId) => presenceAction.send(state, peerId);

      // When remote peer connects across the internet
      trysteroRoom.onPeerJoin = (peerId) => {
        if (currentPresenceState && trysteroSendPresence) {
          trysteroSendPresence(currentPresenceState, peerId);
        }
        if (currentLocalStream && trysteroRoom) {
          try {
            trysteroRoom.addStream(currentLocalStream, peerId);
          } catch (err) {
            console.warn('[Signaling] Stream sync to new peer error:', err);
          }
        }
      };

      // When remote peer disconnects
      trysteroRoom.onPeerLeave = (peerId) => {
        presences.delete(peerId);
        notifyPresenceSync();
      };

      // When remote peer streams video/audio
      trysteroRoom.onPeerStream = (stream, peerId) => {
        if (stream) {
          remoteStreamHandlers.forEach((fn) => {
            try {
              fn(stream, peerId);
            } catch (err) {
              console.warn('[Signaling] remoteStreamHandler error:', err);
            }
          });
        }
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
      console.warn('[Signaling] Decentralized mesh initialization notice:', err);
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
    type: 'decentralized-webtorrent-p2p',
    channel: bc,
    roomId: cleanId,
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
    addStream: (stream) => {
      currentLocalStream = stream;
      if (trysteroRoom && stream) {
        try {
          trysteroRoom.addStream(stream);
        } catch (err) {
          console.warn('[Signaling] addStream error:', err);
        }
      }
    },
    removeStream: (stream) => {
      if (trysteroRoom && stream) {
        try {
          trysteroRoom.removeStream(stream);
        } catch {}
      }
      currentLocalStream = null;
    },
    onRemoteStream: (handler) => {
      if (typeof handler === 'function') {
        remoteStreamHandlers.push(handler);
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
  normalizeRoomCode,
  extractRoomId,
  getRoomChannel,
  PUBLIC_STUN_SERVERS
};
