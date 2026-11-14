/** One Euro filter for landmark arrays: heavy smoothing when still, almost none when moving fast. */
const alpha = (cutoff, dt) => {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
};

export class LandmarkOneEuro {
  constructor({ minCutoff = 1.4, beta = 12, dCutoff = 1.0 } = {}) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }

  reset() {
    this.x = null; // filtered values [x,y,z]*n
    this.dx = null;
    this.t = 0;
  }

  /** pts: [{x,y,z}] ; t: ms. Returns new smoothed array. */
  filter(pts, t) {
    const n = pts.length;
    if (!this.x || this.x.length !== n * 3 || t - this.t > 400) {
      this.x = new Float32Array(n * 3);
      this.dx = new Float32Array(n * 3);
      pts.forEach((p, i) => { this.x[i * 3] = p.x; this.x[i * 3 + 1] = p.y; this.x[i * 3 + 2] = p.z || 0; });
      this.t = t;
      return pts.map((p) => ({ x: p.x, y: p.y, z: p.z || 0 }));
    }
    const dt = Math.max(0.001, (t - this.t) / 1000);
    this.t = t;
    const ad = alpha(this.dCutoff, dt);
    return pts.map((p, i) => {
      const o = [p.x, p.y, p.z || 0];
      const out = {};
      ['x', 'y', 'z'].forEach((k, c) => {
        const idx = i * 3 + c;
        const rawD = (o[c] - this.x[idx]) / dt;
        this.dx[idx] = this.dx[idx] + ad * (rawD - this.dx[idx]);
        const cutoff = this.minCutoff + this.beta * Math.abs(this.dx[idx]);
        const a = alpha(cutoff, dt);
        this.x[idx] = this.x[idx] + a * (o[c] - this.x[idx]);
        out[k] = this.x[idx];
      });
      return out;
    });
  }
}
