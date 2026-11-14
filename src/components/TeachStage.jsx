import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Circle, Hand, Plus, Trash2, X, Check, Smile, Eye, Scan, Activity, Download, Upload, SkipForward, Square } from 'lucide-react';
import { startCameraLoop } from '../vision/cameraLoop.js';
import { SanketLoader } from './SanketLoader.jsx';
import { useSmoothedLandmarks } from '../vision/useSmoothedLandmarks.js';
import { drawSkeleton } from '../vision/drawSkeleton.js';
import { getLandmarkArray } from '../vision/normalizeLandmarks.js';
import {
  addSample,
  removeSample,
  removeWord,
  exportSigns,
  importSigns,
  useCustomSigns,
  frameHasHands,
} from '../teach/customSignStore.js';
import { useCustomSignMatcher } from '../teach/useCustomSignMatcher.js';
import { ISL_LEARN_ITEMS } from '../ai/islTargetLandmarks.js';

const EYE_L = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const EYE_R = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];

const RECORD_MS = 2200;
const TARGET_SAMPLES = 5;
const GUIDE_SAMPLES = 3;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ALPHABET_ITEMS = ISL_LEARN_ITEMS.filter((i) => i.category === 'alphabet');
const BASIC_WORDS = ['Thank You', 'Please', 'Sorry / Apology', 'Yes / Agree', 'No / Disagree', 'Help / Assist', 'Eat / Food', 'Drink / Water', 'Stop / Wait', 'Name', 'Namaste'];
const WORD_ITEMS = BASIC_WORDS.map((n) => ISL_LEARN_ITEMS.find((i) => i.name === n && i.image)).filter(Boolean);
const GUIDE_SETS = [
  { id: 'alphabet', label: 'Alphabet', items: ALPHABET_ITEMS, ms: 1400 },
  { id: 'words', label: 'Basic words', items: WORD_ITEMS, ms: 2200 },
];

/* ---------- overlay drawing ---------- */

function loop(ctx, pts, idx, color, width = 2.5) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.beginPath();
  let started = false;
  for (const i of idx) {
    const p = pts[i];
    if (!p) continue;
    if (!started) {
      ctx.moveTo(p.x * W, p.y * H);
      started = true;
    } else ctx.lineTo(p.x * W, p.y * H);
  }
  ctx.closePath();
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

function centroid(pts, idx, W, H) {
  let x = 0, y = 0, n = 0, top = Infinity, bottom = -Infinity;
  for (const i of idx) {
    const p = pts[i];
    if (!p) continue;
    x += p.x; y += p.y; n++;
    top = Math.min(top, p.y);
    bottom = Math.max(bottom, p.y);
  }
  return n ? { x: (x / n) * W, y: (y / n) * H, top: top * H, bottom: bottom * H } : null;
}

// The canvas is mirrored with CSS, so labels are flipped back before drawing.
function label(ctx, text, x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(-1, 1);
  ctx.font = '800 20px Nunito, system-ui, sans-serif';
  const w = ctx.measureText(text).width + 22;
  const h = 30;
  ctx.fillStyle = 'rgba(10, 18, 48, 0.78)';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 1);
  ctx.restore();
}

export function drawBodyOverlay(ctx, lm) {
  drawSkeleton(ctx, lm, { showGuide: false, showFace: false, showPose: true });
  if (!lm) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const face = getLandmarkArray(lm.faceLandmarks);
  const pose = getLandmarkArray(lm.poseLandmarks);
  const lh = getLandmarkArray(lm.leftHandLandmarks);
  const rh = getLandmarkArray(lm.rightHandLandmarks);

  if (face.length > 400) {
    loop(ctx, face, EYE_L, '#D7FFB8');
    loop(ctx, face, EYE_R, '#D7FFB8');
    loop(ctx, face, LIPS, '#58CC02', 3);
    const le = centroid(face, EYE_L, W, H);
    const re = centroid(face, EYE_R, W, H);
    if (le && re) label(ctx, 'Eyes', (le.x + re.x) / 2, Math.min(le.top, re.top) - 34, '#D7FFB8');
    const m = centroid(face, LIPS, W, H);
    if (m) label(ctx, 'Mouth', m.x, m.bottom + 30, '#58CC02');
  }

  const s1 = pose[11];
  const s2 = pose[12];
  if (s1 && s2 && (s1.visibility ?? 1) > 0.3 && (s2.visibility ?? 1) > 0.3) {
    ctx.save();
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s1.x * W, s1.y * H);
    ctx.lineTo(s2.x * W, s2.y * H);
    ctx.stroke();
    for (const p of [s1, s2]) {
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#58CC02';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
    label(ctx, 'Shoulders', ((s1.x + s2.x) / 2) * W, ((s1.y + s2.y) / 2) * H + 34, '#FFFFFF');
  }

  if (lh[0]) label(ctx, 'Left hand', lh[0].x * W, lh[0].y * H + 36, '#58CC02');
  if (rh[0]) label(ctx, 'Right hand', rh[0].x * W, rh[0].y * H + 36, '#D7FFB8');
}

/* ---------- small UI pieces ---------- */

function TrackChip({ Icon, text, on }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border-2 transition-all ${
        on
          ? 'bg-[#EEFDE5] text-[#58CC02] border-[#D7FFB8] shadow-[0_2px_6px_rgba(15,107,92,0.18)]'
          : 'bg-white text-[#AFAFAF] border-[#E5E5E5]'
      }`}
    >
      <Icon className="w-3.5 h-3.5 stroke-[2.4]" />
      {text}
      <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-[#58CC02]' : 'bg-[#E5E5E5]'}`} />
    </span>
  );
}

/* ---------- main component ---------- */

export function TeachStage({ onFrame, latestLandmarks, latestNormalizedFeatures, isWorkerReady = false, initialWord = '' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const signs = useCustomSigns();
  const words = Object.keys(signs);

  const [tab, setTab] = useState(initialWord ? 'custom' : 'guided');
  const [word, setWord] = useState(initialWord);
  const [phase, setPhase] = useState('idle'); // idle | countdown | recording
  const [count, setCount] = useState(3);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const framesRef = useRef([]);
  const cancelRef = useRef(false);

  // guided session
  const [setId, setSetId] = useState('alphabet');
  const [guide, setGuide] = useState(null); // { i, rep } while running
  const guideStopRef = useRef(false);
  const guideSkipRef = useRef(false);

  const matcher = useCustomSignMatcher({
    features: latestNormalizedFeatures,
    signs,
    enabled: testMode && phase === 'idle',
  });

  /* camera */
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try { await videoRef.current.play(); } catch (playErr) { if (playErr?.name !== 'AbortError') throw playErr; }
        setCameraOn(true);
      }
    } catch (err) {
      setCameraError(
        err?.name === 'NotAllowedError' ? 'Camera permission denied.' : `Camera error: ${err?.message || 'unknown'}`
      );
      setCameraOn(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    const v = videoRef.current;
    return () => {
      guideStopRef.current = true;
      cancelRef.current = true;
      const s = v?.srcObject;
      if (s) s.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;
    const stop = startCameraLoop(videoRef.current, (video, ts) => {
      const c = canvasRef.current;
      if (c && video.videoWidth && (c.width !== video.videoWidth || c.height !== video.videoHeight)) {
        c.width = video.videoWidth;
        c.height = video.videoHeight;
      }
      onFrame && onFrame(video, ts);
    });
    return stop;
  }, [cameraOn, onFrame]);

  const shownLandmarks = useSmoothedLandmarks(latestLandmarks);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    drawBodyOverlay(c.getContext('2d'), shownLandmarks);
  }, [shownLandmarks]);

  /* capture frames while recording */
  useEffect(() => {
    if (phase === 'recording' && latestNormalizedFeatures) {
      framesRef.current.push(Float32Array.from(latestNormalizedFeatures));
    }
  }, [latestNormalizedFeatures, phase]);

  /** countdown -> record -> save. Resolves 'ok' | 'fail' | 'cancel'. */
  const captureSample = useCallback(
    (name, { ms = RECORD_MS, countdown = 3 } = {}) =>
      new Promise((resolve) => {
        cancelRef.current = false;
        setNotice(null);
        setPhase('countdown');
        let n = countdown;
        setCount(n);
        const cd = setInterval(() => {
          if (cancelRef.current) {
            clearInterval(cd);
            setPhase('idle');
            resolve('cancel');
            return;
          }
          n -= 1;
          if (n > 0) {
            setCount(n);
            return;
          }
          clearInterval(cd);
          framesRef.current = [];
          setPhase('recording');
          const t0 = performance.now();
          const tick = setInterval(() => {
            if (cancelRef.current) {
              clearInterval(tick);
              framesRef.current = [];
              setPhase('idle');
              setProgress(0);
              resolve('cancel');
              return;
            }
            const p = Math.min(1, (performance.now() - t0) / ms);
            setProgress(p);
            if (p < 1) return;
            clearInterval(tick);
            const all = framesRef.current;
            framesRef.current = [];
            const idx = all.map((f, i) => (frameHasHands(f) ? i : -1)).filter((i) => i >= 0);
            let ok = false;
            if (idx.length >= 8) {
              addSample(name, all.slice(idx[0], idx[idx.length - 1] + 1));
              ok = true;
            }
            setPhase('idle');
            setProgress(0);
            resolve(ok ? 'ok' : 'fail');
          }, 50);
        }, 800);
      }),
    []
  );

  const startCustom = async () => {
    const name = word.trim().toUpperCase();
    if (!name || phase !== 'idle') return;
    setWord(name);
    setTestMode(false);
    const r = await captureSample(name);
    if (r === 'ok') setNotice({ kind: 'ok', text: 'Sample saved' });
    if (r === 'fail') setNotice({ kind: 'error', text: 'Hands not tracked. Keep them in view and try again.' });
  };

  const activeSet = GUIDE_SETS.find((s) => s.id === setId);

  const runGuided = async (startAt = 0) => {
    if (guide) return;
    guideStopRef.current = false;
    setTestMode(false);
    const items = activeSet.items;
    for (let i = startAt; i < items.length && !guideStopRef.current; i++) {
      const label = items[i].label;
      guideSkipRef.current = false;
      let have = (signs[label]?.samples.length) || 0;
      let fails = 0;
      while (have < GUIDE_SAMPLES && !guideStopRef.current && !guideSkipRef.current) {
        setGuide({ i, rep: have });
        const r = await captureSample(label, { ms: activeSet.ms, countdown: 2 });
        if (r === 'ok') { have += 1; fails = 0; await wait(450); }
        else if (r === 'fail') {
          fails += 1;
          setNotice({ kind: 'error', text: 'Hands not tracked' });
          if (fails >= 3) break;
          await wait(700);
        } else break;
      }
    }
    setGuide(null);
    setPhase('idle');
    if (!guideStopRef.current) {
      setNotice({ kind: 'ok', text: `${activeSet.label} trained` });
      setTestMode(true);
    }
  };

  const stopGuided = () => {
    guideStopRef.current = true;
    cancelRef.current = true;
    setGuide(null);
  };
  const skipGuided = () => {
    guideSkipRef.current = true;
    cancelRef.current = true;
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  /* tracking status */
  const face = getLandmarkArray(latestLandmarks?.faceLandmarks);
  const pose = getLandmarkArray(latestLandmarks?.poseLandmarks);
  const tracked = {
    eyes: face.length > 400,
    mouth: face.length > 400,
    shoulders: Boolean(pose[11] && pose[12] && (pose[11].visibility ?? 1) > 0.3 && (pose[12].visibility ?? 1) > 0.3),
    left: getLandmarkArray(latestLandmarks?.leftHandLandmarks).length > 0,
    right: getLandmarkArray(latestLandmarks?.rightHandLandmarks).length > 0,
  };

  const current = signs[word.trim().toUpperCase()];
  const ready = isWorkerReady && cameraOn;
  const canRecord = ready && word.trim().length > 0 && phase === 'idle' && !guide;
  const guideItem = guide ? activeSet.items[guide.i] : null;
  const trainedCount = activeSet.items.filter((it) => (signs[it.label]?.samples.length || 0) >= GUIDE_SAMPLES).length;
  const firstIncomplete = Math.max(0, activeSet.items.findIndex((it) => (signs[it.label]?.samples.length || 0) < GUIDE_SAMPLES));

  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try { importSigns(txt); setNotice({ kind: 'ok', text: 'Imported' }); }
      catch { setNotice({ kind: 'error', text: 'Not a valid file' }); }
    });
    e.target.value = '';
  };
  const onExport = () => {
    const url = URL.createObjectURL(new Blob([exportSigns()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanket-signs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const NoticeLine = notice && (
    <span className={`text-xs font-extrabold flex items-center gap-1 ${notice.kind === 'ok' ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
      {notice.kind === 'ok' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5 stroke-[3]" />}
      {notice.text}
    </span>
  );

  return (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 h-full min-h-0 overflow-y-auto md:overflow-hidden">
      {/* Camera */}
      <div className="duo-card flex-1 min-w-0 min-h-[320px] md:min-h-0 flex flex-col overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-[#E5E5E5] flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          <span className="font-extrabold text-[15px] text-[#3C3C3C]">Camera</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <TrackChip Icon={Eye} text="Eyes" on={tracked.eyes} />
            <TrackChip Icon={Smile} text="Mouth" on={tracked.mouth} />
            <TrackChip Icon={Scan} text="Shoulders" on={tracked.shoulders} />
            <TrackChip Icon={Hand} text="Left" on={tracked.left} />
            <TrackChip Icon={Hand} text="Right" on={tracked.right} />
          </div>
        </div>

        <div className="relative flex-1 min-h-0 bg-[#151915] flex items-center justify-center overflow-hidden">
          {cameraOn && !isWorkerReady && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-[#F5F4ED]">
              <SanketLoader label="Loading hand tracking" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#11131C]/60">Loading hand tracking</span>
            </div>
          )}
          <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-contain -scale-x-100" />
          <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full object-contain -scale-x-100 pointer-events-none z-10" />

          {!cameraOn && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-center p-6">
              <Camera className="w-9 h-9 text-[#D7FFB8]" />
              <p className="text-sm font-bold text-[#CECECE]">{cameraError || 'Starting camera…'}</p>
              {cameraError && <button type="button" onClick={startCamera} className="duo-btn duo-btn-blue">Try again</button>}
            </div>
          )}

          {phase === 'countdown' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#151915]/40">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl font-extrabold text-[#58CC02]">{count}</div>
            </div>
          )}

          {phase === 'recording' && (
            <div className="absolute left-0 right-0 bottom-0 z-30 p-4 bg-gradient-to-t from-[#151915]/80 to-transparent">
              <div className="flex items-center gap-2 mb-2 text-white text-xs font-extrabold uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B]" />
                Hold “{guideItem ? guideItem.label : word}”
              </div>
              <div className="h-2 rounded-full bg-white/25 overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          )}

          {testMode && phase === 'idle' && !guide && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
              <div className={`px-5 py-2 rounded-xl font-extrabold text-lg ${matcher.best ? 'bg-[#58CC02] text-white' : 'bg-white/90 text-[#AFAFAF]'}`}>
                {matcher.best ? matcher.best.word.replace(/_/g, ' ') : '…'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel */}
      <aside className="duo-card w-full md:w-[360px] lg:w-[400px] flex-shrink-0 flex flex-col min-h-0 bg-white overflow-hidden">
        <div className="p-3 border-b border-[#E5E5E5] flex-shrink-0">
          <div className="flex p-1 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5]">
            {[{ id: 'guided', label: 'Guided' }, { id: 'custom', label: 'Your own' }].map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={Boolean(guide)}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-extrabold transition-colors ${tab === t.id ? 'bg-white text-[#3C3C3C] shadow-sm' : 'text-[#AFAFAF] hover:text-[#3C3C3C]'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'guided' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4">
            {!guide && (
              <>
                <div className="flex gap-2">
                  {GUIDE_SETS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSetId(s.id)}
                      className={`duo-btn !py-2 !px-4 !text-xs ${setId === s.id ? 'duo-btn-blue' : ''}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#777777] mb-1.5">
                    <span>{trainedCount} of {activeSet.items.length} trained</span>
                    {NoticeLine}
                  </div>
                  <div className="duo-progress-track !h-2.5">
                    <div className="duo-progress-fill" style={{ width: `${(trainedCount / activeSet.items.length) * 100}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!ready || trainedCount === activeSet.items.length}
                  onClick={() => runGuided(firstIncomplete)}
                  className="duo-btn duo-btn-blue w-full !py-3.5 !text-sm"
                >
                  {trainedCount === 0 ? 'Start' : trainedCount === activeSet.items.length ? 'All trained' : 'Continue'}
                </button>
                <div className="flex flex-wrap gap-1.5">
                  {activeSet.items.map((it, i) => {
                    const n = signs[it.label]?.samples.length || 0;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        disabled={!ready}
                        onClick={() => runGuided(i)}
                        title={n ? `${n} samples` : 'Not trained'}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-colors ${
                          n >= GUIDE_SAMPLES
                            ? 'bg-[#EEFDE5] text-[#58CC02] border-[#D7FFB8]'
                            : n > 0
                            ? 'bg-[#FFF5D1] text-[#78350F] border-[#FFE066]'
                            : 'bg-white text-[#777777] border-[#E5E5E5] hover:border-[#D7FFB8]'
                        }`}
                      >
                        {it.label.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {guide && guideItem && (
              <div className="flex flex-col items-center text-center gap-3">
                <div className="text-xs font-extrabold text-[#777777]">{guide.i + 1} of {activeSet.items.length}</div>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center">
                  <img src={guideItem.image} alt={guideItem.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-3xl font-extrabold text-[#3C3C3C] leading-none">{guideItem.label.replace(/_/g, ' ')}</div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: GUIDE_SAMPLES }).map((_, k) => (
                    <span key={k} className={`w-3 h-3 rounded-full border-2 ${k < guide.rep ? 'bg-[#58CC02] border-[#46A302]' : k === guide.rep ? 'bg-white border-[#58CC02]' : 'bg-[#F7F7F7] border-[#E5E5E5]'}`} />
                  ))}
                </div>
                <div className="h-5">{NoticeLine}</div>
                <div className="flex gap-2 w-full">
                  <button type="button" onClick={skipGuided} className="duo-btn flex-1 !py-2.5 !text-xs"><SkipForward className="w-4 h-4 stroke-[2.4]" />Skip</button>
                  <button type="button" onClick={stopGuided} className="duo-btn duo-btn-coral flex-1 !py-2.5 !text-xs"><Square className="w-3.5 h-3.5 fill-current" />Stop</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'custom' && (
          <>
            <div className="p-4 flex flex-col gap-3 flex-shrink-0">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canRecord && startCustom()}
                placeholder="Word or phrase"
                aria-label="Word or phrase"
                maxLength={24}
                className="duo-input w-full"
                disabled={phase !== 'idle'}
              />
              <button type="button" onClick={startCustom} disabled={!canRecord} className="duo-btn duo-btn-blue w-full !py-3.5 !text-sm">
                <Circle className="w-4 h-4 fill-current stroke-[2.6]" />
                {phase === 'idle' ? 'Record sample' : phase === 'countdown' ? 'Get ready…' : 'Recording…'}
              </button>
              <div className="flex items-center justify-between min-h-[22px]">
                <div className="flex items-center gap-1.5" aria-label="Samples for this word">
                  {Array.from({ length: TARGET_SAMPLES }).map((_, i) => (
                    <span key={i} className={`w-3 h-3 rounded-full border-2 ${i < (current?.samples.length || 0) ? 'bg-[#58CC02] border-[#46A302]' : 'bg-[#F7F7F7] border-[#E5E5E5]'}`} />
                  ))}
                </div>
                {NoticeLine}
              </div>
            </div>
          </>
        )}

        <div className="px-4 py-2.5 border-y border-[#E5E5E5] flex items-center justify-between flex-shrink-0 bg-[#F7F7F7]">
          <span className="text-xs font-extrabold uppercase tracking-wide text-[#777777]">Trained{words.length ? ` · ${words.length}` : ''}</span>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onExport} disabled={!words.length} className="w-8 h-8 rounded-lg text-[#777777] hover:bg-[#EEFDE5] hover:text-[#58CC02] disabled:opacity-40 flex items-center justify-center" aria-label="Export" title="Export"><Download className="w-4 h-4 stroke-[2.4]" /></button>
            <label className="w-8 h-8 rounded-lg text-[#777777] hover:bg-[#EEFDE5] hover:text-[#58CC02] flex items-center justify-center cursor-pointer" title="Import" aria-label="Import">
              <Upload className="w-4 h-4 stroke-[2.4]" />
              <input type="file" accept="application/json" className="hidden" onChange={onImport} />
            </label>
            <button type="button" onClick={() => setTestMode((t) => !t)} disabled={!words.length || phase !== 'idle' || Boolean(guide)} className={`duo-btn !py-1.5 !px-3 !text-[11px] ${testMode ? 'duo-btn-blue' : ''}`}>
              <Activity className="w-3.5 h-3.5 stroke-[2.4]" />
              Test
            </button>
          </div>
        </div>

        {tab === 'custom' && (
          <div className="flex-1 min-h-[120px] overflow-y-auto p-3 flex flex-col gap-2">
            {words.length === 0 && <div className="m-auto text-center text-sm font-bold text-[#AFAFAF] py-6">Nothing yet</div>}
            {words.map((w) => {
              const score = testMode ? matcher.ranking.find((r) => r.word === w) : null;
              const isBest = testMode && matcher.best?.word === w;
              return (
                <div key={w} className={`rounded-xl border px-3 py-2.5 ${isBest ? 'border-[#58CC02] bg-[#EEFDE5]' : 'border-[#E5E5E5] bg-white'}`}>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setWord(w)} className="flex-1 min-w-0 text-left font-extrabold text-[#3C3C3C] truncate" title="Add more samples">{w.replace(/_/g, ' ')}</button>
                    {score && <span className="text-[11px] font-extrabold text-[#58CC02]">{Math.round(score.confidence * 100)}%</span>}
                    <button type="button" onClick={() => setWord(w)} className="w-7 h-7 rounded-lg text-[#777777] hover:bg-[#EEFDE5] hover:text-[#58CC02] flex items-center justify-center" aria-label={`Add sample to ${w}`}><Plus className="w-4 h-4 stroke-[2.6]" /></button>
                    <button type="button" onClick={() => removeWord(w)} className="w-7 h-7 rounded-lg text-[#AFAFAF] hover:bg-[#FFDFDF] hover:text-[#FF4B4B] flex items-center justify-center" aria-label={`Delete ${w}`}><Trash2 className="w-4 h-4 stroke-[2.4]" /></button>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {signs[w].samples.map((_, i) => (
                      <button key={i} type="button" onClick={() => removeSample(w, i)} className="group h-6 px-2 rounded-full bg-[#EEFDE5] text-[#58CC02] text-[10px] font-extrabold hover:bg-[#FFDFDF] hover:text-[#FF4B4B] flex items-center gap-1" aria-label={`Delete sample ${i + 1}`}>
                        {i + 1}<X className="w-2.5 h-2.5 stroke-[3] opacity-0 group-hover:opacity-100 -mr-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab === 'guided' && !guide && <div className="flex-shrink-0 h-2" />}
      </aside>
    </div>
  );
}

export default TeachStage;
