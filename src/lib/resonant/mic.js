// Microphone capture for the live console.
//
// The readout was fitted on AudioMNIST: 16 kHz mono, exactly one second per
// clip, peak-normalised, with the word starting almost immediately. A browser
// microphone gives none of that — 44.1 or 48 kHz, arbitrary length, arbitrary
// level, and usually a beat of silence before the speaker says anything.
//
// Conditioning is therefore not cosmetic. The front end's log-mel step ends in
// a FIXED affine, (log energy + 10) / 10 clamped at zero (dsp.js), so absolute
// level lands directly in the drive rows; and the featurizer drops the first
// `warmup` frames (pipeline.js), so where in the second the word sits decides
// how much of it is read at all. This module reshapes a recording into the
// corpus's shape before it goes anywhere near the pipeline.

/** Measured off public/resonant/audio: every corpus clip peaks at exactly 0.5. */
const CORPUS_PEAK = 0.5;
/**
 * Corpus words start between 0.00 s and 0.10 s. Sweeping this offset over the
 * ten shipped clips — trim each, re-place it, re-run — the readout's confidence
 * in the true digit peaks broadly around 0.02–0.06 s and falls off past 0.08 s.
 */
const LEAD_SECONDS = 0.04;
/** Hop of the peak-envelope used to find the word. */
const ENVELOPE_SECONDS = 0.01;
/** Envelope fraction that counts as speech rather than room tone. */
const ONSET_FRACTION = 0.06;
/**
 * ...but in a room the quiet 6% is the noise floor, not silence, and the trim
 * then swallows the whole recording. So the threshold also has to clear the
 * floor itself, estimated as this percentile of the envelope, by FLOOR_MARGIN.
 * On the shipped clips buried in white noise at 26 dB peak SNR this is the
 * difference between 6/10 and 9/10 read correctly; on clean audio it changes
 * nothing.
 */
const FLOOR_PERCENTILE = 0.2;
const FLOOR_MARGIN = 3;
/** Below this peak the recording is silence, whatever the envelope shape says. */
const MIN_PEAK = 0.012;
/** Shorter than this and it is a click or a breath, not a digit. */
const MIN_SPEECH_SECONDS = 0.08;
/**
 * Slack around the detected word. A threshold tight enough to reject room tone
 * also clips the quiet edges of speech — the breathy start of “six”, the “n”
 * decaying at the end of “seven”. The head pad stays small because it shifts
 * the whole word later in the window; the tail pad costs nothing.
 */
const HEAD_PAD_SECONDS = 0.02;
const TAIL_PAD_SECONDS = 0.1;
/** One-pole high-pass corner: desk rumble and DC that the corpus does not have. */
const HIGHPASS_HZ = 70;
/** Longest recording we keep; a spoken digit needs a fraction of this. */
const MAX_SECONDS = 3;

const CAPTURE_PROCESSOR = 'resonant-capture';

/** Worklet source: forward every render quantum of the microphone to us. */
const CAPTURE_WORKLET = `
class CaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel && channel.length) this.port.postMessage(new Float32Array(channel));
    return true;
  }
}
registerProcessor('${CAPTURE_PROCESSOR}', CaptureProcessor);
`;

/** Can this browser record at all? (getUserMedia is secure-context only.) */
export function micSupported() {
  return typeof window !== 'undefined'
    && window.isSecureContext !== false
    && !!navigator.mediaDevices?.getUserMedia
    && typeof window.AudioWorkletNode === 'function'
    && !!(window.AudioContext || window.webkitAudioContext);
}

/** Human-readable reason a getUserMedia call failed. */
export function micErrorMessage(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'microphone blocked — allow it in the address bar';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'no microphone found';
    case 'NotReadableError':
      return 'the microphone is busy in another app';
    default:
      return 'could not start the microphone';
  }
}

/**
 * Records raw mono float samples from the default input.
 *
 * Capture goes through an AudioWorklet rather than MediaRecorder so the samples
 * never pass through a lossy codec — the whole point of the page is that the
 * arithmetic matches the Python export.
 */
export class MicRecorder {
  constructor({ sampleRate = 16000, maxSeconds = MAX_SECONDS } = {}) {
    this.requestedRate = sampleRate;
    this.maxSeconds = maxSeconds;
    this.ctx = null;
    this.stream = null;
    this.node = null;
    this.source = null;
    this.sink = null;
    this.moduleUrl = null;
    this.chunks = [];
    this.length = 0;
    this.level = 0;
    this.active = false;
  }

  get recording() { return this.active; }

  /**
   * Open the microphone and start collecting.
   * onLevel(level, seconds) fires per audio block; onLimit() when maxSeconds is
   * reached, so the caller can stop and process exactly as if the user had.
   */
  async start({ onLevel = null, onLimit = null } = {}) {
    if (this.active) return;
    // the context is built first and synchronously: iOS only allows one inside
    // a user gesture, and awaiting getUserMedia first can spend that gesture.
    // The requested rate is a hint — where the browser honours it there is no
    // resampling to do later, and conditionClip handles it when it does not.
    const Ctx = window.AudioContext || window.webkitAudioContext;
    try {
      this.ctx = new Ctx({ sampleRate: this.requestedRate });
    } catch {
      this.ctx = new Ctx();
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        // the corpus is clean, and this front end is unusually sensitive to a
        // raised noise floor — the log-mel clamp turns steady room tone into a
        // drive row that never stops pushing — so leave the browser's noise
        // suppression on. Gain control stays off: conditionClip sets the level,
        // and an AGC riding the word would fight it.
        echoCancellation: false,
        noiseSuppression: true,
        autoGainControl: false,
      },
    });
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    this.moduleUrl = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: 'application/javascript' }));
    await this.ctx.audioWorklet.addModule(this.moduleUrl);

    this.chunks = [];
    this.length = 0;
    this.level = 0;
    this.active = true;

    const rate = this.ctx.sampleRate;
    const limit = Math.round(this.maxSeconds * rate);
    this.node = new AudioWorkletNode(this.ctx, CAPTURE_PROCESSOR);
    this.node.port.onmessage = (event) => {
      if (!this.active) return;
      const block = event.data;
      this.chunks.push(block);
      this.length += block.length;
      let peak = 0;
      for (let i = 0; i < block.length; i++) peak = Math.max(peak, Math.abs(block[i]));
      this.level = Math.max(peak, this.level * 0.82);   // fast attack, slow release
      if (onLevel) onLevel(this.level, this.length / rate);
      if (this.length >= limit && onLimit) onLimit();
    };

    this.source = this.ctx.createMediaStreamSource(this.stream);
    // a silent sink: a worklet with no downstream connection is not guaranteed
    // to be pulled, and routing the microphone to the speakers would howl
    this.sink = this.ctx.createGain();
    this.sink.gain.value = 0;
    this.source.connect(this.node).connect(this.sink).connect(this.ctx.destination);
  }

  /** Stop capture; returns {samples, sampleRate} at whatever rate we recorded. */
  stop() {
    if (!this.active) return null;
    this.active = false;
    const sampleRate = this.ctx.sampleRate;
    const samples = new Float32Array(this.length);
    let offset = 0;
    for (const block of this.chunks) { samples.set(block, offset); offset += block.length; }
    this.chunks = [];
    this.length = 0;
    this._teardown();
    return { samples, sampleRate };
  }

  /** Release the microphone whether or not anything was captured. */
  dispose() {
    this.active = false;
    this.chunks = [];
    this.length = 0;
    this._teardown();
  }

  _teardown() {
    if (this.node) { this.node.port.onmessage = null; this.node.disconnect(); this.node = null; }
    if (this.source) { this.source.disconnect(); this.source = null; }
    if (this.sink) { this.sink.disconnect(); this.sink = null; }
    if (this.stream) { this.stream.getTracks().forEach((t) => t.stop()); this.stream = null; }
    if (this.ctx) { this.ctx.close().catch(() => {}); this.ctx = null; }
    if (this.moduleUrl) { URL.revokeObjectURL(this.moduleUrl); this.moduleUrl = null; }
  }
}

/** Resample through an OfflineAudioContext — the browser's own converter. */
async function resample(samples, from, to) {
  if (from === to || samples.length === 0) return samples;
  const frames = Math.max(1, Math.round((samples.length * to) / from));
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offline = new Offline(1, frames, to);
  const buffer = offline.createBuffer(1, samples.length, from);
  buffer.copyToChannel(samples, 0);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0).slice();
}

/** One-pole high-pass. Removes DC and low rumble the corpus clips do not carry. */
function highPass(samples, rate, cutoffHz = HIGHPASS_HZ) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const alpha = rc / (rc + 1 / rate);
  const out = new Float32Array(samples.length);
  let prevIn = 0, prevOut = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    prevOut = alpha * (prevOut + x - prevIn);
    prevIn = x;
    out[i] = prevOut;
  }
  return out;
}

/**
 * Where the word is. Peak envelope in 10 ms hops, then the first and last hop
 * above a fraction of the loudest one — deliberately blunt, because the only
 * job is to strip the silence a person leaves around a single spoken digit.
 * Returns null when nothing in the recording is loud enough to be speech.
 */
function speechBounds(samples, rate) {
  const win = Math.max(1, Math.round(ENVELOPE_SECONDS * rate));
  const hops = Math.ceil(samples.length / win);
  const env = new Float32Array(hops);
  let peak = 0;
  for (let t = 0; t < hops; t++) {
    let m = 0;
    const end = Math.min(samples.length, (t + 1) * win);
    for (let i = t * win; i < end; i++) m = Math.max(m, Math.abs(samples[i]));
    env[t] = m;
    peak = Math.max(peak, m);
  }
  if (peak < MIN_PEAK) return null;

  const quiet = Float32Array.from(env).sort();
  const floor = quiet[Math.floor(quiet.length * FLOOR_PERCENTILE)];
  const threshold = Math.max(peak * ONSET_FRACTION, floor * FLOOR_MARGIN);
  let first = -1, last = -1;
  for (let t = 0; t < hops; t++) {
    if (env[t] < threshold) continue;
    if (first < 0) first = t;
    last = t;
  }
  if (first < 0) return null;
  return {
    start: Math.max(0, first * win - Math.round(HEAD_PAD_SECONDS * rate)),
    end: Math.min(samples.length, (last + 1) * win + Math.round(TAIL_PAD_SECONDS * rate)),
    // how far the word stands above the room, which is the number that decides
    // whether the readout has a chance: this front end was fitted on clean audio
    snrDb: 20 * Math.log10(peak / Math.max(floor, 1e-7)),
  };
}

/**
 * Recording in, one corpus-shaped clip out: resampled to the model's rate,
 * high-passed, trimmed to the word, placed at the corpus's lead-in, zero-padded
 * to exactly clip_samples, and peak-normalised to the corpus's level.
 *
 * Returns null if the recording holds no speech, otherwise
 * {samples, sampleRate, seconds, truncated, snrDb}.
 */
export async function conditionClip(raw, rawRate, frontend) {
  const rate = frontend.sample_rate;
  const total = frontend.clip_samples;
  const cleaned = highPass(await resample(raw, rawRate, rate), rate);

  const bounds = speechBounds(cleaned, rate);
  if (!bounds) return null;
  const spoken = cleaned.subarray(bounds.start, bounds.end);
  if (spoken.length < MIN_SPEECH_SECONDS * rate) return null;

  const lead = Math.round(LEAD_SECONDS * rate);
  const room = total - lead;
  const clip = new Float32Array(total);
  clip.set(spoken.subarray(0, Math.min(spoken.length, room)), lead);

  let peak = 0;
  for (let i = 0; i < clip.length; i++) peak = Math.max(peak, Math.abs(clip[i]));
  if (peak > 0) {
    const scale = CORPUS_PEAK / peak;
    for (let i = 0; i < clip.length; i++) clip[i] *= scale;
  }

  return {
    samples: clip,
    sampleRate: rate,
    seconds: spoken.length / rate,
    truncated: spoken.length > room,
    snrDb: bounds.snrDb,
  };
}
