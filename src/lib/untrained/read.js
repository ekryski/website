// The read and the readout, shared by every arm (harness/measurement/features.py
// and harness/confirm/readout.py).
//
// The read: frames 16 to 61 (the same frames for every clip, after a 16-frame
// warm-up), cut into four equal windows; per signal and window, the mean, the
// standard deviation and the mean absolute frame-to-frame change. No statistic
// depends on an endpoint, so none can smuggle in the last state.
//
// The readout: standardize each feature by its training statistics, project
// to 192 features with one fixed Gaussian matrix (skipped when an arm has 192
// or fewer), standardize again, and score ten digits with one linear layer
// fitted by ridge regression. Only that layer was fitted.

export const VARIANCE_EPS = 1e-8;

/** Window edges when every clip is read over frames [lo, T): the harness's _fixed_edges. */
export function windowEdges(T, lo, windows) {
  const e = [];
  for (let j = 0; j <= windows; j++) e.push(lo + Math.floor(((T - lo) * j) / windows));
  return e;
}

/** Streaming statistics over fixed windows: push one frame of D signals at a time. */
export class WindowStats {
  constructor(D, T, lo, windows) {
    this.D = D; this.W = windows;
    this.edges = windowEdges(T, lo, windows);
    this.sum = new Float64Array(windows * D);
    this.sq = new Float64Array(windows * D);
    this.abs = new Float64Array(windows * D);
    this.prev = new Float64Array(D);
    this.window = new Int32Array(T).fill(-1);
    for (let j = 0; j < windows; j++) for (let t = this.edges[j]; t < this.edges[j + 1]; t++) this.window[t] = j;
  }

  push(t, sig) {
    const j = this.window[t], D = this.D;
    if (j >= 0) {
      const off = j * D, first = t === this.edges[j];
      for (let i = 0; i < D; i++) {
        const v = sig[i];
        this.sum[off + i] += v;
        this.sq[off + i] += v * v;
        if (!first) this.abs[off + i] += Math.abs(v - this.prev[i]);
      }
    }
    for (let i = 0; i < D; i++) this.prev[i] = sig[i];
  }

  /** [window][mean | sd | change][signal], the harness's layout. */
  features() {
    const { D, W } = this;
    const f = new Float64Array(W * 3 * D);
    for (let j = 0; j < W; j++) {
      const n = this.edges[j + 1] - this.edges[j];
      for (let i = 0; i < D; i++) {
        const s = this.sum[j * D + i], mean = s / n;
        const v = Math.max(0, (this.sq[j * D + i] - s * mean) / (n - 1));
        f[j * 3 * D + i] = mean;
        f[j * 3 * D + D + i] = Math.sqrt(v + VARIANCE_EPS);
        f[j * 3 * D + 2 * D + i] = this.abs[j * D + i] / (n - 1);
      }
    }
    return f;
  }
}

/** The 192 projected features: (x * inv1) @ P - shift, the export's folded form of ((x - mean) / sd) @ P. */
export function project(features, R) {
  const D = R.native, W = R.width, P = R.P;
  const p = new Float64Array(W);
  for (let i = 0; i < D; i++) {
    const z = features[i] * R.inv1[i];
    if (z === 0) continue;
    const row = i * W;
    for (let k = 0; k < W; k++) p[k] += z * P[row + k];
  }
  for (let k = 0; k < W; k++) p[k] -= R.shift[k];
  return p;
}

/** Ten digit scores from an arm's features, through its fitted readout. */
export function applyReadout(features, R) {
  const x = R.projected ? project(features, R) : features;
  const W = R.width;
  const K = R.bias.length;
  const logits = new Float64Array(K);
  for (let c = 0; c < K; c++) logits[c] = R.bias[c];
  for (let k = 0; k < W; k++) {
    const z = (x[k] - R.mean2[k]) / R.sd2[k];
    for (let c = 0; c < K; c++) logits[c] += z * R.weight[k * K + c];
  }
  return logits;
}

/** Index of the largest score. */
export function argmax(v) {
  let best = 0;
  for (let i = 1; i < v.length; i++) if (v[i] > v[best]) best = i;
  return best;
}
