// The core: C channels of G x G phase oscillators on a torus.
//
// Port of `resonant/core/torus.py` (TorusBlock, coupling="kuramoto",
// boundary="torus") for the single-block digits config. One Euler substep is
//
//   torque = cos(theta) * (K * sin theta) - sin(theta) * (K * cos theta)   [coupling]
//            - lambda * sin(theta)                                          [pinning]
//   theta += dt * (omega + torque + drive)
//
// where (K * f) is a 2-D CIRCULAR convolution — the same operator torus.py
// computes with an FFT. At G=16 the direct sum is 256 taps per cell, which is
// faster in JS than an FFT and removes any transform-convention risk. The
// kernel arrives from model.json with the spectral clamp already folded in.

const TWO_PI = 2 * Math.PI;

export class TorusField {
  /** core = the `core` block of model.json, with typed arrays already decoded. */
  constructor(core) {
    this.C = core.channels;
    this.G = core.grid;
    this.dt = core.dt;
    this.substeps = core.substeps;
    this.damping = core.damping;
    this.kernel = core.kernel;   // Float32Array(C * G * G)
    this.omega = core.omega;     // Float32Array(C * G * G)
    this.phase0 = core.phase0;   // Float32Array(C * G * G)
    this.N = this.G * this.G;
    // (i - d) mod G for every (i, d): lets the convolution skip modulo in its hot loop
    this.wrap = new Int32Array(this.G * this.G);
    for (let i = 0; i < this.G; i++) {
      for (let d = 0; d < this.G; d++) this.wrap[i * this.G + d] = (i - d + this.G) % this.G;
    }
    this.scratch = {
      sin: new Float32Array(this.N), cos: new Float32Array(this.N),
      convSin: new Float32Array(this.N), convCos: new Float32Array(this.N),
    };
  }

  /** out = K_c (*) f, circular in both axes. */
  _conv(f, out, chanOffset) {
    const { G, wrap, kernel } = this;
    out.fill(0);
    for (let r = 0; r < G; r++) {
      const rowOut = r * G;
      for (let dr = 0; dr < G; dr++) {
        const sr = wrap[r * G + dr] * G;   // source row (r - dr) mod G
        const kr = chanOffset + dr * G;
        for (let dc = 0; dc < G; dc++) {
          const k = kernel[kr + dc];
          if (k === 0) continue;
          for (let cc = 0; cc < G; cc++) {
            out[rowOut + cc] += k * f[sr + wrap[cc * G + dc]];  // source col (cc - dc) mod G
          }
        }
      }
    }
    return out;
  }

  /**
   * Run the field over a clip.
   *
   * rows: Float32Array(T * G) drive rows (band b -> storage row b; the value is
   *       broadcast across every channel and every column, exactly as
   *       gym/common.py:rows_to_drive does).
   * opts: {gain, damping, couplingScale} — the live dials.
   *
   * Returns theta [T][C*G*G] flattened, plus the per-channel order parameter R
   * and the mean drive per frame (for the plots).
   */
  simulate(rows, T, opts = {}) {
    const { C, G, N, dt, substeps } = this;
    const gain = opts.gain ?? 2.0;
    const lambda = opts.damping ?? this.damping;
    const kScale = opts.couplingScale ?? 1.0;
    const theta = new Float32Array(T * C * N);
    const R = new Float32Array(T * C);
    const state = Float32Array.from(this.phase0);
    const { sin, cos, convSin, convCos } = this.scratch;

    for (let t = 0; t < T; t++) {
      for (let s = 0; s < substeps; s++) {
        for (let c = 0; c < C; c++) {
          const base = c * N;
          for (let i = 0; i < N; i++) {
            sin[i] = Math.sin(state[base + i]);
            cos[i] = Math.cos(state[base + i]);
          }
          this._conv(sin, convSin, base);
          this._conv(cos, convCos, base);
          for (let r = 0; r < G; r++) {
            const drive = gain * rows[t * G + r];   // same value across the whole row
            for (let cc = 0; cc < G; cc++) {
              const i = r * G + cc;
              const torque = kScale * (cos[i] * convSin[i] - sin[i] * convCos[i])
                             - lambda * sin[i];
              let th = state[base + i] + dt * (this.omega[base + i] + torque + drive);
              th %= TWO_PI;
              state[base + i] = th < 0 ? th + TWO_PI : th;
            }
          }
        }
      }
      theta.set(state, t * C * N);
      for (let c = 0; c < C; c++) {                 // order parameter per channel
        let sx = 0, sy = 0;
        for (let i = 0; i < N; i++) {
          const th = state[c * N + i];
          sx += Math.cos(th); sy += Math.sin(th);
        }
        R[t * C + c] = Math.hypot(sx, sy) / N;
      }
    }
    return { theta, R, T, C, G, N };
  }
}
