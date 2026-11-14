import React, { useEffect, useRef, useState } from 'react';

const BG = '#F5F4ED'; // matches the video's own background

/**
 * Brand intro. Plays once every time the site is opened, then fades out.
 * Tap anywhere or press Skip / Esc / Enter to leave early. If the browser blocks
 * autoplay or the video can't load, it steps aside instead of getting in the way.
 */
export function SplashIntro() {
  const [phase, setPhase] = useState(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'gone';
    } catch {}
    return 'playing';
  });
  const ref = useRef(null);
  const portrait = typeof window !== 'undefined' && window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
  const base = portrait ? '/brand/splash-mobile' : '/brand/splash-web';

  const finish = () => setPhase((p) => (p === 'playing' ? 'leaving' : p));

  useEffect(() => {
    if (phase !== 'playing') return;
    const v = ref.current;
    if (v) {
      const p = v.play();
      if (p && p.catch) p.catch(() => finish());
    }
    const safety = setTimeout(finish, 9000);
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish(); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(safety); window.removeEventListener('keydown', onKey); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const t = setTimeout(() => setPhase('gone'), 450);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div
      onClick={finish}
      role="presentation"
      style={{ background: BG, opacity: phase === 'leaving' ? 0 : 1, transition: 'opacity 450ms ease' }}
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer"
    >
      <video
        ref={ref}
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={finish}
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: BG }}
      >
        <source src={`${base}.mp4`} type="video/mp4" />
        <source src={`${base}.webm`} type="video/webm" onError={finish} />
      </video>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); finish(); }}
        className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#11131C]/70 hover:text-[#11131C] bg-white/70 hover:bg-white border border-[#11131C]/10"
      >
        Skip
      </button>
    </div>
  );
}
