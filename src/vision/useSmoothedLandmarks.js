import { useEffect, useRef, useState } from 'react';

const lerpPts = (cur, tgt, a) => {
  if (!tgt || !tgt.length) return tgt || [];
  if (!cur || cur.length !== tgt.length) return tgt;
  return tgt.map((p, i) => ({
    ...p,
    x: cur[i].x + (p.x - cur[i].x) * a,
    y: cur[i].y + (p.y - cur[i].y) * a,
    z: (cur[i].z || 0) + ((p.z || 0) - (cur[i].z || 0)) * a,
  }));
};

/**
 * Glides the drawn skeleton toward each new detection every screen frame,
 * so the overlay moves smoothly between detections (display only; recognition is untouched).
 */
export function useSmoothedLandmarks(latest, alpha = 0.5) {
  const target = useRef(latest);
  const shown = useRef(latest);
  const [view, setView] = useState(latest);
  target.current = latest;

  useEffect(() => {
    let raf;
    const tick = () => {
      const t = target.current;
      const s = shown.current;
      if (!t) {
        if (s) { shown.current = null; setView(null); }
      } else {
        const next = {
          ...t,
          leftHandLandmarks: lerpPts(s?.leftHandLandmarks, t.leftHandLandmarks, alpha),
          rightHandLandmarks: lerpPts(s?.rightHandLandmarks, t.rightHandLandmarks, alpha),
          poseLandmarks: lerpPts(s?.poseLandmarks, t.poseLandmarks, alpha),
        };
        shown.current = next;
        setView(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [alpha]);

  return view;
}
