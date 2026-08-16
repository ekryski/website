// The front end: waveform -> STFT -> mel filterbank -> drive rows.
//
// A line-for-line port of what the repo actually runs on this task
// (`resonant/audio.py:MelFrontend` + `gym/frontend_hop.py:hop_rows`), with the
// same fixed constants: n_fft 512, hop 256, center=False, periodic Hann,
// power spectrogram, log(mel + 1e-5), then the fixed affine (x + 10) / 10
// clamped at zero. The mel filterbank itself is not recomputed here — it is
// exported from torchaudio into model.json, so there is no filterbank drift.

/** In-place radix-2 complex FFT (Cooley-Tukey). re/im are Float32Array(n). */
export function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {          // bit-reversal permutation
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {      // butterflies, stage by stage
    const ang = -2 * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + len / 2], bi = im[i + k + len / 2];
        const tr = br * cr - bi * ci, ti = br * ci + bi * cr;
        re[i + k] = ar + tr; im[i + k] = ai + ti;
        re[i + k + len / 2] = ar - tr; im[i + k + len / 2] = ai - ti;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

/** Periodic Hann window (torch.hann_window's default). */
export function hann(n) {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n);
  return w;
}

/**
 * Power spectrogram, center=False: frame t spans samples [t*hop, t*hop + nFft).
 * Returns {frames, bins, power: Float32Array(frames * bins)} with bins = nFft/2 + 1.
 */
export function powerSpectrogram(samples, nFft, hop) {
  const frames = Math.max(0, Math.floor((samples.length - nFft) / hop) + 1);
  const bins = nFft / 2 + 1;
  const win = hann(nFft);
  const power = new Float32Array(frames * bins);
  const re = new Float32Array(nFft), im = new Float32Array(nFft);
  for (let t = 0; t < frames; t++) {
    const off = t * hop;
    for (let i = 0; i < nFft; i++) { re[i] = samples[off + i] * win[i]; im[i] = 0; }
    fft(re, im);
    for (let k = 0; k < bins; k++) power[t * bins + k] = re[k] * re[k] + im[k] * im[k];
  }
  return { frames, bins, power };
}

/**
 * Power spectrogram -> log-mel -> drive rows, exactly as gym/frontend_hop.py does.
 * melFb is the exported torchaudio filterbank, laid out [bins][mels] row-major.
 * Returns {frames, mels, logMel, rows} (both Float32Array(frames * mels)).
 */
export function melRows(spec, melFb, cfg) {
  const { frames, bins, power } = spec;
  const mels = cfg.n_mels;
  const logMel = new Float32Array(frames * mels);
  const rows = new Float32Array(frames * mels);
  for (let t = 0; t < frames; t++) {
    for (let m = 0; m < mels; m++) {
      let acc = 0;
      for (let k = 0; k < bins; k++) acc += power[t * bins + k] * melFb[k * mels + m];
      const lm = Math.log(acc + cfg.log_eps);
      logMel[t * mels + m] = lm;
      rows[t * mels + m] = Math.max(0, (lm + cfg.offset) / cfg.scale);
    }
  }
  return { frames, mels, logMel, rows };
}

/** Analysis front end end-to-end: samples -> {spec, mel}. */
export function analyze(samples, melFb, cfg) {
  const spec = powerSpectrogram(samples, cfg.n_fft, cfg.hop);
  return { spec, mel: melRows(spec, melFb, cfg) };
}
