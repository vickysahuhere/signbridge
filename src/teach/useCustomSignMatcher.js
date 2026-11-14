import { useEffect, useRef, useState } from 'react';
import { classify, frameHasHands } from './customSignStore.js';

const SHOW_FRAMES = 3;     // same answer this many frames in a row before it is shown
const HOLD_MS = 450;       // ...and held this long before it is typed into the message
const RELEASE_MS = 350;    // no hand for this long unlocks the next identical sign

/**
 * Per-frame nearest-neighbour matching against taught signs.
 * Returns { ranking, best }. Calls onConfirm(word) once per held sign.
 */
export function useCustomSignMatcher({ features, signs, enabled = true, kind = null, onConfirm }) {
  const stable = useRef({ word: null, n: 0, since: 0 });
  const locked = useRef(false);
  const lastSeen = useRef(0);
  const [state, setState] = useState({ ranking: [], best: null });
  const confirmRef = useRef(onConfirm);
  confirmRef.current = onConfirm;

  useEffect(() => {
    if (!enabled || !features || !Object.keys(signs).length) return;
    const now = performance.now();
    if (!frameHasHands(features)) {
      stable.current = { word: null, n: 0, since: 0 };
      if (now - lastSeen.current > RELEASE_MS) locked.current = false;
      setState((s) => (s.best || s.ranking.length ? { ranking: [], best: null } : s));
      return;
    }
    lastSeen.current = now;
    const res = classify(features, signs, kind === 'letters' ? (w) => w.length === 1 : kind === 'words' ? (w) => w.length > 1 : null);
    const word = res.best?.word || null;
    const st = stable.current;
    if (word && st.word === word) st.n += 1;
    else {
      stable.current = { word, n: word ? 1 : 0, since: now };
      locked.current = false; // the sign changed (or nothing matched): allow the next one
    }
    const shown = word && stable.current.n >= SHOW_FRAMES ? res.best : null;
    setState({ ranking: res.ranking, best: shown });
    if (shown && !locked.current && now - stable.current.since >= HOLD_MS) {
      locked.current = true;
      if (confirmRef.current) confirmRef.current(word);
    }
  }, [features, signs, enabled, kind]);

  return state;
}
