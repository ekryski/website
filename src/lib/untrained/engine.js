// One clip through one config: front end, arm, read, readout.
//
// A config is one arm on one pathway at one registered input gain and noise
// level (manifest.configs). Everything an arm needs is in the store; the
// figures get the arm's state over time alongside the scores.

import { frontEnd } from './frontend.js';
import { PhaseNetwork, SLNetwork } from './oscillators.js';
import { LeakyBank } from './bank.js';
import { netHidden } from './nets.js';
import { WindowStats, applyReadout, argmax } from './read.js';

const TWO_PI = 2 * Math.PI;
/** At most this many frames of state are kept for the figures (the carrier runs 16,000). */
const DISPLAY_FRAMES = 1000;

/** The arm a config describes, built from the store. */
export function buildArm(store, cfg) {
  const a = cfg.arm, physics = store.physics;
  const gain = cfg.gain ?? 1;
  const fast = cfg.drive === 'carrier';
  if (a.kind === 'field') {
    if (a.physics === 'sl' || a.physics === 'sl-fixedamp') {
      return new SLNetwork({ physics, fixedAmp: a.physics === 'sl-fixedamp', gain, fast });
    }
    return new PhaseNetwork({ physics, fn: a.physics, geometry: a.boundary, gain, severed: a.severed, fast });
  }
  if (a.kind === 'bank') {
    const bank = store.banks[`bank-c${a.channels}`];
    const rateHz = cfg.drive === 'carrier' ? bank.rates_hz.carrier : bank.rates_hz.hop;
    return new LeakyBank({ bank, grid: physics.grid, gain, rateHz });
  }
  return null;
}

/** Kuramoto order parameter |mean e^{i theta}| per channel. */
function orderParameter(theta, C, N, out, off) {
  for (let c = 0; c < C; c++) {
    let sx = 0, sy = 0;
    for (let i = 0; i < N; i++) { sx += Math.cos(theta[c * N + i]); sy += Math.sin(theta[c * N + i]); }
    out[off + c] = Math.hypot(sx, sy) / N;
  }
}

/**
 * Run one clip. samples: the (possibly noisy) waveform, 16,000 samples.
 * Returns {input, T, features, logits, predicted, display, ms}.
 * onProgress(fraction) is called during long (carrier) runs.
 */
export async function runConfig(store, cfgId, samples, { onProgress = null, keepDisplay = true } = {}) {
  const cfg = store.config(cfgId);
  const fe = store.frontend;
  const readout = await store.readout(cfgId);
  const params = cfg.arm.kind === 'ann' ? await store.net(cfgId) : null;
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();   // compute only, not downloads
  const input = frontEnd(samples, fe, cfg.drive);
  const T = input.T, G = fe.n_mels;
  const quad = cfg.drive === 'quadrature';
  const lo = cfg.read === 'windowed@wholeclip' ? 0 : fe.warmup;
  const kind = cfg.arm.kind;
  const display = { kind, T, stride: Math.max(1, Math.ceil(T / DISPLAY_FRAMES)) };
  display.frames = Math.ceil(T / display.stride);
  let stats;

  if (kind === 'floor') {
    const D = quad ? 2 * G : G;
    stats = new WindowStats(D, T, lo, fe.windows);
    const src = quad ? input.pairs : input.rows;
    for (let t = 0; t < T; t++) stats.push(t, src.subarray(t * D, (t + 1) * D));
  } else if (kind === 'ann') {
    const { hidden, H } = netHidden(cfg.arm.arch, params, input.rows, T, G);
    stats = new WindowStats(H, T, fe.warmup, fe.windows);
    for (let t = fe.warmup; t < T; t++) stats.push(t, hidden.subarray(t * H, (t + 1) * H));
    display.hidden = hidden; display.H = H;
  } else {
    const arm = buildArm(store, cfg);
    const D = arm.D;
    stats = new WindowStats(D, T, lo, fe.windows);
    const sig = new Float64Array(D);
    const isField = kind === 'field';
    const C = arm.C, N = arm.N;
    if (keepDisplay) {
      display.C = C; display.N = N;
      display.state = new Float32Array(display.frames * C * N);
      if (isField) display.R = new Float32Array(display.frames * C);
      if (isField && arm instanceof SLNetwork) display.amp = new Float32Array(display.frames * C * N);
    }
    const drive = new Float32Array(G), pair = quad ? new Float32Array(2 * G) : null;
    const chunk = 500;
    for (let t = 0; t < T; t++) {
      if (quad) pair.set(input.pairs.subarray(t * 2 * G, (t + 1) * 2 * G));
      else drive.set(input.rows.subarray(t * G, (t + 1) * G));
      arm.step(quad ? null : drive, pair, sig);
      stats.push(t, sig);
      if (keepDisplay) {
        if (isField) {
          if (t % display.stride === 0) {
            const th = arm.phases(), f = t / display.stride;
            orderParameter(th, C, N, display.R, f * C);
            display.state.set(th, f * C * N);
            if (display.amp) display.amp.set(arm.amplitudes(), f * C * N);
          }
        } else if (t % display.stride === 0) {
          display.state.set(sig.subarray(0, C * N), (t / display.stride) * C * N);
        }
      }
      if (onProgress && t % chunk === chunk - 1) {
        onProgress(t / T);
        await new Promise((r) => setTimeout(r, 0));     // let the page breathe
      }
    }
  }

  const features = stats.features();
  const logits = applyReadout(features, readout);
  const t1 = (typeof performance !== 'undefined' ? performance : Date).now();
  return {
    cfg, input, T, features, logits, predicted: argmax(logits), display,
    edges: stats.edges, ms: t1 - t0,
  };
}

export { TWO_PI };
