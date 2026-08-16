// Section 07: the live console. Runs the full pipeline for the selected clip
// at whatever the dials say, then plays the audio back with every panel driven
// off the same frame index, so what you hear and what you see are the same
// instant of the simulation.

import { runClip } from './pipeline.js';
import { drawWaveform, drawHeatmap, drawField, drawLines, drawBars } from './plots.js';
import { TorusView } from './torus3d.js';

const $ = (sel) => document.querySelector(sel);
const CHANNEL_COLORS = ['#7cc4ff', '#6ee7a8', '#ffd166', '#ff8a5b'];

export function mountConsole(state) {
  const model = state.model;
  const { grid: G, channels: C } = model.core;
  const view = new TorusView($('#torusCanvas'), G);
  const local = { channel: 0, result: null, frame: 0, dials: defaultDials(model) };
  const disposers = [];
  const on = (el, type, fn) => {
    if (!el) return;
    el.addEventListener(type, fn);
    disposers.push(() => el.removeEventListener(type, fn));
  };

  buildReadoutBars();
  wireDials();
  wireButtons();

  on(document, 'resonant:clip-changed', () => recompute());
  on(document, 'resonant:figures-redrawn', () => draw(local.frame));

  // the 3-D view keeps rendering whether or not audio is playing
  let raf = 0, alive = true, last = performance.now();
  const loop = (now) => {
    if (!alive) return;
    view.render((now - last) / 1000);
    last = now;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  disposers.push(() => { alive = false; cancelAnimationFrame(raf); view.dispose(); });

  // --- simulation ----------------------------------------------------------

  function defaultDials(m) {
    return { gain: m.core.gain, damping: m.core.damping, couplingScale: 1 };
  }

  function isFitted() {
    const d = local.dials, c = model.core;
    return d.gain === c.gain && d.damping === c.damping && d.couplingScale === 1;
  }

  function recompute() {
    const clip = state.clips[state.index];
    if (!clip) return;
    local.result = runClip(clip.samples, model, local.dials);
    local.frame = local.result.sim.T - 1;
    // R sits well below 1 in this regime — scale the axis to the clip so the
    // shape of the trace is visible instead of a flat line along the bottom
    local.maxR = Math.max(0.15, 1.15 * local.result.sim.R.reduce((a, b) => Math.max(a, b), 0));
    $('#rScale').textContent = `0 – ${local.maxR.toFixed(2)}`;
    $('#mTruth').textContent = clip.digit;
    $('#mMs').textContent = `${local.result.ms.toFixed(0)} ms`;
    const tag = $('#dialTag');
    tag.textContent = isFitted() ? 'as fitted' : 'off-nominal';
    tag.className = `tag ${isFitted() ? 'ok' : 'off'}`;
    draw(local.frame);
  }

  // --- drawing -------------------------------------------------------------

  function draw(frame) {
    if (!local.result) return;
    const clip = state.clips[state.index];
    const { sim, mel, running, final } = local.result;
    const t = Math.max(0, Math.min(sim.T - 1, frame));
    const frac = (t + 0.5) / sim.T;

    // input panels
    drawWaveform($('#liveWaveCanvas'), clip.samples, { playhead: frac });
    drawHeatmap($('#liveMelCanvas'), mel.logMel, mel.frames, mel.mels,
                { dynamicRange: 11, playhead: frac, highlightRow: loudestRow(mel, t) });

    // drive rows entering the field right now
    const rows = Array.from(mel.rows.slice(t * mel.mels, (t + 1) * mel.mels));
    drawBars($('#driveCanvas'), rows, { max: 1.6 });

    // order parameter per channel, up to now
    const series = [];
    for (let c = 0; c < C; c++) {
      const values = [];
      for (let k = 0; k <= t; k++) values.push(sim.R[k * C + c]);
      series.push({ values, color: CHANNEL_COLORS[c], width: c === local.channel ? 2.2 : 1.2 });
    }
    drawLines($('#rCanvas'), series, { yMax: local.maxR });

    // the field: 3-D torus for the selected channel, flat grids for all four
    const base = t * C * sim.N;
    view.update(sim.theta, base + local.channel * sim.N, loudestRow(mel, t));
    document.querySelectorAll('.fieldGrid').forEach((canvas) => {
      const ch = Number(canvas.dataset.ch);
      drawField(canvas, sim.theta, base + ch * sim.N, G,
                { highlightRow: ch === local.channel ? loudestRow(mel, t) : -1 });
    });

    // readout: the model's opinion using everything heard so far
    const verdict = running[t] || final;
    updateReadout(verdict, clip.digit, t, sim.T);

    // metrics + strip
    let meanR = 0;
    for (let c = 0; c < C; c++) meanR += sim.R[t * C + c];
    $('#mR').textContent = (meanR / C).toFixed(3);
    $('#timeLabel').textContent = `${((t * model.frontend.hop) / model.frontend.sample_rate).toFixed(2)} s · frame ${t + 1}/${sim.T}`;
    $('#chanLabel').textContent = `channel ${local.channel + 1} of ${C}`;
    setStrip(t, sim.T);
  }

  function loudestRow(mel, t) {
    let best = 0, bestV = -Infinity;
    for (let m = 0; m < mel.mels; m++) {
      const v = mel.rows[t * mel.mels + m];
      if (v > bestV) { bestV = v; best = m; }
    }
    return bestV > 0.05 ? best : -1;
  }

  function buildReadoutBars() {
    const host = $('#readoutBars');
    host.innerHTML = '';
    for (let k = 0; k < 10; k++) {
      const row = document.createElement('div');
      row.className = 'readoutRow';   // must match resonant.css
      row.innerHTML = `<span>${k}</span><div class="bar"><i style="width:0%"></i></div><span class="pct">0%</span>`;
      host.appendChild(row);
    }
  }

  function updateReadout(verdict, truth, t, T) {
    const probs = verdict.probs;
    let top = 0;
    for (let k = 1; k < 10; k++) if (probs[k] > probs[top]) top = k;
    [...$('#readoutBars').children].forEach((row, k) => {
      row.querySelector('i').style.width = `${(probs[k] * 100).toFixed(1)}%`;
      row.querySelector('.pct').textContent = `${Math.round(probs[k] * 100)}%`;
      row.classList.toggle('win', k === top);
    });
    $('#mPred').textContent = top;
    const settled = t >= T - 1;
    const tag = $('#verdictTag');
    tag.textContent = settled
      ? (top === truth ? `correct · “${top}”` : `wrong · said “${top}”`)
      : 'listening…';
    tag.style.color = settled ? (top === truth ? 'var(--good)' : 'var(--hot)') : 'var(--muted)';
  }

  function setStrip(t, T) {
    // the front-end stages are done for every frame already; light the pipeline
    // up in order during the first moments, then hold everything lit
    const progress = t / Math.max(1, T - 1);
    document.querySelectorAll('#pipelineStrip .stage').forEach((el, i) => {
      el.classList.toggle('live', progress * 6 >= i || t >= T - 1);
    });
  }

  // --- controls ------------------------------------------------------------

  function wireDials() {
    const bind = (id, label, scale, apply, fmt) => {
      const el = $(id);
      el.addEventListener('input', () => {
        const v = Number(el.value) / scale;
        $(label).textContent = fmt(v);
        apply(v);
        if (id !== '#speedDial') scheduleRecompute();
      });
    };
    bind('#gainDial', '#gainVal', 10, (v) => { local.dials.gain = v; }, (v) => v.toFixed(1));
    bind('#dampDial', '#dampVal', 100, (v) => { local.dials.damping = v; }, (v) => v.toFixed(2));
    bind('#coupDial', '#coupVal', 100, (v) => { local.dials.couplingScale = v; }, (v) => v.toFixed(2));
    bind('#speedDial', '#speedVal', 100, () => {}, (v) => `${v.toFixed(1)}×`);

    let timer = null;
    function scheduleRecompute() {
      clearTimeout(timer);
      timer = setTimeout(recompute, 90);   // the sim is ~40 ms; debounce the drag
    }

    on($('#resetDials'), 'click', () => {
      local.dials = defaultDials(model);
      $('#gainDial').value = model.core.gain * 10;
      $('#dampDial').value = model.core.damping * 100;
      $('#coupDial').value = 100;
      $('#gainVal').textContent = model.core.gain.toFixed(1);
      $('#dampVal').textContent = model.core.damping.toFixed(2);
      $('#coupVal').textContent = '1.00';
      recompute();
    });
  }

  function wireButtons() {
    document.querySelectorAll('[data-chan]').forEach((btn) => {
      on(btn, 'click', () => {
        local.channel = Number(btn.dataset.chan);
        draw(local.frame);
      });
    });
    on($('#spinBtn'), 'click', () => { view.spin = !view.spin; });

    on($('#livePlayBtn'), 'click', () => {
      const clip = state.clips[state.index];
      if (state.player.playing) { state.player.stop(); return; }
      const rate = Number($('#speedDial').value) / 100;
      $('#livePlayBtn').textContent = '■ Stop';
      state.player.play(clip.url, {
        rate,
        onTick: (seconds) => {
          local.frame = frameForTime(seconds);
          draw(local.frame);
        },
        onEnd: () => {
          $('#livePlayBtn').textContent = '▶ Play & run';
          local.frame = local.result.sim.T - 1;
          draw(local.frame);
        },
      });
    });
  }

  /** Frame whose 32 ms window is centred on this playback time. */
  function frameForTime(seconds) {
    const { sample_rate, hop, n_fft } = model.frontend;
    return Math.round((seconds * sample_rate - n_fft / 2) / hop);
  }

  return { dispose: () => disposers.forEach((d) => d()) };
}
