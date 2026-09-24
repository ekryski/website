// The coupled oscillator network: C channels of G x G oscillators, untrained.
//
// Port of harness/models/phase.py (PhaseBlock.step, one substep per frame) and
// harness/models/stuart_landau.py (SLCore.step_frame). Per frame, for every
// oscillator i of a channel:
//
//   dtheta_i = omega_i + coupling_i - lambda sin theta_i + drive_i
//   theta_i <- (theta_i + dt * dtheta_i) mod 2 pi
//
// with the coupling function one of
//
//   kuramoto    sum_j K_ij sin(theta_j - theta_i)
//   sakaguchi   sum_j K_ij sin(theta_j - theta_i - alpha),  alpha = pi/4
//   harmonic2   kuramoto + beta sum_j K_ij sin 2(theta_j - theta_i),  beta = 0.5
//   winfree     -sin theta_i * sum_j K_ij (1 + cos theta_j)
//
// all computed from the convolutions K * sin and K * cos. The drive is the
// band's row value, broadcast to every oscillator of the band's row in every
// channel (band-energy pathway), or the quadrature pair's Adler torque
// A sin(phi - theta). "Uncoupled" is the same network with K = 0.
//
// The network exposes sin theta and cos theta of every oscillator: [sin of all
// channels, then cos of all channels], the harness's order.

import { denseOperator, rowSums } from './lattice.js';

const TWO_PI = 2 * Math.PI;
export const PHASE_FUNCTIONS = ['kuramoto', 'sakaguchi', 'harmonic2', 'winfree'];
export const AMPLITUDE_FUNCTIONS = ['sl', 'sl-fixedamp'];
export const COUPLING_FUNCTIONS = [...PHASE_FUNCTIONS, ...AMPLITUDE_FUNCTIONS];

const opCache = new Map();
/** The dense operator for a geometry, built once per page. */
export function operatorFor(physics, geometry) {
  const key = geometry;
  if (!opCache.has(key)) {
    const { channels: C, grid: G } = physics;
    const op = denseOperator(geometry, physics.taps[geometry], C, G);
    opCache.set(key, { op, sums: rowSums(op, C, G * G) });
  }
  return opCache.get(key);
}

function matvec(op, base, N, f, out) {
  for (let i = 0; i < N; i++) {
    let acc = 0;
    const row = base + i * N;
    for (let j = 0; j < N; j++) acc += op[row + j] * f[j];
    out[i] = acc;
  }
}

/**
 * A phase-oscillator network.
 * opts: {physics, fn, geometry, gain, severed}
 */
export class PhaseNetwork {
  constructor({ physics, fn = 'kuramoto', geometry = 'torus', gain = 1, severed = false }) {
    if (!PHASE_FUNCTIONS.includes(fn)) throw new Error(`not a phase coupling function: ${fn}`);
    this.C = physics.channels; this.G = physics.grid; this.N = this.G * this.G;
    this.D = 2 * this.C * this.N;
    this.dt = physics.dt; this.lambda = physics.damping;
    this.fn = fn; this.gain = gain; this.severed = severed; this.geometry = geometry;
    this.alpha = physics.sakaguchi_alpha; this.beta = physics.harmonic2_beta;
    this.ws = physics.winfree_s; this.wi = physics.winfree_i;
    this.omega = physics.omega; this.phase0 = physics.phase0;
    if (!severed) {
      const { op, sums } = operatorFor(physics, geometry);
      this.op = op;
      // Winfree's K * 1: the harness's matmul path takes site 0's row sum as one
      // number per channel on the torus and the cylinder, and every site's own
      // sum elsewhere. Mirrored exactly, since that is what ran.
      if (geometry === 'torus' || geometry === 'cylinder') {
        this.ksum = new Float64Array(this.C * this.N);
        for (let c = 0; c < this.C; c++) this.ksum.fill(sums[c * this.N], c * this.N, (c + 1) * this.N);
      } else this.ksum = sums;
    }
    const N = this.N;
    this.s = new Float64Array(N); this.c = new Float64Array(N);
    this.cs = new Float64Array(N); this.cc = new Float64Array(N);
    this.s2 = new Float64Array(N); this.c2 = new Float64Array(N);
    this.cs2 = new Float64Array(N); this.cc2 = new Float64Array(N);
    this.reset();
  }

  reset() { this.theta = Float64Array.from(this.phase0); }

  /** Phases, for the figures. */
  phases() { return this.theta; }

  /**
   * Advance one frame. rowDrive: Float32Array(G) additive, or null;
   * quad: Float32Array(G * 2) (A cos phi, A sin phi) per row, or null.
   * Writes sin/cos of the new state into sig (length D).
   */
  step(rowDrive, quad, sig) {
    const { C, G, N, theta, s, c, cs, cc, s2, c2, cs2, cc2, dt, lambda, gain } = this;
    const fn = this.fn, coupled = !this.severed;
    const ca = Math.cos(this.alpha), sa = Math.sin(this.alpha);
    for (let ch = 0; ch < C; ch++) {
      const base = ch * N;
      for (let i = 0; i < N; i++) {
        const th = theta[base + i];
        s[i] = Math.sin(th); c[i] = Math.cos(th);
        if (fn === 'harmonic2') { s2[i] = Math.sin(2 * th); c2[i] = Math.cos(2 * th); }
      }
      if (coupled) {
        const ob = ch * N * N;
        matvec(this.op, ob, N, s, cs); matvec(this.op, ob, N, c, cc);
        if (fn === 'harmonic2') { matvec(this.op, ob, N, s2, cs2); matvec(this.op, ob, N, c2, cc2); }
      }
      for (let r = 0; r < G; r++) {
        const drive = rowDrive ? gain * rowDrive[r] : 0;
        const qc = quad ? gain * quad[2 * r] : 0, qs = quad ? gain * quad[2 * r + 1] : 0;
        for (let col = 0; col < G; col++) {
          const i = r * G + col;
          let torque = 0;
          if (coupled) {
            if (fn === 'kuramoto') torque = c[i] * cs[i] - s[i] * cc[i];
            else if (fn === 'sakaguchi') {
              const b = c[i] * cs[i] - s[i] * cc[i], q = c[i] * cc[i] + s[i] * cs[i];
              torque = ca * b - sa * q;
            } else if (fn === 'harmonic2') {
              torque = c[i] * cs[i] - s[i] * cc[i] + this.beta * (c2[i] * cs2[i] - s2[i] * cc2[i]);
            } else {
              const sens = this.ws[0] * s[i] + this.ws[1] * c[i];
              const infl = this.wi[0] * this.ksum[base + i] + this.wi[1] * cs[i] + this.wi[2] * cc[i];
              torque = sens * infl;
            }
          } else if (fn === 'winfree') {
            torque = 0;      // K = 0: no influence, no K * 1 either
          }
          torque -= lambda * s[i];
          if (quad) torque += qs * c[i] - qc * s[i];
          let th = theta[base + i] + dt * (this.omega[base + i] + torque + drive);
          th %= TWO_PI;
          if (th < 0) th += TWO_PI;
          theta[base + i] = th;
          sig[base + i] = Math.sin(th);
          sig[C * N + base + i] = Math.cos(th);
        }
      }
    }
  }
}

/** Positive real root of dtb r^3 + (1 - dta) r - rOld = 0 (Cardano), as the harness solves it. */
function amplitudeRoot(rOld, dtBeta, oneMinusDtAlpha) {
  const p = oneMinusDtAlpha / dtBeta, q = -rOld / dtBeta;
  const s = Math.sqrt((q / 2) ** 2 + (p / 3) ** 3);
  return Math.cbrt(-q / 2 + s) + Math.cbrt(-q / 2 - s);
}

/**
 * A Stuart-Landau network on the torus: each oscillator a complex amplitude
 * z = x + iy relaxing to unit radius, diffusively coupled. fixedAmp holds |z|
 * at 1 (the phase-only limit). Exposes [y of all channels, x of all channels],
 * the sin/cos order.
 */
export class SLNetwork {
  constructor({ physics, fixedAmp = false, gain = 1 }) {
    this.C = physics.channels; this.G = physics.grid; this.N = this.G * this.G;
    this.D = 2 * this.C * this.N;
    this.dt = physics.dt; this.lambda = physics.damping; this.gain = gain;
    this.fixedAmp = fixedAmp;
    this.alpha = physics.sl.alpha; this.beta = physics.sl.beta;
    this.omega = physics.omega; this.state0 = physics.slState0;
    const taps = physics.taps.torus;
    this.op = operatorFor(physics, 'torus').op;
    this.s0 = new Float64Array(this.C);
    for (let c = 0; c < this.C; c++) {
      let s = 0;
      for (let k = 0; k < this.N; k++) s += taps[c * this.N + k];
      this.s0[c] = s;
    }
    this.co = new Float64Array(this.C * this.N); this.si = new Float64Array(this.C * this.N);
    for (let i = 0; i < this.C * this.N; i++) {
      this.co[i] = Math.cos(this.dt * this.omega[i]); this.si[i] = Math.sin(this.dt * this.omega[i]);
    }
    this.fx = new Float64Array(this.N); this.fy = new Float64Array(this.N);
    this.kx = new Float64Array(this.N); this.ky = new Float64Array(this.N);
    this.reset();
  }

  reset() {
    const CN = this.C * this.N;
    this.x = Float64Array.from(this.state0.subarray(0, CN));
    this.y = Float64Array.from(this.state0.subarray(CN, 2 * CN));
  }

  phases() {
    const out = new Float64Array(this.C * this.N);
    for (let i = 0; i < out.length; i++) {
      const t = Math.atan2(this.y[i], this.x[i]);
      out[i] = t < 0 ? t + TWO_PI : t;
    }
    return out;
  }

  amplitudes() {
    const out = new Float64Array(this.C * this.N);
    for (let i = 0; i < out.length; i++) out[i] = Math.hypot(this.x[i], this.y[i]);
    return out;
  }

  step(rowDrive, quad, sig) {
    if (quad) throw new Error('the Stuart-Landau networks take no quadrature drive');
    const { C, G, N, x, y, dt, lambda, fx, fy, kx, ky } = this;
    const dtBeta = dt * this.beta, oneMinus = 1 - dt * this.alpha;
    for (let ch = 0; ch < C; ch++) {
      const base = ch * N, s0 = this.s0[ch];
      for (let i = 0; i < N; i++) { fx[i] = x[base + i]; fy[i] = y[base + i]; }
      matvec(this.op, ch * N * N, N, fx, kx);
      matvec(this.op, ch * N * N, N, fy, ky);
      for (let r = 0; r < G; r++) {
        const d = rowDrive ? this.gain * rowDrive[r] : 0;
        for (let col = 0; col < G; col++) {
          const i = r * G + col, k = base + i;
          // y reads the updated x: the harness's semi-implicit ordering
          let xi = fx[i] + dt * (kx[i] - s0 * fx[i] + lambda * (1 - fx[i]) - d * fy[i]);
          let yi = fy[i] + dt * (ky[i] - s0 * fy[i] - lambda * fy[i] + d * xi);
          const rOld = Math.max(1e-8, Math.hypot(xi, yi));
          const scale = this.fixedAmp ? 1 / rOld : amplitudeRoot(rOld, dtBeta, oneMinus) / rOld;
          xi *= scale; yi *= scale;
          const nx = xi * this.co[k] - yi * this.si[k], ny = xi * this.si[k] + yi * this.co[k];
          x[k] = nx; y[k] = ny;
          sig[k] = ny;
          sig[C * N + k] = nx;
        }
      }
    }
  }
}
