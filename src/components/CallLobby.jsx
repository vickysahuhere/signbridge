import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, Check, Copy, Link2, Loader2, X } from 'lucide-react';
import { CODE_LENGTH, formatCallCode, normalizeCallCode } from '../call/callCode.js';

function CodeTiles({ value, active = false, size = 'lg' }) {
  const chars = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] || '');
  const cell = size === 'lg' ? 'w-11 h-14 sm:w-14 sm:h-[72px] text-3xl sm:text-4xl' : 'w-10 h-12 text-2xl';
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2" aria-hidden="true">
      {chars.map((c, i) => (
        <React.Fragment key={i}>
          {i === 3 && <span className="w-2 sm:w-3 h-[3px] rounded-full bg-[#CECECE]" />}
          <span
            className={`${cell} rounded-xl border-2 border-b-4 flex items-center justify-center font-mono font-extrabold transition-colors ${
              c
                ? 'bg-white border-[#CECECE] text-[#3C3C3C]'
                : active && i === value.length
                ? 'bg-white border-[#58CC02] border-b-[#46A302]'
                : 'bg-[#F7F7F7] border-[#E5E5E5] text-[#AFAFAF]'
            }`}
          >
            {c}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function CopyButton({ text, label, Icon }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`duo-btn !py-2.5 !px-4 !text-xs ${done ? 'duo-btn-blue' : ''}`}
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4 stroke-[2.4]" />}
      {done ? 'Copied' : label}
    </button>
  );
}

export function CallLobby({
  call,
  localStream,
  onStreamChange,
  userName,
  onNameChange,
  initialCode = '',
  onCodeConsumed,
}) {
  const { phase, code, error, notice, createCall, joinCall, leave } = call;
  const [tab, setTab] = useState(initialCode ? 'join' : 'start');
  const [entry, setEntry] = useState(initialCode);
  const [cameraError, setCameraError] = useState('');
  const [name, setName] = useState(userName);
  const videoRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const streamRef = useRef(null);

  /* camera preview — also the stream the call starts with */
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      onStreamChange(stream);
    } catch (e) {
      setCameraError(e?.name === 'NotAllowedError' ? 'Camera access is blocked.' : 'Camera not available.');
    }
  }, [onStreamChange]);

  useEffect(() => {
    startCamera();
    return () => {
      const s = streamRef.current;
      if (!s) return;
      if (phaseRef.current === 'connected') {
        // the call screen opens its own camera and swaps it in; release this one afterwards
        setTimeout(() => s.getTracks().forEach((t) => t.stop()), 4000);
      } else {
        s.getTracks().forEach((t) => t.stop());
        onStreamChange(null);
      }
    };
  }, [startCamera, onStreamChange]);

  useEffect(() => {
    if (videoRef.current && localStream) videoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (initialCode && onCodeConsumed) onCodeConsumed();
  }, [initialCode, onCodeConsumed]);

  const busy = phase === 'creating' || phase === 'waiting' || phase === 'joining';
  const cameraReady = Boolean(localStream);
  const shareUrl = code ? `${window.location.origin}${window.location.pathname}?join=${code}` : '';

  const submitJoin = (e) => {
    e?.preventDefault();
    joinCall(entry);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-auto grid md:grid-cols-[1.1fr_1fr] gap-4 sm:gap-6 items-start py-2 overflow-y-auto max-h-full">
      {/* Camera preview */}
      <section className="duo-card overflow-hidden">
        <div className="relative aspect-video bg-[#151915]">
          <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
              <Camera className="w-8 h-8 text-[#D7FFB8]" />
              <p className="text-sm font-bold text-[#CECECE]">{cameraError || 'Starting camera…'}</p>
              {cameraError && (
                <button type="button" onClick={startCamera} className="duo-btn duo-btn-blue !py-2 !text-xs">
                  Try again
                </button>
              )}
            </div>
          )}
          {cameraReady && (
            <span className="absolute left-3 bottom-3 px-2.5 py-1 rounded-full bg-[#151915]/70 text-white text-[11px] font-extrabold backdrop-blur">
              Camera ready
            </span>
          )}
        </div>
        <div className="p-4 flex items-center gap-3">
          <label htmlFor="callName" className="text-xs font-extrabold uppercase tracking-wide text-[#777777] flex-shrink-0">
            Your name
          </label>
          <input
            id="callName"
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => onNameChange(name)}
            disabled={busy}
            className="duo-input flex-1 min-w-0 !py-2 !text-sm"
          />
        </div>
      </section>

      {/* Connect panel */}
      <section className="duo-card p-5 sm:p-6">
        {notice && !busy && (
          <div className="mb-4 rounded-xl bg-[#FFF5D1] text-[#78350F] text-sm font-bold px-4 py-3">{notice}</div>
        )}

        {!busy && (
          <div className="flex p-1 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] mb-5">
            {[
              { id: 'start', label: 'Start a call' },
              { id: 'join', label: 'Join with code' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-extrabold transition-colors ${
                  tab === t.id ? 'bg-white text-[#3C3C3C] shadow-sm' : 'text-[#AFAFAF] hover:text-[#3C3C3C]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ---- start ---- */}
        {(tab === 'start' || phase === 'creating' || phase === 'waiting') && phase !== 'joining' && (
          <div>
            {!code && (
              <>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#3C3C3C]">Get a code</h2>
                <p className="mt-1.5 text-[15px] font-semibold text-[#777777]">
                  Share it with one person. Only they can join.
                </p>
                <button
                  type="button"
                  onClick={createCall}
                  disabled={!cameraReady || phase === 'creating'}
                  className="duo-btn duo-btn-blue w-full !py-3.5 !text-sm mt-6"
                >
                  {phase === 'creating' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create code
                </button>
              </>
            )}

            {code && (
              <>
                <div className="text-xs font-extrabold uppercase tracking-wide text-[#777777] mb-3">Your code</div>
                <CodeTiles value={code} />
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <CopyButton text={formatCallCode(code)} label="Copy code" Icon={Copy} />
                  <CopyButton text={shareUrl} label="Copy link" Icon={Link2} />
                </div>
                <div className="mt-6 flex items-center justify-center gap-2.5 text-sm font-bold text-[#777777]">
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="absolute inset-0 rounded-full bg-[#FFC800] " />
                    <span className="relative w-2.5 h-2.5 rounded-full bg-[#FFC800]" />
                  </span>
                  {phase === 'creating' ? 'Setting up…' : 'Waiting for your partner'}
                </div>
                <button type="button" onClick={leave} className="duo-btn w-full !py-3 !text-xs mt-6">
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* ---- join ---- */}
        {tab === 'join' && !code && phase !== 'creating' && phase !== 'waiting' && (
          <form onSubmit={submitJoin}>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#3C3C3C]">Enter the code</h2>
            <p className="mt-1.5 text-[15px] font-semibold text-[#777777]">Ask your partner for their 6-character code.</p>
            <label className="relative block mt-6 cursor-text">
              <CodeTiles value={entry} active />
              <input
                value={formatCallCode(entry)}
                onChange={(e) => setEntry(normalizeCallCode(e.target.value))}
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                aria-label="Call code"
                className="absolute inset-0 w-full h-full opacity-0 cursor-text"
              />
            </label>
            {error && <p className="mt-4 text-sm font-bold text-[#EA2B2B] text-center">{error}</p>}
            <button
              type="submit"
              disabled={entry.length !== CODE_LENGTH || !cameraReady}
              className="duo-btn duo-btn-blue w-full !py-3.5 !text-sm mt-6"
            >
              Join call <ArrowRight className="w-4 h-4 stroke-[2.6]" />
            </button>
          </form>
        )}

        {phase === 'joining' && (
          <div className="text-center py-4">
            <CodeTiles value={code} size="sm" />
            <div className="mt-6 flex items-center justify-center gap-2.5 text-sm font-bold text-[#777777]">
              <Loader2 className="w-4 h-4 animate-spin text-[#58CC02]" />
              Connecting…
            </div>
            <button type="button" onClick={leave} className="duo-btn w-full !py-3 !text-xs mt-6">
              <X className="w-4 h-4 stroke-[2.6]" /> Cancel
            </button>
          </div>
        )}

        {tab === 'start' && !code && error && (
          <p className="mt-4 text-sm font-bold text-[#EA2B2B] text-center">{error}</p>
        )}
      </section>
    </div>
  );
}

export default CallLobby;
