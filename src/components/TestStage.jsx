import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Activity,
  ClipboardCheck,
  Play,
  RotateCcw,
  SkipForward,
  Eye,
  Trophy,
  Flame,
  Check,
  X,
  GraduationCap,
  Timer,
} from 'lucide-react';
import { startCameraLoop } from '../vision/cameraLoop.js';
import { SanketLoader } from './SanketLoader.jsx';
import { useSmoothedLandmarks } from '../vision/useSmoothedLandmarks.js';
import { drawBodyOverlay } from './TeachStage.jsx';
import { useCustomSigns } from '../teach/customSignStore.js';
import { useCustomSignMatcher } from '../teach/useCustomSignMatcher.js';
import { ISL_LEARN_ITEMS } from '../ai/islTargetLandmarks.js';
import { CORE_PATH_GLOSSES } from '../ai/islCourseCurriculum.js';

const QUESTIONS_PER_ROUND = 10;
const SECONDS_PER_QUESTION = 10;
const norm = (x) => (x || '').toUpperCase().replace(/[_\s]+/g, '_');
const pretty = (w) => (w || '').replace(/_/g, ' ');
const isLetter = (w) => w.length === 1;

const LESSON_BY_KEY = new Map(ISL_LEARN_ITEMS.map((i) => [norm(i.label), i]));

const KINDS = [
  { id: 'all', label: 'All' },
  { id: 'letters', label: 'A–Z' },
  { id: 'words', label: 'Words' },
];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex items-center bg-[#F7F7F7] p-0.5 rounded-xl border-2 border-[#E5E5E5] flex-shrink-0">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
            value === o.id
              ? 'bg-[#FFC800] text-[#78350F] border-2 border-[#FFC800] border-b-[3px] border-b-[#E5A500]'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          {o.Icon ? <o.Icon className="w-3.5 h-3.5 stroke-[2.5]" /> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ onGoTeach }) {
  return (
    <div className="duo-card p-6 sm:p-8 max-w-md mx-auto my-auto text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF5D1] border-2 border-[#FFC800] border-b-[4px] flex items-center justify-center">
        <ClipboardCheck className="w-7 h-7 text-[#78350F] stroke-[2.4]" />
      </div>
      <h2 className="mt-4 text-xl font-black text-[#3C3C3C]">Nothing to test yet</h2>
      <p className="mt-1.5 text-sm font-bold text-[#777777]">
        Testing checks Sanket against the signs you taught it. Record a few letters or words first.
      </p>
      <button type="button" onClick={onGoTeach} className="duo-btn duo-btn-green w-full !py-3 text-sm font-black mt-5">
        <GraduationCap className="w-4 h-4 stroke-[2.6]" />
        <span>Go to Teach</span>
      </button>
    </div>
  );
}

export function TestStage({ onFrame, latestLandmarks, latestNormalizedFeatures, isWorkerReady = false, onGoTeach, engineLetters = [], engineWords = [] }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const signs = useCustomSigns();
  // Testable signs = ones you trained + the built-in ISL engine's signs (A-Z and the course words).
  const trained = useMemo(() => {
    const set = new Set(Object.keys(signs).map(norm));
    for (let c = 65; c <= 90; c++) set.add(String.fromCharCode(c));
    CORE_PATH_GLOSSES.forEach((g) => set.add(norm(g)));
    return [...set];
  }, [signs]);

  const [view, setView] = useState('live'); // 'live' | 'quiz'
  const [kind, setKind] = useState('all');

  const pool = useMemo(
    () => trained.filter((w) => (kind === 'all' ? true : kind === 'letters' ? isLetter(w) : !isLetter(w))),
    [trained, kind]
  );

  /* ---------- quiz state ---------- */
  const [quiz, setQuiz] = useState({ status: 'idle', queue: [], i: 0, score: 0, streak: 0, bestStreak: 0, results: [] });
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [flash, setFlash] = useState(null); // { ok, text }
  const [showHint, setShowHint] = useState(false);
  const [lastWrong, setLastWrong] = useState(null);
  const quizRef = useRef(quiz);
  quizRef.current = quiz;
  const advanceTimer = useRef(null);
  const askedAt = useRef(0);
  const busyRef = useRef(false);

  const target = quiz.status === 'running' ? quiz.queue[quiz.i] : null;

  const finishOrNext = useCallback((ok) => {
    const q = quizRef.current;
    if (q.status !== 'running' || busyRef.current) return;
    busyRef.current = true;
    const word = q.queue[q.i];
    const took = Math.min(SECONDS_PER_QUESTION, (performance.now() - askedAt.current) / 1000);
    const results = [...q.results, { word, ok, took }];
    const streak = ok ? q.streak + 1 : 0;
    const next = {
      ...q,
      results,
      score: q.score + (ok ? 1 : 0),
      streak,
      bestStreak: Math.max(q.bestStreak, streak),
    };
    setFlash({ ok, text: ok ? 'Correct!' : `Missed ${pretty(word)}` });
    setLastWrong(null);
    setShowHint(false);
    setQuiz({ ...next, status: 'between' });
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setFlash(null);
      if (q.i + 1 >= q.queue.length) {
        busyRef.current = false;
        setQuiz({ ...next, status: 'done' });
      } else {
        askedAt.current = performance.now();
        busyRef.current = false;
        setTimeLeft(SECONDS_PER_QUESTION);
        setQuiz({ ...next, i: q.i + 1, status: 'running' });
      }
    }, ok ? 900 : 1300);
  }, []);

  const startQuiz = () => {
    if (!pool.length) return;
    // repeat the pool if it is shorter than a round, never twice in a row
    let queue = [];
    while (queue.length < QUESTIONS_PER_ROUND) {
      const batch = shuffle(pool);
      if (queue.length && batch[0] === queue[queue.length - 1] && batch.length > 1) batch.push(batch.shift());
      queue = queue.concat(batch);
    }
    queue = queue.slice(0, QUESTIONS_PER_ROUND);
    askedAt.current = performance.now();
    busyRef.current = false;
    setTimeLeft(SECONDS_PER_QUESTION);
    setFlash(null);
    setShowHint(false);
    setLastWrong(null);
    setQuiz({ status: 'running', queue, i: 0, score: 0, streak: 0, bestStreak: 0, results: [] });
  };

  const stopQuiz = () => {
    clearTimeout(advanceTimer.current);
    busyRef.current = false;
    setFlash(null);
    setQuiz({ status: 'idle', queue: [], i: 0, score: 0, streak: 0, bestStreak: 0, results: [] });
  };

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  // countdown for the current question
  useEffect(() => {
    if (quiz.status !== 'running') return;
    const id = setInterval(() => {
      const left = SECONDS_PER_QUESTION - (performance.now() - askedAt.current) / 1000;
      if (left <= 0) {
        clearInterval(id);
        setTimeLeft(0);
        finishOrNext(false);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [quiz.status, quiz.i, finishOrNext]);

  // changing the sign set mid-quiz would make the questions meaningless
  useEffect(() => {
    if (quizRef.current.status !== 'idle') stopQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, view]);

  /* ---------- recognition ---------- */
  const matcher = useCustomSignMatcher({
    features: latestNormalizedFeatures,
    signs,
    enabled: true,
    kind: kind === 'letters' ? 'letters' : kind === 'words' ? 'words' : null,
    onConfirm: (word) => {
      const q = quizRef.current;
      if (q.status !== 'running') return;
      if (norm(word) === norm(q.queue[q.i])) finishOrNext(true);
      else setLastWrong(word);
    },
  });

  // Built-in engine: its top live guess (or the sign's own checker) also counts as an answer.
  const engineTop = (kind === 'letters' ? engineLetters : kind === 'words' ? engineWords : [...engineLetters, ...engineWords])
    .slice().sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
  const engineHits = useRef(0);
  useEffect(() => {
    const q = quizRef.current;
    if (q.status !== 'running') { engineHits.current = 0; return; }
    const target = norm(q.queue[q.i]);
    const item = LESSON_BY_KEY.get(target);
    let ok = Boolean(engineTop && norm(engineTop.label) === target && (engineTop.confidence || 0) >= 0.78);
    if (!ok && item?.evaluate) {
      const r = item.evaluate(latestLandmarks, 0);
      ok = Boolean(r?.isMatched && (r.matchScore ?? 100) >= 75);
    }
    engineHits.current = ok ? engineHits.current + 1 : 0;
    if (engineHits.current >= 4) { engineHits.current = 0; finishOrNext(true); }
  }, [engineTop, latestLandmarks, finishOrNext]);

  const best = matcher.best;
  const ranking = matcher.ranking.filter((r) => (kind === 'all' ? true : kind === 'letters' ? isLetter(r.word) : !isLetter(r.word)));

  /* ---------- camera ---------- */
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 }, facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          if (playErr?.name !== 'AbortError') throw playErr;
        }
        setCameraOn(true);
      }
    } catch (err) {
      setCameraError(err?.name === 'NotAllowedError' ? 'Camera permission denied.' : `Camera error: ${err?.message || 'unknown'}`);
      setCameraOn(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    const v = videoRef.current;
    return () => {
      const s = v?.srcObject;
      if (s) s.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;
    return startCameraLoop(videoRef.current, (video, ts) => {
      const c = canvasRef.current;
      if (c && video.videoWidth && (c.width !== video.videoWidth || c.height !== video.videoHeight)) {
        c.width = video.videoWidth;
        c.height = video.videoHeight;
      }
      onFrame && onFrame(video, ts);
    });
  }, [cameraOn, onFrame]);

  const shownLandmarks = useSmoothedLandmarks(latestLandmarks);
  useEffect(() => {
    const c = canvasRef.current;
    if (c) drawBodyOverlay(c.getContext('2d'), shownLandmarks);
  }, [shownLandmarks]);

  const hasHands = Boolean(
    (latestLandmarks?.leftHandLandmarks?.length || 0) + (latestLandmarks?.rightHandLandmarks?.length || 0)
  );

  if (!trained.length) return <EmptyState onGoTeach={onGoTeach} />;

  const lesson = target ? LESSON_BY_KEY.get(norm(target)) : null;
  const done = quiz.status === 'done';
  const accuracy = quiz.results.length ? Math.round((quiz.score / quiz.results.length) * 100) : 0;
  const missed = [...new Set(quiz.results.filter((r) => !r.ok).map((r) => r.word))];

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 overflow-y-auto md:overflow-hidden">
      {/* Header */}
      <div className="duo-card px-3 sm:px-4 py-2 flex items-center justify-between gap-2 flex-wrap flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5D1] border-2 border-[#FFC800] flex items-center justify-center flex-shrink-0">
            <ClipboardCheck className="w-4 h-4 text-[#78350F] stroke-[2.6]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-base text-[#3C3C3C] leading-tight">Testing</h2>
            <p className="text-[11px] font-bold text-zinc-500 leading-tight truncate">
              {trained.length} testable signs · built-in AI + yours
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { id: 'live', label: 'Live view', Icon: Eye },
              { id: 'quiz', label: 'Quiz', Icon: Trophy },
            ]}
          />
          <Segmented value={kind} onChange={setKind} options={KINDS} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">
        {/* Camera */}
        <div className="duo-card overflow-hidden flex flex-col md:flex-1 min-h-0 flex-shrink-0">
          <div className="relative bg-black aspect-video md:aspect-auto md:flex-1 min-h-0 flex items-center justify-center">
            <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-contain -scale-x-100" />
            <canvas ref={canvasRef} width={1280} height={720} className="absolute inset-0 w-full h-full object-contain -scale-x-100 pointer-events-none" />

            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6 bg-[#18181B]">
                <Camera className="w-8 h-8 text-[#D7FFB8]" />
                <p className="text-sm font-bold text-[#CECECE]">{cameraError || 'Starting camera…'}</p>
                {cameraError && (
                  <button type="button" onClick={startCamera} className="duo-btn duo-btn-blue !py-2 !text-xs">
                    Try again
                  </button>
                )}
              </div>
            )}
            {cameraOn && !isWorkerReady && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-[#F5F4ED]">
                <SanketLoader label="Loading hand tracking" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#11131C]/60">Loading hand tracking</span>
              </div>
            )}

            {/* Quiz prompt on the camera */}
            {view === 'quiz' && quiz.status === 'running' && target && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[min(92%,360px)]">
                <div className="duo-card bg-white/95 backdrop-blur px-4 py-2.5 text-center">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Question {quiz.i + 1} of {quiz.queue.length}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-[#3C3C3C] leading-tight">
                    Sign <span className="text-[#58CC02]">{pretty(target)}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-[#E5E5E5] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-100 ${timeLeft < 3 ? 'bg-[#FF4B4B]' : 'bg-[#58CC02]'}`}
                      style={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
                    />
                  </div>
                  {lastWrong && (
                    <div className="mt-1 text-[11px] font-bold text-[#EA2B2B]">That looked like {pretty(lastWrong)}</div>
                  )}
                </div>
              </div>
            )}
            {flash && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div
                  className={`px-6 py-3 rounded-3xl border-2 border-b-[5px] text-2xl font-black flex items-center gap-2 ${
                    flash.ok ? 'bg-[#EEFDE5] border-[#58CC02] text-[#2F7202]' : 'bg-[#FFDFDF] border-[#FF4B4B] text-[#EA2B2B]'
                  }`}
                >
                  {flash.ok ? <Check className="w-6 h-6 stroke-[3.5]" /> : <X className="w-6 h-6 stroke-[3.5]" />}
                  {flash.text}
                </div>
              </div>
            )}

            {/* Live read-out chip */}
            {view === 'live' && cameraOn && isWorkerReady && (
              <div className="absolute left-3 bottom-3 z-20">
                <div
                  className={`px-3 py-1.5 rounded-xl border-2 border-b-[3px] text-sm font-black ${
                    best
                      ? 'bg-[#EEFDE5] border-[#58CC02] text-[#2F7202]'
                      : 'bg-white/90 border-[#E5E5E5] text-zinc-500'
                  }`}
                >
                  {best ? pretty(best.word) : hasHands ? 'Not sure yet…' : 'Show your hand'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 flex flex-col gap-3 min-h-0 md:overflow-y-auto">
          {view === 'live' ? (
            <>
              <div className={`duo-card p-4 text-center transition-colors ${best ? 'bg-[#EEFDE5] border-[#58CC02]' : ''}`}>
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center justify-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 stroke-[2.6]" /> Sanket sees
                </div>
                <div className={`mt-1 text-4xl sm:text-5xl font-black leading-tight break-words ${best ? 'text-[#2F7202]' : 'text-[#CECECE]'}`}>
                  {best ? pretty(best.word) : '—'}
                </div>
                <div className="mt-1 text-xs font-bold text-zinc-500 min-h-[1rem]">
                  {best
                    ? `${Math.round(best.confidence * 100)}% sure`
                    : hasHands
                      ? 'Hold the sign steady for a moment.'
                      : 'Raise a hand into the camera.'}
                </div>
              </div>

              <div className="duo-card p-3.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Closest matches</div>
                {ranking.length ? (
                  <div className="flex flex-col gap-2">
                    {ranking.slice(0, 4).map((r) => {
                      const pct = Math.round(r.confidence * 100);
                      const top = best && norm(best.word) === norm(r.word);
                      return (
                        <div key={r.word} className="flex items-center gap-2 text-xs">
                          <span className={`w-20 shrink-0 font-black truncate ${top ? 'text-[#2F7202]' : 'text-[#4B4B4B]'}`}>{pretty(r.word)}</span>
                          <div className="flex-1 h-2.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-150 ${top ? 'bg-[#58CC02]' : 'bg-[#FFC800]'}`} style={{ width: `${Math.max(pct, 4)}%` }} />
                          </div>
                          <span className="w-9 text-right font-mono font-black text-zinc-500">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-zinc-400">Nothing yet. Matches show up while a hand is in view.</p>
                )}
              </div>

              <div className="duo-card p-3.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Trained signs</div>
                <div className="flex flex-wrap gap-1.5">
                  {trained.map((w) => {
                    const on = best && norm(best.word) === norm(w);
                    return (
                      <span
                        key={w}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-black border-2 transition-colors ${
                          on ? 'bg-[#58CC02] text-white border-[#46A302]' : 'bg-white text-[#4B4B4B] border-[#E5E5E5]'
                        }`}
                      >
                        {pretty(w)}
                        <span className={`ml-1 font-mono ${on ? 'text-white/80' : 'text-zinc-400'}`}>{signs[w]?.samples?.length ?? 'AI'}</span>
                      </span>
                    );
                  })}
                </div>
                <button type="button" onClick={onGoTeach} className="duo-btn !py-1.5 !px-3 text-xs font-black mt-3">
                  <GraduationCap className="w-3.5 h-3.5 stroke-[2.6]" />
                  <span>Add or retrain</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {quiz.status === 'idle' && (
                <div className="duo-card p-5 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF5D1] border-2 border-[#FFC800] border-b-[4px] flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-[#78350F] stroke-[2.4]" />
                  </div>
                  <h3 className="mt-3 text-lg font-black text-[#3C3C3C]">Sign quiz</h3>
                  <p className="mt-1 text-sm font-bold text-zinc-500">
                    {QUESTIONS_PER_ROUND} signs from your trained set, {SECONDS_PER_QUESTION} seconds each. Hold each sign until Sanket reads it.
                  </p>
                  <p className="mt-2 text-xs font-bold text-zinc-400">{pool.length ? `${pool.length} sign${pool.length === 1 ? '' : 's'} in this set` : 'No trained signs in this set. Pick another set above.'}</p>
                  <button
                    type="button"
                    onClick={startQuiz}
                    disabled={!pool.length || !cameraOn || !isWorkerReady}
                    className="duo-btn duo-btn-green w-full !py-3 text-sm font-black mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 stroke-[2.6]" />
                    <span>Start quiz</span>
                  </button>
                </div>
              )}

              {(quiz.status === 'running' || quiz.status === 'between') && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="duo-card p-2.5 text-center">
                      <div className="text-[10px] font-black uppercase text-zinc-400">Score</div>
                      <div className="text-2xl font-black text-[#3C3C3C]">{quiz.score}</div>
                    </div>
                    <div className="duo-card p-2.5 text-center">
                      <div className="text-[10px] font-black uppercase text-zinc-400 flex items-center justify-center gap-1"><Flame className="w-3 h-3" />Streak</div>
                      <div className="text-2xl font-black text-[#E5A500]">{quiz.streak}</div>
                    </div>
                    <div className="duo-card p-2.5 text-center">
                      <div className="text-[10px] font-black uppercase text-zinc-400 flex items-center justify-center gap-1"><Timer className="w-3 h-3" />Time</div>
                      <div className={`text-2xl font-black font-mono ${timeLeft < 3 ? 'text-[#FF4B4B]' : 'text-[#3C3C3C]'}`}>{Math.ceil(timeLeft)}</div>
                    </div>
                  </div>

                  <div className="duo-card p-3.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Reference</div>
                    {showHint && lesson?.image ? (
                      <img src={lesson.image} alt={`How to sign ${pretty(target)}`} className="w-full max-h-48 object-contain rounded-xl bg-[#F7F7F7]" />
                    ) : (
                      <button type="button" onClick={() => setShowHint(true)} className="duo-btn !py-1.5 !px-3 text-xs font-black">
                        <Eye className="w-3.5 h-3.5 stroke-[2.6]" />
                        <span>Show a hint</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => finishOrNext(false)} className="duo-btn flex-1 !py-2 text-xs font-black">
                      <SkipForward className="w-3.5 h-3.5 stroke-[2.6]" />
                      <span>Skip</span>
                    </button>
                    <button type="button" onClick={stopQuiz} className="duo-btn flex-1 !py-2 text-xs font-black">
                      <X className="w-3.5 h-3.5 stroke-[2.6]" />
                      <span>End quiz</span>
                    </button>
                  </div>
                </>
              )}

              {done && (
                <div className="duo-card p-5 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EEFDE5] border-2 border-[#58CC02] border-b-[4px] flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-[#58CC02] stroke-[2.4]" />
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-[#3C3C3C]">
                    {quiz.score} / {quiz.results.length}
                  </h3>
                  <p className="text-sm font-bold text-zinc-500">
                    {accuracy}% correct · best streak {quiz.bestStreak}
                  </p>
                  {missed.length > 0 ? (
                    <div className="mt-3 text-left">
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">Needs more samples</div>
                      <div className="flex flex-wrap gap-1.5">
                        {missed.map((w) => (
                          <span key={w} className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-[#FFDFDF] text-[#EA2B2B] border-2 border-[#FF4B4B]/30">
                            {pretty(w)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-black text-[#2F7202]">Perfect round. Sanket knows your signs.</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button type="button" onClick={startQuiz} className="duo-btn duo-btn-green flex-1 !py-2.5 text-xs font-black">
                      <RotateCcw className="w-3.5 h-3.5 stroke-[2.6]" />
                      <span>Play again</span>
                    </button>
                    {missed.length > 0 && (
                      <button type="button" onClick={onGoTeach} className="duo-btn duo-btn-blue flex-1 !py-2.5 text-xs font-black">
                        <GraduationCap className="w-3.5 h-3.5 stroke-[2.6]" />
                        <span>Retrain</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
