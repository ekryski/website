// Clip in, digit out: the whole path, client-side.
//
//   wav -> STFT -> mel -> drive rows -> oscillator field -> phase features -> linear readout
//
// The featurizer is `gym/common.py:phase_features` (whole-clip means, warmup
// frames dropped) and the readout is the ridge fitted in
// blog/tools/export_demo.py, folded into a single matrix so the browser does
// one matmul. Because both sides run the same arithmetic, the predictions here
// reproduce the Python ones — model.json ships per-clip checksums so the page
// can prove it (see checkParity).

import { analyze } from './dsp.js';
import { TorusField } from './kuramoto.js';

/** Decode a {shape, b64} float32 payload from model.json. */
export function decodeArray(payload) {
  const bin = atob(payload.b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Float32Array(bytes.buffer);
}

export async function loadModel(url = '/resonant/model.json') {
  const raw = await (await fetch(url)).json();
  return {
    meta: raw.meta,
    clips: raw.clips,
    frontend: { ...raw.frontend, melFb: decodeArray(raw.frontend.mel_fb) },
    core: {
      ...raw.core,
      kernel: decodeArray(raw.core.kernel),
      omega: decodeArray(raw.core.omega),
      phase0: decodeArray(raw.core.phase0),
    },
    readout: {
      ...raw.readout,
      weight: decodeArray(raw.readout.weight),   // [featDim, classes] row-major
      bias: decodeArray(raw.readout.bias),
    },
  };
}

/**
 * Phase features, accumulated frame by frame so we can also read the model's
 * running opinion mid-word.
 *
 * Per oscillator the feature block is [mean sin, mean cos, mean cos(dtheta),
 * mean sin(dtheta)] — where it sits on its circle, and how fast it is turning.
 * Feature layout matches the Python side: channel-major, then row, then column.
 */
export class FeatureAccumulator {
  constructor(C, G, warmup) {
    this.d = C * G * G;
    this.warmup = warmup;
    this.sumSin = new Float64Array(this.d);
    this.sumCos = new Float64Array(this.d);
    this.sumCosD = new Float64Array(this.d);
    this.sumSinD = new Float64Array(this.d);
    this.count = 0;
    this.features = new Float32Array(4 * this.d);
  }

  /** Fold in frame t (theta at t and t-1); frames before warmup are skipped. */
  push(theta, t, C, G, N) {
    if (t < this.warmup) return false;
    const d = this.d, off = t * C * N, prev = (t - 1) * C * N;
    for (let i = 0; i < d; i++) {
      const s = Math.sin(theta[off + i]), c = Math.cos(theta[off + i]);
      const s0 = Math.sin(theta[prev + i]), c0 = Math.cos(theta[prev + i]);
      this.sumSin[i] += s;
      this.sumCos[i] += c;
      this.sumCosD[i] += c * c0 + s * s0;   // cos(theta_t - theta_{t-1})
      this.sumSinD[i] += s * c0 - c * s0;   // sin(theta_t - theta_{t-1})
    }
    this.count++;
    return true;
  }

  /** Current means as the 4 * C * G * G feature vector. */
  read() {
    const n = Math.max(1, this.count), d = this.d, f = this.features;
    for (let i = 0; i < d; i++) {
      f[i] = this.sumSin[i] / n;
      f[d + i] = this.sumCos[i] / n;
      f[2 * d + i] = this.sumCosD[i] / n;
      f[3 * d + i] = this.sumSinD[i] / n;
    }
    return f;
  }
}

/** logits = f @ W + b, then softmax. */
export function classify(features, readout) {
  const K = readout.classes, D = readout.feat_dim;
  const logits = new Float32Array(K);
  for (let k = 0; k < K; k++) {
    let acc = readout.bias[k];
    for (let i = 0; i < D; i++) acc += features[i] * readout.weight[i * K + k];
    logits[k] = acc;
  }
  const max = Math.max(...logits);
  let z = 0;
  const probs = new Float32Array(K);
  for (let k = 0; k < K; k++) { probs[k] = Math.exp((logits[k] - max) * 4); z += probs[k]; }
  for (let k = 0; k < K; k++) probs[k] /= z;   // temperature 4: the readout's margins are ~1
  return { logits, probs };
}

/**
 * Run everything for one clip.
 * dials: {gain, damping, couplingScale} — live controls; leave empty for the
 * configuration the readout was fitted at.
 */
export function runClip(samples, model, dials = {}) {
  const { frontend, core, readout } = model;
  const t0 = performance.now();
  const { spec, mel } = analyze(samples, frontend.melFb, frontend);
  const T = mel.frames;
  const field = new TorusField(core);
  const sim = field.simulate(mel.rows, T, {
    gain: dials.gain ?? core.gain,
    damping: dials.damping ?? core.damping,
    couplingScale: dials.couplingScale ?? 1.0,
  });

  // running readout: the model's opinion after every frame it has heard
  const acc = new FeatureAccumulator(sim.C, sim.G, readout.warmup);
  const running = [];
  for (let t = 0; t < T; t++) {
    if (!acc.push(sim.theta, t, sim.C, sim.G, sim.N)) { running.push(null); continue; }
    running.push(classify(acc.read(), readout));
  }
  const final = classify(acc.read(), readout);
  return {
    spec, mel, sim, running, final,
    features: acc.features.slice(),
    ms: performance.now() - t0,
  };
}

/**
 * Compare against the Python reference shipped in model.json. Returns the
 * relative error of the drive-row and feature checksums plus whether the
 * predicted digit agrees — a real check that the port did not drift.
 */
export function checkParity(result, clipMeta) {
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const rows = sum(Array.from(result.mel.rows));
  const feats = sum(Array.from(result.features));
  const rel = (a, b) => Math.abs(a - b) / Math.max(1e-6, Math.abs(b));
  return {
    rowsError: rel(rows, clipMeta.rows_checksum),
    featureError: rel(feats, clipMeta.feature_checksum),
    predicted: result.final.logits.indexOf(Math.max(...result.final.logits)),
    expected: clipMeta.logits.indexOf(Math.max(...clipMeta.logits)),
  };
}
