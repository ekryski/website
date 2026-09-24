// Circular 2-D convolution on the G x G torus by FFT, for the carrier pathway,
// where the network runs 16,000 frames a clip and the dense 256 x 256 matvec is
// too slow. The same operator as lattice.js's dense torus, up to rounding.
//
// Two real fields ride one complex transform: with a real kernel K,
// K * (a + ib) = (K * a) + i (K * b), so one forward and one inverse transform
// convolve both.

function fft1(re, im, n, off, stride, cosT, sinT, rev, inverse) {
  // bit-reversal permutation along one line of the grid
  for (let i = 0; i < n; i++) {
    const j = rev[i];
    if (i < j) {
      const a = off + i * stride, b = off + j * stride;
      let t = re[a]; re[a] = re[b]; re[b] = t;
      t = im[a]; im[a] = im[b]; im[b] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1, step = n / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < half; k++) {
        const wr = cosT[k * step], wi = inverse ? sinT[k * step] : -sinT[k * step];
        const a = off + (i + k) * stride, b = off + (i + k + half) * stride;
        const tr = re[b] * wr - im[b] * wi, ti = re[b] * wi + im[b] * wr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
      }
    }
  }
}

export class Torus16 {
  /** taps: Float32Array(C * G * G), each channel's kernel, row-major. */
  constructor(taps, C, G) {
    this.C = C; this.G = G; this.N = G * G;
    this.cosT = new Float64Array(G); this.sinT = new Float64Array(G);
    for (let k = 0; k < G; k++) { this.cosT[k] = Math.cos((2 * Math.PI * k) / G); this.sinT[k] = Math.sin((2 * Math.PI * k) / G); }
    const bits = Math.log2(G);
    this.rev = new Int32Array(G);
    for (let i = 0; i < G; i++) {
      let r = 0;
      for (let b = 0; b < bits; b++) if (i & (1 << b)) r |= 1 << (bits - 1 - b);
      this.rev[i] = r;
    }
    this.kre = new Float64Array(C * this.N); this.kim = new Float64Array(C * this.N);
    const re = new Float64Array(this.N), im = new Float64Array(this.N);
    for (let c = 0; c < C; c++) {
      for (let i = 0; i < this.N; i++) { re[i] = taps[c * this.N + i]; im[i] = 0; }
      this._fft2(re, im, false);
      this.kre.set(re, c * this.N); this.kim.set(im, c * this.N);
    }
    this.re = new Float64Array(this.N); this.im = new Float64Array(this.N);
  }

  _fft2(re, im, inverse) {
    const G = this.G;
    for (let r = 0; r < G; r++) fft1(re, im, G, r * G, 1, this.cosT, this.sinT, this.rev, inverse);
    for (let c = 0; c < G; c++) fft1(re, im, G, c, G, this.cosT, this.sinT, this.rev, inverse);
    if (inverse) {
      const s = 1 / this.N;
      for (let i = 0; i < this.N; i++) { re[i] *= s; im[i] *= s; }
    }
  }

  /** outA = K_c * a, outB = K_c * b, circular. */
  convolvePair(c, a, b, outA, outB) {
    const { re, im, N } = this, off = c * N, kre = this.kre, kim = this.kim;
    for (let i = 0; i < N; i++) { re[i] = a[i]; im[i] = b[i]; }
    this._fft2(re, im, false);
    for (let i = 0; i < N; i++) {
      const xr = re[i], xi = im[i], yr = kre[off + i], yi = kim[off + i];
      re[i] = xr * yr - xi * yi; im[i] = xr * yi + xi * yr;
    }
    this._fft2(re, im, true);
    for (let i = 0; i < N; i++) { outA[i] = re[i]; outB[i] = im[i]; }
  }
}
