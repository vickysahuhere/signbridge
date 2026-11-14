import { useCallback, useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';
import { generateCallCode, normalizeCallCode, peerIdFor, CODE_LENGTH } from './callCode.js';

/**
 * Code-based 1:1 video call.
 *  - The host registers the peer id derived from a 6-character code.
 *  - A guest enters that code and connects straight to the host (data + media, peer to peer).
 *  - Only one guest is admitted; a second person entering the code is told the call is full.
 *
 * phase: 'idle' | 'creating' | 'waiting' | 'joining' | 'connected' | 'ended'
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

function peerOptions() {
  const ice = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];
  if (env.VITE_TURN_URL) {
    ice.push({ urls: env.VITE_TURN_URL.split(','), username: env.VITE_TURN_USERNAME, credential: env.VITE_TURN_CREDENTIAL });
  }
  const opts = { config: { iceServers: ice }, debug: 0 };
  if (env.VITE_PEER_HOST) {
    opts.host = env.VITE_PEER_HOST;
    opts.port = Number(env.VITE_PEER_PORT || 443);
    opts.path = env.VITE_PEER_PATH || '/';
    opts.secure = env.VITE_PEER_SECURE !== 'false';
  }
  return opts;
}

const JOIN_TIMEOUT_MS = 15000;

export function useCall({ userName = 'Guest', localStream = null } = {}) {
  const [phase, setPhase] = useState('idle');
  const [code, setCode] = useState('');
  const [role, setRole] = useState(null); // 'host' | 'guest'
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [peerName, setPeerName] = useState('');
  const [remoteStream, setRemoteStream] = useState(null);
  const [rttMs, setRttMs] = useState(null);
  const [incomingPartialSigning, setIncomingPartialSigning] = useState(null);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [latestIncomingReply, setLatestIncomingReply] = useState(null);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const mediaRef = useRef(null);
  const streamRef = useRef(localStream);
  const nameRef = useRef(userName);
  const roleRef = useRef(null);
  const codeRef = useRef('');
  const timersRef = useRef({});
  nameRef.current = userName;

  /* ---------- helpers ---------- */
  const clearTimers = () => {
    Object.values(timersRef.current).forEach(clearTimeout);
    Object.values(timersRef.current).forEach(clearInterval);
    timersRef.current = {};
  };

  const teardown = useCallback(() => {
    clearTimers();
    try { mediaRef.current?.close(); } catch {}
    try { connRef.current?.close(); } catch {}
    try { peerRef.current?.destroy(); } catch {}
    mediaRef.current = null;
    connRef.current = null;
    peerRef.current = null;
    setRemoteStream(null);
    setPeerName('');
    setRttMs(null);
    setIncomingPartialSigning(null);
  }, []);

  const handlePacket = useCallback((packet) => {
    if (!packet || typeof packet !== 'object') return;
    switch (packet.type) {
      case 'PING':
        connRef.current?.send({ type: 'PONG', t: packet.t });
        break;
      case 'PONG':
        setRttMs(Math.max(1, Math.round(performance.now() - packet.t)));
        break;
      case 'HELLO':
        setPeerName(packet.name || 'Partner');
        break;
      case 'PARTIAL_SIGNING':
        setIncomingPartialSigning(packet);
        break;
      case 'COMMITTED_MESSAGE':
        setIncomingPartialSigning(null);
        setIncomingMessages((p) => [packet, ...p]);
        setLatestIncomingReply(packet);
        break;
      case 'TEXT_REPLY':
        setIncomingMessages((p) => [packet, ...p]);
        setLatestIncomingReply(packet);
        break;
      default:
    }
  }, []);

  const send = useCallback((packet) => {
    const c = connRef.current;
    if (c && c.open) {
      try { c.send(packet); } catch {}
    }
  }, []);

  const wireDataConnection = useCallback((conn, { onOpen } = {}) => {
    connRef.current = conn;
    const opened = () => {
      conn.send({ type: 'HELLO', name: nameRef.current });
      timersRef.current.ping = setInterval(() => {
        if (conn.open) conn.send({ type: 'PING', t: performance.now() });
      }, 3000);
      onOpen && onOpen();
    };
    if (conn.open) opened(); else conn.on('open', opened);
    conn.on('data', handlePacket);
    conn.on('close', () => {
      if (connRef.current !== conn) return;
      connRef.current = null;
      clearInterval(timersRef.current.ping);
      try { mediaRef.current?.close(); } catch {}
      mediaRef.current = null;
      setRemoteStream(null);
      setPeerName('');
      setRttMs(null);
      setIncomingPartialSigning(null);
      if (roleRef.current === 'host') {
        // keep the same code open so the partner can rejoin
        setNotice('Your partner left. The code is still open.');
        setPhase('waiting');
      } else {
        teardown();
        roleRef.current = null;
        setRole(null);
        setCode('');
        setNotice('The host ended the call.');
        setPhase('ended');
      }
    });
    conn.on('error', () => {});
  }, [handlePacket, teardown]);

  const attachMedia = useCallback((call) => {
    mediaRef.current = call;
    call.on('stream', (stream) => {
      setRemoteStream(stream);
      clearTimeout(timersRef.current.join);
      setError('');
      setNotice('');
      setPhase('connected');
    });
    call.on('close', () => {});
    call.on('error', () => {});
  }, []);

  /* ---------- host ---------- */
  const createCall = useCallback((attempt = 0) => {
    if (peerRef.current) return;
    setError('');
    setNotice('');
    setRole('host');
    roleRef.current = 'host';
    setPhase('creating');
    const newCode = generateCallCode();
    codeRef.current = newCode;
    setCode(newCode);

    const peer = new Peer(peerIdFor(newCode), peerOptions());
    peerRef.current = peer;

    peer.on('open', () => setPhase('waiting'));

    peer.on('connection', (conn) => {
      if (connRef.current) {
        conn.on('open', () => {
          conn.send({ type: 'BUSY' });
          setTimeout(() => conn.close(), 300);
        });
        return;
      }
      wireDataConnection(conn);
    });

    peer.on('call', (call) => {
      if (mediaRef.current || !streamRef.current) {
        call.close();
        return;
      }
      call.answer(streamRef.current);
      attachMedia(call);
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id' && attempt < 3) {
        peerRef.current = null;
        try { peer.destroy(); } catch {}
        createCall(attempt + 1);
        return;
      }
      teardown();
      peerRef.current = null;
      roleRef.current = null;
      setRole(null);
      setCode('');
      setPhase('idle');
      setError(
        err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error'
          ? 'Could not reach the call server. Check your connection and try again.'
          : 'Could not start the call. Please try again.'
      );
    });

    peer.on('disconnected', () => {
      // signalling dropped; try to restore so the code keeps working
      try { peer.reconnect(); } catch {}
    });
  }, [attachMedia, teardown, wireDataConnection]);

  /* ---------- guest ---------- */
  const joinCall = useCallback((rawCode) => {
    const clean = normalizeCallCode(rawCode);
    if (clean.length !== CODE_LENGTH) {
      setError('Enter the 6-character code.');
      return;
    }
    if (peerRef.current || !streamRef.current) {
      if (!streamRef.current) setError('Allow camera access first.');
      return;
    }
    setError('');
    setNotice('');
    setRole('guest');
    roleRef.current = 'guest';
    setCode(clean);
    codeRef.current = clean;
    setPhase('joining');

    const fail = (msg) => {
      teardown();
      peerRef.current = null;
      roleRef.current = null;
      setRole(null);
      setCode('');
      setPhase('idle');
      setError(msg);
    };

    const peer = new Peer(peerOptions());
    peerRef.current = peer;
    timersRef.current.join = setTimeout(() => fail('Could not connect. Check the code and try again.'), JOIN_TIMEOUT_MS);

    peer.on('open', () => {
      const hostId = peerIdFor(clean);
      const conn = peer.connect(hostId, { reliable: true });
      conn.on('data', (d) => {
        if (d && d.type === 'BUSY') fail('This call already has two people.');
      });
      wireDataConnection(conn, {
        onOpen: () => {
          const call = peer.call(hostId, streamRef.current);
          attachMedia(call);
        },
      });
    });

    peer.on('error', (err) => {
      if (err.type === 'peer-unavailable') fail('No call found with that code.');
      else if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error')
        fail('Could not reach the call server. Check your connection and try again.');
      else fail('Could not connect. Please try again.');
    });
  }, [attachMedia, teardown, wireDataConnection]);

  const leave = useCallback(() => {
    teardown();
    roleRef.current = null;
    setRole(null);
    setCode('');
    setError('');
    setNotice('');
    setPhase('idle');
  }, [teardown]);

  const dismissEnded = useCallback(() => {
    setNotice('');
    setPhase('idle');
    setCode('');
    setRole(null);
  }, []);

  /* ---------- keep the outgoing camera in sync ---------- */
  useEffect(() => {
    streamRef.current = localStream;
    const pc = mediaRef.current?.peerConnection;
    const track = localStream?.getVideoTracks?.()[0];
    if (pc && track) {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video' || s.track === null);
      if (sender && sender.track !== track) sender.replaceTrack(track).catch(() => {});
    }
  }, [localStream]);

  useEffect(() => () => teardown(), [teardown]);

  /* ---------- outgoing messages (same shapes the chat UI already uses) ---------- */
  const sendPartialSigning = useCallback(({ glosses, previewText }) => {
    send({ type: 'PARTIAL_SIGNING', glosses, previewText, sender: nameRef.current, timestamp: Date.now() });
  }, [send]);

  const sendCommittedSentence = useCallback((sentence) => {
    send({
      type: 'COMMITTED_MESSAGE',
      id: sentence.id || Date.now(),
      glosses: sentence.glosses || [],
      text: sentence.text || '',
      sender: nameRef.current,
      senderRole: 'signer',
      timestamp: sentence.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }, [send]);

  const sendTextReply = useCallback((text) => {
    if (!text || !text.trim()) return;
    const packet = {
      type: 'TEXT_REPLY',
      id: Date.now(),
      text: text.trim(),
      sender: nameRef.current,
      senderRole: 'peer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    send(packet);
    setIncomingMessages((p) => [packet, ...p]);
  }, [send]);

  return {
    phase,
    code,
    role,
    error,
    notice,
    peerName,
    peerPresence: { isOnline: phase === 'connected', name: peerName || 'Partner' },
    remoteStream,
    rttMs,
    connectionMode: phase === 'connected' ? 'p2p' : 'connecting',
    incomingPartialSigning,
    incomingMessages,
    latestIncomingReply,
    createCall: () => createCall(0),
    joinCall,
    leave,
    dismissEnded,
    sendPartialSigning,
    sendCommittedSentence,
    sendTextReply,
  };
}

export default useCall;
