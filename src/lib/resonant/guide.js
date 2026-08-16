// Mounts the interactive parts of the Resonant guide onto markup React has
// already rendered. React owns the DOM; these modules own the canvases.
//
// Everything is keyed by id, so the guide component must render the same ids.
// mountGuide() returns a cleanup function — it stops audio, cancels animation
// frames, and drops listeners.

import { decodeWav } from './wav.js';
import { loadModel, runClip, checkParity } from './pipeline.js';
import { drawWaveform, drawHeatmap, drawCurve, phaseColor, fitCanvas } from './plots.js';
import { ClipPlayer } from './player.js';
import { mountConsole } from './console.js';

const $ = (sel) => document.querySelector(sel);
const AUDIO_URL = (digit) => `/resonant/audio/digit-${digit}.wav`;
/** Playback key for the microphone take — a map key, never fetched. */
const LIVE_CLIP_KEY = 'live://microphone';

export async function mountGuide() {
  const state = {
    model: null,
    clips: [],
    index: 0,
    result: null,
    player: new ClipPlayer(),
  };
  const disposers = [];
  const on = (el, type, fn, opts) => {
    if (!el) return;
    el.addEventListener(type, fn, opts);
    disposers.push(() => el.removeEventListener(type, fn, opts));
  };

  state.model = await loadModel();
  const acc = $('#accInline');
  if (acc) acc.textContent = `${(state.model.meta.test_accuracy * 100).toFixed(1)}%`;

  state.clips = await Promise.all(state.model.clips.map(async (meta) => {
    const url = AUDIO_URL(meta.digit);
    const arrayBuffer = await (await fetch(url)).arrayBuffer();
    const { samples, sampleRate } = decodeWav(arrayBuffer);
    return { digit: meta.digit, url, samples, sampleRate, arrayBuffer, meta };
  }));

  // band centre frequency = the STFT bin where this filter peaks (read straight
  // off the shipped filterbank, so the labels can never drift from the maths)
  const bandCenters = computeBandCenters(state.model.frontend);

  buildPicker();
  buildDigitSelect();
  drawMelReference(clipMeanEnergy());
  mountToy(disposers);
  const consoleApi = mountConsole(state, { selectClip, setLiveClip });
  disposers.push(() => consoleApi.dispose());
  wireControls();
  selectClip(state.clips.findIndex((c) => c.digit === 7));
  reportParity();

  const tag = $('#loadTag');
  if (tag) {
    tag.textContent = `${state.clips.length} clips · ${state.model.core.channels}×${state.model.core.grid}² oscillators`;
    tag.classList.add('ok');
  }

  const onResize = () => redrawFigures();
  window.addEventListener('resize', onResize);
  disposers.push(() => window.removeEventListener('resize', onResize));
  disposers.push(() => state.player.stop());

  return () => disposers.forEach((d) => d());

  // --- clip selection ------------------------------------------------------

  function buildPicker() {
    const host = $('#clipPicker');
    if (!host) return;
    host.innerHTML = '';
    state.clips.forEach((clip, i) => {
      const b = document.createElement('button');
      b.className = 'digitBtn';
      b.type = 'button';
      b.textContent = clip.digit;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => selectClip(i));
      host.appendChild(b);
    });
  }

  /** The console's own clip chooser (section 07). Corpus clips only. */
  function buildDigitSelect() {
    const sel = $('#consoleDigit');
    if (!sel) return;
    sel.innerHTML = '';
    state.clips.forEach((clip, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `digit ${clip.digit} · speaker ${clip.meta.speaker}`;
      sel.appendChild(opt);
    });
    on(sel, 'change', () => selectClip(Number(sel.value)));
  }

  /**
   * Install a conditioned microphone take as a clip and select it. There is one
   * live slot, past the corpus clips: recording again replaces it rather than
   * growing the list, and it is deliberately not an option in the chooser —
   * the chooser keeps naming the corpus clip you would go back to.
   */
  function setLiveClip(samples, sampleRate) {
    const existing = state.clips.findIndex((c) => c.meta.live);
    const index = existing >= 0 ? existing : state.clips.length;
    state.clips[index] = {
      digit: null,                       // no ground truth for your own voice
      url: LIVE_CLIP_KEY,
      samples,
      sampleRate,
      arrayBuffer: null,                 // prepared from samples, not a file
      meta: { live: true, speaker: 'you' },
    };
    state.player.prepareSamples(LIVE_CLIP_KEY, samples, sampleRate);
    selectClip(index);
    return index;
  }

  function selectClip(i) {
    if (i < 0 || i >= state.clips.length) return;
    state.index = i;
    const clip = state.clips[i];
    const live = Boolean(clip.meta.live);
    const picker = $('#clipPicker');
    if (picker) [...picker.children].forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    // the chooser has no option for a live take — leave it naming the corpus
    // clip you would return to rather than blanking it
    const sel = $('#consoleDigit');
    if (sel && !live) sel.value = String(i);
    const meta = $('#clipMeta');
    if (meta) {
      meta.textContent = live
        ? 'your own recording · trimmed and levelled to match the corpus'
        : `spoken “${clip.digit}” · AudioMNIST speaker ${clip.meta.speaker} · held out of training`;
    }
    state.result = runClip(clip.samples, state.model);
    if (clip.arrayBuffer) state.player.prepare(clip.url, clip.arrayBuffer);
    const melBtn = $('#melPlayBtn');
    if (melBtn && !state.player.playing) {
      melBtn.textContent = live
        ? '▶ Play your recording and watch the bands'
        : `▶ Play “${clip.digit}” and watch the bands`;
    }
    redrawFigures();
    drawMelReference(clipMeanEnergy());
    document.dispatchEvent(new CustomEvent('resonant:clip-changed'));
  }

  /** Prove the browser port still agrees with the Python export. */
  function reportParity() {
    const rows = state.clips.map((clip, i) => {
      const res = i === state.index ? state.result : runClip(clip.samples, state.model);
      const p = checkParity(res, clip.meta);
      return {
        digit: clip.digit, predicted: p.predicted, python: p.expected,
        'rows Δ': p.rowsError.toExponential(1), 'features Δ': p.featureError.toExponential(1),
      };
    });
    const agree = rows.every((r) => r.predicted === r.python);
    console.log(`%cresonant parity vs python: ${agree ? 'OK' : 'MISMATCH'} (${rows.length} digits)`,
                `color:${agree ? '#6ee7a8' : '#ff8a5b'};font-weight:600`);
    console.table(rows);
  }

  // --- teaching figures ----------------------------------------------------

  function redrawFigures() {
    const clip = state.clips[state.index];
    if (!clip || !state.result) return;
    const { spec, mel } = state.result;
    drawWaveform($('#waveCanvas'), clip.samples, { window: fftWindowFraction() });
    drawFftFigure();
    drawHeatmap($('#stftCanvas'), logPower(spec), spec.frames, spec.bins, { dynamicRange: 12 });
    drawHeatmap($('#melSpecCanvas'), mel.logMel, mel.frames, mel.mels, { dynamicRange: 11 });
    document.dispatchEvent(new CustomEvent('resonant:figures-redrawn'));
  }

  function logPower(spec) {
    const out = new Float32Array(spec.power.length);
    for (let i = 0; i < out.length; i++) out[i] = Math.log(spec.power[i] + 1e-6);
    return out;
  }

  function fftFrame() {
    const pos = Number($('#fftPos')?.value ?? 45) / 100;
    return Math.min(state.result.spec.frames - 1, Math.round(pos * (state.result.spec.frames - 1)));
  }

  function fftWindowFraction() {
    const clip = state.clips[state.index];
    const { n_fft, hop } = state.model.frontend;
    const start = fftFrame() * hop;
    return [start / clip.samples.length, (start + n_fft) / clip.samples.length];
  }

  function drawFftFigure() {
    const clip = state.clips[state.index];
    const { spec } = state.result;
    const { sample_rate, n_fft } = state.model.frontend;
    const t = fftFrame();
    drawWaveform($('#fftWaveCanvas'), clip.samples, { window: fftWindowFraction() });

    const xs = [], ys = [];
    for (let k = 0; k < spec.bins; k++) {
      xs.push((k * sample_rate) / n_fft);
      ys.push(10 * Math.log10(spec.power[t * spec.bins + k] + 1e-10));
    }
    drawCurve($('#fftSpecCanvas'), xs, ys, {
      xmin: 0, xmax: sample_rate / 2, ymin: -100, ymax: 10, fill: 'rgba(124, 196, 255, 0.16)',
      xTicks: [{ value: 0, label: '0' }, { value: 2000, label: '2k' },
               { value: 4000, label: '4k' }, { value: 6000, label: '6k' },
               { value: 8000, label: '8k Hz' }],
      yTicks: [{ value: 0, label: ' 0 dB' }, { value: -50, label: '-50' }, { value: -100, label: '-100' }],
    });
    const secs = (t * state.model.frontend.hop) / sample_rate;
    const label = $('#fftPosLabel');
    if (label) label.textContent = `${secs.toFixed(3)} s → ${(secs + n_fft / sample_rate).toFixed(3)} s`;
  }

  // --- section 04: which frequencies does THIS clip actually use? -----------

  /** Peak-response frequency of each mel filter, in Hz. */
  function computeBandCenters(frontend) {
    const { n_mels, melFb, sample_rate, n_fft } = frontend;
    const bins = melFb.length / n_mels;
    const centers = [];
    for (let m = 0; m < n_mels; m++) {
      let best = 0, bestV = -Infinity;
      for (let k = 0; k < bins; k++) {
        const v = melFb[k * n_mels + m];
        if (v > bestV) { bestV = v; best = k; }
      }
      centers.push((best * sample_rate) / n_fft);
    }
    return centers;
  }

  /** Per-band energy of one frame (or the clip average), normalised to [0, 1]. */
  function bandEnergy(frame) {
    const { mel } = state.result;
    const out = new Float32Array(mel.mels);
    if (frame === undefined) {
      for (let t = 0; t < mel.frames; t++) {
        for (let m = 0; m < mel.mels; m++) out[m] += mel.rows[t * mel.mels + m];
      }
      for (let m = 0; m < mel.mels; m++) out[m] /= mel.frames;
    } else {
      const t = Math.max(0, Math.min(mel.frames - 1, frame));
      for (let m = 0; m < mel.mels; m++) out[m] = mel.rows[t * mel.mels + m];
    }
    let max = 0;
    for (let m = 0; m < out.length; m++) max = Math.max(max, out[m]);
    // normalise, then apply a gamma so the loud bands separate visibly from the
    // merely-present ones — the point of the figure is WHICH bands, not how many
    if (max > 0) for (let m = 0; m < out.length; m++) out[m] = (out[m] / max) ** 1.8;
    return out;
  }

  // declaration, not a const arrow: the mount sequence calls this before the
  // definition is reached
  function clipMeanEnergy() {
    return state.result ? bandEnergy(undefined) : null;
  }

  /**
   * The two mel panels, lit by whatever the clip is doing: filter triangles
   * fill with their band's energy, and the Hz->mel curve grows a marker per
   * band so you can read the active frequencies straight off the ear's ruler.
   */
  function drawMelReference(energy) {
    const { sample_rate, n_mels, melFb } = state.model.frontend;
    const hzToMel = (f) => 2595 * Math.log10(1 + f / 700);
    const bandColor = (m) => phaseColor((m / n_mels) * 2 * Math.PI);

    const xs = [], ys = [];
    for (let f = 0; f <= sample_rate / 2; f += 20) { xs.push(f); ys.push(hzToMel(f)); }
    const markers = [];
    if (energy) {
      bandCenters.forEach((hz, m) => {
        if (energy[m] > 0.12) {
          markers.push({ x: hz, y: hzToMel(hz), color: bandColor(m), weight: energy[m] });
        }
      });
    }
    drawCurve($('#melCurveCanvas'), xs, ys, {
      xTicks: [{ value: 0, label: '0' }, { value: 4000, label: '4k' }, { value: 8000, label: '8k Hz' }],
      yTicks: [{ value: 0, label: '0' }, { value: hzToMel(4000), label: `${Math.round(hzToMel(4000))}` },
               { value: hzToMel(8000), label: `${Math.round(hzToMel(8000))} mel` }],
      markers, dropLines: true,
    });

    const canvas = $('#melFbCanvas');
    if (!canvas) return;
    const ctx = fitCanvas(canvas);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const bins = melFb.length / n_mels;
    let peak = 0;
    for (let i = 0; i < melFb.length; i++) peak = Math.max(peak, melFb[i]);
    for (let m = 0; m < n_mels; m++) {
      const lit = energy ? energy[m] : 1;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let k = 0; k < bins; k++) {
        ctx.lineTo((k / (bins - 1)) * w, h - (melFb[k * n_mels + m] / peak) * (h - 10));
      }
      ctx.lineTo(w, h);
      const col = bandColor(m);
      ctx.fillStyle = col.replace('hsl', 'hsla').replace(')', `, ${(0.10 + 0.75 * lit).toFixed(3)})`);
      ctx.strokeStyle = col.replace('hsl', 'hsla').replace(')', `, ${(0.25 + 0.75 * lit).toFixed(3)})`);
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#8d96ab';
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillText('0 Hz', 2, h - 3);
    ctx.fillText('8 kHz', w - 34, h - 3);
  }

  function frameForTime(seconds) {
    const { sample_rate, hop, n_fft } = state.model.frontend;
    return Math.round((seconds * sample_rate - n_fft / 2) / hop);
  }

  // --- controls ------------------------------------------------------------

  function wireControls() {
    on($('#fftPos'), 'input', () => {
      drawFftFigure();
      drawWaveform($('#waveCanvas'), state.clips[state.index].samples, { window: fftWindowFraction() });
    });

    on($('#playBtn'), 'click', () => {
      const clip = state.clips[state.index];
      if (state.player.playing) { state.player.stop(); return; }
      state.player.play(clip.url, {
        onTick: (_, frac) => drawWaveform($('#waveCanvas'), clip.samples,
                                          { window: fftWindowFraction(), playhead: frac }),
        onEnd: () => drawWaveform($('#waveCanvas'), clip.samples, { window: fftWindowFraction() }),
      });
    });

    // section 04: play the digit and watch the filterbank light up
    const melBtn = $('#melPlayBtn');
    on(melBtn, 'click', () => {
      const clip = state.clips[state.index];
      if (state.player.playing) { state.player.stop(); return; }
      melBtn.textContent = '■ Stop';
      const status = $('#melPlayStatus');
      state.player.play(clip.url, {
        onTick: (seconds, frac) => {
          drawMelReference(bandEnergy(frameForTime(seconds)));
          drawHeatmap($('#melSpecCanvas'), state.result.mel.logMel, state.result.mel.frames,
                      state.result.mel.mels, { dynamicRange: 11, playhead: frac });
          if (status) status.textContent = `live · frame ${Math.max(1, frameForTime(seconds) + 1)}`;
        },
        onEnd: () => {
          melBtn.textContent = clip.meta.live
            ? '▶ Play your recording and watch the bands'
            : `▶ Play “${clip.digit}” and watch the bands`;
          if (status) status.textContent = 'showing the clip average';
          drawMelReference(clipMeanEnergy());
          drawHeatmap($('#melSpecCanvas'), state.result.mel.logMel, state.result.mel.frames,
                      state.result.mel.mels, { dynamicRange: 11 });
        },
      });
    });
  }

  // --- figure 8: the toy ring ----------------------------------------------

  function mountToy(sinks) {
    const canvas = $('#toyCanvas');
    if (!canvas) return;
    const n = 24;
    const omega = Array.from({ length: n }, (_, i) => 0.6 + 1.6 * (i / (n - 1)) ** 1.4);
    const theta = Array.from({ length: n }, (_, i) => (i * 2.399) % (2 * Math.PI));
    let last = performance.now();
    let raf = 0;
    let alive = true;

    const frame = (now) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const K = Number($('#toyK')?.value ?? 0) / 100;
      let sx = 0, sy = 0;
      for (let i = 0; i < n; i++) { sx += Math.cos(theta[i]); sy += Math.sin(theta[i]); }
      const R = Math.hypot(sx, sy) / n, psi = Math.atan2(sy, sx);
      for (let i = 0; i < n; i++) {
        theta[i] += dt * (omega[i] + K * R * Math.sin(psi - theta[i]));  // mean-field form
        theta[i] %= 2 * Math.PI;
      }

      const ctx = fitCanvas(canvas);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const cx = w / 2, cy = h / 2, rad = Math.min(w, h) * 0.36;
      ctx.strokeStyle = 'rgba(255,255,255,0.13)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.stroke();
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = phaseColor(theta[i]);
        ctx.beginPath();
        ctx.arc(cx + rad * Math.cos(theta[i]), cy - rad * Math.sin(theta[i]), 6, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.strokeStyle = '#ff8a5b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * rad * Math.cos(psi), cy - R * rad * Math.sin(psi));
      ctx.stroke();
      ctx.fillStyle = '#ff8a5b';
      ctx.beginPath();
      ctx.arc(cx + R * rad * Math.cos(psi), cy - R * rad * Math.sin(psi), 4, 0, 2 * Math.PI);
      ctx.fill();

      const kv = $('#toyKVal'), lab = $('#toyLabel');
      if (kv) kv.textContent = K.toFixed(2);
      if (lab) lab.textContent = `K = ${K.toFixed(2)} · R = ${R.toFixed(2)}`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    sinks.push(() => { alive = false; cancelAnimationFrame(raf); });
  }
}
