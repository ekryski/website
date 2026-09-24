// The three input pathways of paper 02, each a fixed, parameter-free map from
// a 16 kHz waveform to the rows that drive an arm (band b drives row b):
//
//   band-energy  log-mel band energies at 62.5 frames a second
//                (harness/stimuli/frontend.py:hop_rows)
//   quadrature   the same energies, paired with each band's phase at its
//                centre bin, demodulated to baseband (hop_rows_quad)
//   carrier      the band-filtered waveform itself at 16,000 frames a second,
//                bands 96-1,536 Hz (harness/stimuli/filterbank.py:bandpass_rows)
//
// Plus the noise protocol (harness/confirm/protocol.py:add_noise).

import { fft, hann, powerSpectrogram, melRows } from '../resonant/dsp.js';

export const PATHWAYS = ['envelope', 'quadrature', 'carrier'];

/** Band-energy rows: {frames, mels, logMel, rows, spec}. */
export function envelopeRows(samples, fe) {
  const spec = powerSpectrogram(samples, fe.n_fft, fe.hop);
  const mel = melRows(spec, fe.melFb, fe);
  return { ...mel, spec, G: fe.n_mels, T: mel.frames };
}

/**
 * Quadrature rows: per frame and band, (A cos phi, A sin phi), with A the
 * band-energy row and phi the phase of the band's peak STFT bin after
 * demodulating by that bin's own frequency.
 */
export function quadratureRows(samples, fe) {
  const env = envelopeRows(samples, fe);
  const { n_fft: n, hop } = fe;
  const bins = fe.quad_bins, G = fe.n_mels, T = env.frames;
  const win = hann(n);
  const re = new Float32Array(n), im = new Float32Array(n);
  const pairs = new Float32Array(T * G * 2);
  const phase = new Float32Array(T * G);
  const f32 = Math.fround, sr = fe.sample_rate;
  const twoPi = f32(-2 * Math.PI);
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < n; i++) { re[i] = samples[t * hop + i] * win[i]; im[i] = 0; }
    fft(re, im);
    const time = f32((t * hop) / sr);
    for (let b = 0; b < G; b++) {
      const k = bins[b];
      // demodulate by exp(-2 pi i f_c t hop / sr), with the angle rounded as the harness
      // rounds it, in float32: late in a clip and high in frequency it is tens of thousands
      // of radians, where float32 moves it by milliradians, and the rows follow the harness
      const ang = f32(f32(twoPi * f32((k * sr) / n)) * time);
      const c = Math.cos(ang), s = Math.sin(ang);
      const dr = re[k] * c - im[k] * s, di = re[k] * s + im[k] * c;
      const phi = Math.atan2(di, dr);
      const a = env.rows[t * G + b];
      phase[t * G + b] = phi;
      pairs[(t * G + b) * 2] = a * Math.cos(phi);
      pairs[(t * G + b) * 2 + 1] = a * Math.sin(phi);
    }
  }
  return { ...env, pairs, phase };
}

/**
 * Carrier rows: row b is the clip band-passed to [edge_b, edge_b+1) cycles per
 * sample by masking a full-clip DFT, [T=L][G] row-major. The DFT is done
 * directly over the ~1,440 bins inside the bands (L = 16,000 is not a power of
 * two), with a shared twiddle table.
 */
export function carrierRows(samples, fe) {
  const L = samples.length, G = fe.n_mels, edges = fe.carrier_edges;
  const cosT = new Float64Array(L), sinT = new Float64Array(L);
  for (let m = 0; m < L; m++) { cosT[m] = Math.cos((2 * Math.PI * m) / L); sinT[m] = Math.sin((2 * Math.PI * m) / L); }
  const rows = new Float32Array(L * G);
  const half = Math.floor(L / 2);
  for (let b = 0; b < G; b++) {
    const lo = Math.ceil(edges[b] * L - 1e-9), hi = Math.ceil(edges[b + 1] * L - 1e-9);
    for (let k = Math.max(lo, 0); k < Math.min(hi, half + 1); k++) {
      if (k / L < edges[b] || k / L >= edges[b + 1]) continue;
      let xr = 0, xi = 0, idx = 0;
      for (let t = 0; t < L; t++) {
        xr += samples[t] * cosT[idx]; xi -= samples[t] * sinT[idx];
        idx += k; if (idx >= L) idx -= L;
      }
      // irfft: every bin but DC and Nyquist appears twice in the real signal
      const w = (k === 0 || (L % 2 === 0 && k === half)) ? 1 / L : 2 / L;
      idx = 0;
      for (let t = 0; t < L; t++) {
        rows[t * G + b] += w * (xr * cosT[idx] - xi * sinT[idx]);
        idx += k; if (idx >= L) idx -= L;
      }
    }
  }
  return { rows, T: L, G, frames: L, mels: G };
}

/** Rows for any pathway. */
export function frontEnd(samples, fe, pathway) {
  if (pathway === 'envelope') return envelopeRows(samples, fe);
  if (pathway === 'quadrature') return quadratureRows(samples, fe);
  if (pathway === 'carrier') return carrierRows(samples, fe);
  throw new Error(`unknown pathway ${pathway}`);
}

// --- noise -----------------------------------------------------------------

/** Deterministic Gaussian stream (mulberry32 + Box-Muller), for recordings the export never saw. */
export function gaussian(seed, n) {
  let a = seed >>> 0;
  const u = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 2) {
    const r = Math.sqrt(-2 * Math.log(1 - u())), th = 2 * Math.PI * u();
    out[i] = r * Math.cos(th);
    if (i + 1 < n) out[i + 1] = r * Math.sin(th);
  }
  return out;
}

/**
 * White noise at `db` relative to the speech: amplitude = RMS(speech) x 10^(db/20),
 * the RMS taken over the clip's own samples, the noise over the whole padded
 * second. 0 dB is noise as loud as the speech; +5 dB is louder.
 */
export function addNoise(samples, speechLength, unitNoise, db) {
  if (db === null || db === undefined) return samples;
  let ss = 0;
  for (let i = 0; i < samples.length; i++) ss += samples[i] * samples[i];
  const rms = Math.max(1e-8, Math.sqrt(ss / Math.max(1, speechLength)));
  const amp = rms * 10 ** (db / 20);
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] + unitNoise[i] * amp;
  return out;
}
