import { createClient } from '@supabase/supabase-js';

/**
 * supabaseClient.js
 * 
 * Manages the Supabase client and Realtime signaling channels (NETW-01, NETW-03).
 * Provides dual-mode operation:
 * 1. Cloud-connected Supabase Realtime when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
 * 2. In-memory / Cross-tab BroadcastChannel fallback for zero-configuration local runs and automated tests.
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

  // Cross-tab BroadcastChannel fallback for offline / demo runs
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`signbridge_${channelName}`) : null;
  const handlers = new Map();

  if (bc) {
    bc.onmessage = (msg) => {
      const data = msg.data;
      if (data && data.event && handlers.has(data.event)) {
        handlers.get(data.event).forEach(fn => fn(data.payload));
      }
    };
  }

  return {
    type: 'broadcast-channel-fallback',
    channel: bc,
    subscribe: (callback) => {
      if (callback) callback('SUBSCRIBED');
      return Promise.resolve('SUBSCRIBED');
    },
    unsubscribe: () => {
      if (bc) bc.close();
    },
    sendBroadcast: async (event, payload) => {
      if (bc) {
        bc.postMessage({ event, payload });
      }
      return { status: 'ok' };
    },
    trackPresence: async (state) => {
      if (bc) {
        bc.postMessage({ event: 'presence_sync', payload: state });
      }
      return 'ok';
    },
    onBroadcast: (event, handler) => {
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event).push(handler);
    },
    onPresenceSync: (handler) => {
      if (!handlers.has('presence_sync')) {
        handlers.set('presence_sync', []);
      }
      handlers.get('presence_sync').push(handler);
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
