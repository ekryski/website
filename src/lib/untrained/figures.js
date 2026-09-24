// The explanatory figures: everything on the page except the two consoles.
// Each mount function finds its markup by id and returns a disposer.

import { drawWaveform, drawHeatmap, drawLines, drawBars, fitCanvas, magmaColor } from '../resonant/plots.js';
import { envelopeRows, quadratureRows, carrierRows } from './frontend.js';
import { denseOperator } from './lattice.js';
import { LatticeView, signedRGB } from './lattice3d.js';
import { drawMosaic, drawPhaseHeat, drawSignedHeat, shadeWindows, drawColumns, pct } from './panels.js';
import { runConfig } from './engine.js';
import { windowEdges, project } from './read.js';

const $ = (id) => document.getElementById(id);
const TWO_PI = Math.PI * 2;

function listen(disposers) {
  return (el, type, fn, opts) => {
    if (!el) return;
    el.addEventListener(type, fn, opts);
    disposers.push(() => el.removeEventListener(type, fn, opts));
  };
}

function animate(disposers, fn) {
  let raf = 0, alive = true, last = performance.now();
  const loop = (now) => {
    if (!alive) return;
    fn(Math.min(0.05, (now - last) / 1000));
    last = now;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  disposers.push(() => { alive = false; cancelAnimationFrame(raf); });
}

/** Only animate what is on screen. */
function visible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
}

// ---------------------------------------------------------------------------
// 02 · a population of oscillators, coupled and not
// ---------------------------------------------------------------------------

export function mountRingToy() {
  const disposers = [];
  const on = listen(disposers);
  const canvas = $('ringCanvas'), rCanvas = $('ringR');
  if (!canvas) return () => {};
  const N = 24;
  const state = { K: 1.2, spread: 0.5, lambda: 0, theta: new Float64Array(N), omega: new Float64Array(N), R: [] };
  // natural frequencies evenly spread over 1 +- spread, shuffled so neighbours on screen differ
  function spreadOut() {
    for (let i = 0; i < N; i++) state.omega[i] = 1 + state.spread * (2 * (((i * 7) % N) / (N - 1)) - 1);
  }
  // a fixed scatter of starting phases, so the toy behaves the same every visit
  const reset = () => {
    for (let i = 0; i < N; i++) {
      state.theta[i] = (i * 2.399963) % TWO_PI;        // golden-angle scatter
    }
    spreadOut();
    state.R = [];
  };
  reset();
  const bind = (id, key, fmt, after) => {
    const el = $(id), out = $(`${id}Val`);
    on(el, 'input', () => {
      state[key] = Number(el.value) / 100;
      if (out) out.textContent = fmt(state[key]);
      if (after) after();
    });
  };
  bind('ringK', 'K', (v) => v.toFixed(2));
  bind('ringSpread', 'spread', (v) => v.toFixed(2), spreadOut);
  bind('ringLambda', 'lambda', (v) => v.toFixed(2));
  on($('ringUncouple'), 'click', () => {
    state.K = 0; $('ringK').value = '0'; $('ringKVal').textContent = '0.00';
  });
  on($('ringReset'), 'click', reset);

  animate(disposers, (dt) => {
    if (!visible(canvas)) return;
    const steps = 4, h = (dt * 3) / steps;
    for (let s = 0; s < steps; s++) {
      let sx = 0, sy = 0;
      for (let i = 0; i < N; i++) { sx += Math.cos(state.theta[i]); sy += Math.sin(state.theta[i]); }
      const R = Math.hypot(sx, sy) / N, psi = Math.atan2(sy, sx);
      for (let i = 0; i < N; i++) {
        // all-to-all Kuramoto, written through the mean field: K R sin(psi - theta)
        const d = state.omega[i] + state.K * R * Math.sin(psi - state.theta[i]) - state.lambda * Math.sin(state.theta[i]);
        state.theta[i] = (state.theta[i] + h * d + TWO_PI) % TWO_PI;
      }
    }
    let sx = 0, sy = 0;
    for (let i = 0; i < N; i++) { sx += Math.cos(state.theta[i]); sy += Math.sin(state.theta[i]); }
    const R = Math.hypot(sx, sy) / N;
    state.R.push(R);
    if (state.R.length > 400) state.R.shift();
    drawRing(canvas, state, R, Math.atan2(sy, sx));
    drawLines(rCanvas, [{ values: state.R, color: '#7cc4ff', width: 1.8 }], { yMax: 1 });
    $('ringRVal').textContent = R.toFixed(2);
  });
  return () => disposers.forEach((d) => d());
}

function drawRing(canvas, state, R, psi) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const N = state.theta.length;
  // left: every oscillator as a clock hand in a row; right: all phases on one circle
  const cols = 12, rows = 2, cell = Math.min((w * 0.58) / cols, (h - 20) / rows);
  for (let i = 0; i < N; i++) {
    const cx = (i % cols) * cell + cell / 2 + 6, cy = Math.floor(i / cols) * cell + cell / 2 + 10;
    const rad = cell * 0.38;
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TWO_PI); ctx.stroke();
    const th = state.theta[i];
    ctx.strokeStyle = `hsl(${(th / TWO_PI) * 360}, 78%, 62%)`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rad * Math.cos(th), cy - rad * Math.sin(th)); ctx.stroke();
    ctx.lineWidth = 1;
  }
  const cx = w * 0.8, cy = h / 2, rad = Math.min(w * 0.17, h * 0.4);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TWO_PI); ctx.stroke();
  for (let i = 0; i < N; i++) {
    const th = state.theta[i];
    ctx.fillStyle = `hsl(${(th / TWO_PI) * 360}, 78%, 62%)`;
    ctx.beginPath(); ctx.arc(cx + rad * Math.cos(th), cy - rad * Math.sin(th), 4, 0, TWO_PI); ctx.fill();
  }
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + rad * R * Math.cos(psi), cy - rad * R * Math.sin(psi)); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(231,234,241,0.7)';
  ctx.font = '10px ui-monospace, monospace';
  ctx.fillText('all 24 phases · arrow = mean, length R', cx - rad, cy + rad + 16);
}

// ---------------------------------------------------------------------------
// 07 · who acts on whom: one kernel, six gluings
// ---------------------------------------------------------------------------

export function mountKernelFigure(store) {
  const disposers = [];
  const on = listen(disposers);
  const grid = $('kernelGrid');
  if (!grid) return () => {};
  const { channels: C, grid: G } = store.physics;
  const N = G * G;
  const view = new LatticeView($('kernel3d'), G);
  disposers.push(() => view.dispose());
  const state = { geo: 'torus', channel: 0, site: 15 * G + 0 };
  const ops = {};
  const opFor = (geo) => (ops[geo] ??= denseOperator(geo, store.physics.taps[geo], C, G));

  const buttons = document.querySelectorAll('[data-kgeo]');
  buttons.forEach((b) => on(b, 'click', () => { state.geo = b.dataset.kgeo; paint(); }));
  document.querySelectorAll('[data-kchan]').forEach((b) => on(b, 'click', () => { state.channel = Number(b.dataset.kchan); paint(); }));
  on(grid, 'click', (e) => {
    const rect = grid.getBoundingClientRect();
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * G);
    const r = G - 1 - Math.floor(((e.clientY - rect.top) / rect.height) * G);
    if (r >= 0 && r < G && c >= 0 && c < G) { state.site = r * G + c; paint(); }
  });

  function paint() {
    const op = opFor(state.geo);
    const row = new Float64Array(N);
    const base = state.channel * N * N + state.site * N;
    let max = 1e-9;
    for (let j = 0; j < N; j++) { row[j] = op[base + j]; if (j !== state.site) max = Math.max(max, Math.abs(row[j])); }
    const ctx = fitCanvas(grid);
    const w = grid.clientWidth, h = grid.clientHeight, cw = w / G, ch = h / G;
    for (let r = 0; r < G; r++) {
      for (let c = 0; c < G; c++) {
        const j = r * G + c;
        const [R, Gc, B] = j === state.site ? [1, 1, 1] : signedRGB(row[j] / max);
        ctx.fillStyle = `rgb(${R * 255},${Gc * 255},${B * 255})`;
        ctx.fillRect(c * cw, h - (r + 1) * ch, Math.ceil(cw) + 0.5, Math.ceil(ch) + 0.5);
      }
    }
    view.setGeometry(state.geo);
    view.paint((j) => (j === state.site ? [1, 1, 1] : signedRGB(row[j] / max)));
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kgeo === state.geo)));
    document.querySelectorAll('[data-kchan]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.kchan) === state.channel)));
    let zero = 0;
    for (let j = 0; j < N; j++) if (j !== state.site && Math.abs(row[j]) < 1e-9) zero++;
    const r0 = Math.floor(state.site / G), c0 = state.site % G;
    $('kernelNote').textContent = `oscillator at row ${r0 + 1} (mel band ${r0 + 1}), column ${c0 + 1} · `
      + `${N - 1 - zero} of 255 others act on it${zero ? `, ${zero} cannot` : ''} · largest weight ${max.toFixed(3)}`;
  }
  paint();
  animate(disposers, (dt) => { if (visible(grid)) view.render(dt); });
  return () => disposers.forEach((d) => d());
}

// ---------------------------------------------------------------------------
// 03 · leaky integrators: memory without rotation
// ---------------------------------------------------------------------------

export function mountLeakyToy(shared) {
  const disposers = [];
  const on = listen(disposers);
  const canvas = $('leakyCanvas');
  if (!canvas) return () => {};
  const state = { band: 6, gain: 1 };
  const TAUS = [1 / 62.5, 0.045, 0.125, 0.35, 1.0];
  const COLORS = ['#ff8a5b', '#ffd166', '#6ee7a8', '#7cc4ff', '#c4a7ff'];
  on($('leakyBand'), 'input', () => { state.band = Number($('leakyBand').value); $('leakyBandVal').textContent = String(state.band + 1); draw(); });
  document.querySelectorAll('[data-lgain]').forEach((b) => on(b, 'click', () => { state.gain = Number(b.dataset.lgain); draw(); }));

  function draw() {
    const rows = shared.envelope();
    if (!rows) return;
    const { T, G } = rows;
    const input = [], outs = TAUS.map(() => []);
    const x = TAUS.map(() => 0);
    for (let t = 0; t < T; t++) {
      const u = rows.rows[t * G + state.band];
      input.push(u);
      TAUS.forEach((tau, k) => {
        const a = 1 - Math.exp(-1 / (tau * 62.5));
        x[k] = (1 - a) * x[k] + a * Math.tanh(u * state.gain);
        outs[k].push(x[k]);
      });
    }
    drawLines(canvas, [
      { values: input.map((v) => v / 1.6), color: 'rgba(231,234,241,0.35)', width: 1 },
      ...outs.map((values, k) => ({ values, color: COLORS[k], width: 1.8 })),
    ], { yMax: 1 });
    document.querySelectorAll('[data-lgain]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.lgain) === state.gain)));
  }
  shared.onClip(draw);
  draw();
  return () => disposers.forEach((d) => d());
}

/** The state-matched bank's layout: each unit coloured by its time constant. */
export function drawBankLayout(store) {
  const canvas = $('bankLayout');
  if (!canvas) return;
  const bank = store.banks['bank-c4'];
  const G = store.physics.grid;
  const lo = Math.min(...bank.tau), hi = Math.max(...bank.tau);
  const logTau = Array.from(bank.tau, (t) => Math.log(t / lo) / Math.log(hi / lo));
  const fmt = (t) => (t < 0.1 ? `${Math.round(t * 1000)} ms` : `${t.toFixed(2)} s`);
  const labels = [];
  for (let c = 0; c < bank.channels; c++) {
    const span = bank.tau.subarray(c * G * G, (c + 1) * G * G);
    labels.push(`ch ${c + 1} · ${fmt(Math.min(...span))} to ${fmt(Math.max(...span))}`);
  }
  drawMosaic(canvas, logTau, 0, bank.channels, G, { cols: 4, lo: 0, hi: 1, color: magmaColor, labels });
}

// ---------------------------------------------------------------------------
// 04 · the front end, live on the chosen clip
// ---------------------------------------------------------------------------

export function drawFrontEnd(shared, frac) {
  const clip = shared.clip();
  const env = shared.envelope();
  if (!clip || !env) return;
  drawWaveform($('feWave'), clip.samples, { playhead: frac });
  const { frames, bins, power } = env.spec;
  const logp = new Float32Array(frames * bins);
  for (let i = 0; i < logp.length; i++) logp[i] = Math.log10(power[i] + 1e-10);
  drawHeatmap($('feStft'), logp, frames, bins, { dynamicRange: 6, playhead: frac });
  drawHeatmap($('feMel'), env.logMel, env.frames, env.mels, { dynamicRange: 11, playhead: frac });
  drawHeatmap($('feRows'), env.rows, env.frames, env.mels, { min: 0, max: 1.6, playhead: frac });
  const t = frac === undefined ? env.frames - 1 : Math.min(env.frames - 1, Math.round(frac * env.frames));
  drawBars($('feNow'), Array.from(env.rows.slice(t * env.mels, (t + 1) * env.mels)), { max: 1.6 });
}

// ---------------------------------------------------------------------------
// 05 · the read, step by step, on the chosen clip
// ---------------------------------------------------------------------------

const READ_ARMS = {
  field: { drive: 'envelope', label: 'field-kuramoto-torus-random-lam0.3-clamp1', gain: 1 },
  severed: { drive: 'envelope', label: 'severed-kuramoto-torus-random-lam0.3-clamp1', gain: 1 },
  'bank-c4': { drive: 'envelope', label: 'bank-c4', gain: 1 },
  floor: { drive: 'envelope', label: 'floor', gain: null },
};

export function mountReadFigure(store, shared) {
  const disposers = [];
  const on = listen(disposers);
  if (!$('readTraces')) return () => {};
  const state = { arm: 'field', result: null };
  document.querySelectorAll('[data-rarm]').forEach((b) => on(b, 'click', () => { state.arm = b.dataset.rarm; run(); }));

  function configId() {
    const a = READ_ARMS[state.arm];
    const c = Object.values(store.manifest.configs).find((cfg) =>
      cfg.drive === a.drive && cfg.label === a.label && cfg.gain === a.gain && cfg.noise_db === null && cfg.read === 'windowed');
    return c?.id;
  }

  async function run() {
    const clip = shared.clip();
    const id = configId();
    document.querySelectorAll('[data-rarm]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rarm === state.arm)));
    if (!clip || !id) return;
    const r = await runConfig(store, id, clip.samples);
    state.result = r;
    const R = await store.readout(id);
    draw(r, R);
  }

  function draw(r, R) {
    const T = r.T, G = store.frontend.n_mels;
    const d = r.display, kind = r.cfg.arm.kind;
    // six signals over time
    const series = [];
    const colors = ['#7cc4ff', '#6ee7a8', '#ffd166', '#ff8a5b', '#c4a7ff', '#ff9ecf'];
    const picks = [3, 40, 77, 131, 180, 243];
    for (let s = 0; s < 6; s++) {
      const values = [];
      for (let t = 0; t < T; t++) {
        let v;
        if (kind === 'floor') v = r.input.rows[t * G + (picks[s] % G)] / 1.6;
        else if (kind === 'bank') v = d.state[t * d.C * d.N + picks[s]];
        else v = 0.5 + 0.5 * Math.sin(d.state[t * d.C * d.N + picks[s]]);
        values.push(v);
      }
      series.push({ values, color: colors[s], width: 1.5 });
    }
    drawLines($('readTraces'), series, { yMax: 1 });
    shadeWindows($('readTraces'), r.edges, T, { labels: true });

    // every statistic of every signal, each (window, statistic) block scaled to its own spread
    const f = r.features;
    const D = f.length, block = D / 12;
    const z = new Float32Array(D);
    for (let b0 = 0; b0 < D; b0 += block) {
      let m = 0, v = 0;
      for (let i = b0; i < b0 + block; i++) m += f[i];
      m /= block;
      for (let i = b0; i < b0 + block; i++) v += (f[i] - m) ** 2;
      const sd = Math.sqrt(v / block) || 1;
      for (let i = b0; i < b0 + block; i++) z[i] = Math.max(-1, Math.min(1, (f[i] - m) / sd / 2.5));
    }
    drawStrip($('readFeatures'), z);
    // the projected 192, standardized as the ridge sees them, and the scores
    const proj = R.projected ? project(f, R) : f;
    const zp = new Float32Array(R.width);
    for (let k = 0; k < R.width; k++) zp[k] = Math.max(-1, Math.min(1, ((proj[k] - R.mean2[k]) / R.sd2[k]) / 3));
    drawStrip($('readProjected'), zp);
    drawBars($('readScores'), Array.from(r.logits, (v) => Math.max(0, v)), {
      max: Math.max(1, ...r.logits),
      color: (i) => (i === r.predicted ? '#6ee7a8' : '#7cc4ff'),
    });
    $('readCounts').textContent = `${kind === 'floor' ? 16 : d.C * d.N * (kind === 'bank' ? 1 : 2)} signals × 3 statistics × 4 windows = ${D.toLocaleString()} features `
      + `${R.projected ? `→ projected to ${R.width}` : '(already 192: read as it is)'} → 10 scores · this clip reads as “${r.predicted}”`;
  }

  shared.onClip(run);
  run();
  return () => disposers.forEach((d) => d());
}

function drawStrip(canvas, z) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const n = z.length, cols = Math.max(1, Math.floor(w));
  for (let x = 0; x < cols; x++) {
    const a = Math.floor((x / cols) * n), b = Math.max(a + 1, Math.floor(((x + 1) / cols) * n));
    let s = 0;
    for (let i = a; i < b; i++) s += z[i];
    const v = s / (b - a);
    const [r, g, bb] = signedRGB(v * 1.6);
    ctx.fillStyle = `rgb(${r * 255},${g * 255},${bb * 255})`;
    ctx.fillRect(x, 0, 1, h);
  }
}

// ---------------------------------------------------------------------------
// 05 · the record: what each readout choice does, in registered numbers
// ---------------------------------------------------------------------------

export async function mountRecordExplorer(store) {
  const disposers = [];
  const on = listen(disposers);
  const host = $('recordExplorer');
  if (!host || !store.manifest.record) return () => {};
  const record = await store.fetchJson(store.url(store.manifest.record.file));
  const rows = record.tier1;
  const names = record.names;
  const state = { arm: 'field-kuramoto-torus-random-lam0.3-clamp1', noise: 0, gain: 1, read: 'windowed', n: 2048, width: 192 };
  const arms = [...new Set(rows.map((r) => r[0]))];
  const order = ['floor', 'field-kuramoto-torus-random-lam0.3-clamp1', 'severed-kuramoto-torus-random-lam0.3-clamp1',
                 'bank-c4', 'bank-c8', 'ann-gru', 'ann-tcn', 'ann-cnn', 'ann-transformer', 'ann-s4d'];
  arms.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const sel = $('recArm');
  arms.forEach((a) => {
    const o = document.createElement('option');
    o.value = a; o.textContent = names[a];
    sel.appendChild(o);
  });
  sel.value = state.arm;
  on(sel, 'change', () => { state.arm = sel.value; draw(); });

  const match = (r, s) => r[0] === s.arm && r[1] === s.noise && r[2] === (isReservoir(s.arm) ? s.gain : null)
    && r[4] === s.read && r[5] === s.n && String(r[6]) === String(s.width);
  const isReservoir = (a) => a.startsWith('field') || a.startsWith('severed') || a.startsWith('bank');
  const summary = (accs) => {
    const m = accs.reduce((x, y) => x + y, 0) / accs.length;
    const sd = accs.length > 1 ? Math.sqrt(accs.reduce((x, y) => x + (y - m) ** 2, 0) / (accs.length - 1)) : 0;
    return { m, sd };
  };

  function seg(id, values, label, key) {
    const hostEl = $(id);
    hostEl.innerHTML = '';
    for (const v of values) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'segBtn'; b.textContent = label(v);
      const probe = { ...state, [key]: v };
      b.disabled = !rows.some((r) => match(r, probe));
      b.setAttribute('aria-pressed', String(v === state[key]));
      b.addEventListener('click', () => { state[key] = v; draw(); });
      hostEl.appendChild(b);
    }
  }

  function draw() {
    const reads = ['windowed', 'pooled', 'windowed+rate', 'windowed@wholeclip'];
    const readNames = { windowed: 'four windows', pooled: 'whole span', 'windowed+rate': '+ rotation rates', 'windowed@wholeclip': 'from frame 0' };
    if (!rows.some((r) => match(r, state))) {
      // keep the arm; fall back to the first cell it has
      for (const read of reads) {
        const probe = { ...state, read };
        if (rows.some((r) => match(r, probe))) { state.read = read; break; }
      }
    }
    seg('recNoise', [null, 0, 5], (v) => (v === null ? 'clean' : v === 0 ? '0 dB' : '+5 dB'), 'noise');
    seg('recGain', [1, 2], (v) => (isReservoir(state.arm) ? `gain ${v}` : 'n/a'), 'gain');
    seg('recRead', reads, (v) => readNames[v], 'read');
    seg('recSize', [2048, 8192, 24000], (v) => v.toLocaleString(), 'n');
    seg('recWidth', [192, 1024, 4096, 'native'], (v) => (v === 'native' ? 'native' : v.toLocaleString()), 'width');
    const cell = rows.find((r) => match(r, state));
    const out = $('recValue');
    if (!cell) { out.textContent = 'not in the record'; $('recSeeds').textContent = ''; }
    else {
      const { m, sd } = summary(cell[7]);
      out.textContent = `${(m * 100).toFixed(1)}%`;
      $('recSeeds').textContent = `± ${(sd * 100).toFixed(1)} over ${cell[7].length} seeds · each seed: ${cell[7].map((v) => pct(v)).join(', ')}`;
    }
    // accuracy against width and against training clips, for everything else as chosen
    const at = (probe) => {
      const c = rows.find((r) => match(r, { ...state, ...probe }));
      return c ? summary(c[7]).m : null;
    };
    drawColumns($('recWidthBars'), [192, 1024, 4096, 'native'].map((wd) => ({
      label: wd === 'native' ? 'native' : wd.toLocaleString(), value: at({ width: wd }), hot: String(wd) === String(state.width),
    })));
    drawColumns($('recSizeBars'), [2048, 8192, 24000].map((n) => ({
      label: `${n.toLocaleString()} clips`, value: at({ n }), hot: n === state.n,
    })));
  }
  draw();

  // the leak the fixed window closes: the gate's no-input and per-clip cells beside Tier 1's
  const leak = $('leakTable');
  if (leak) {
    const field = 'field-kuramoto-torus-random-lam0.3-clamp1';
    const primary = (r) => r[0] === field && r[1] === 0 && r[4] === 'windowed' && r[5] === 2048 && r[6] === 192;
    const gate = (gain, span) => record.gate.find((r) => primary(r) && r[2] === gain && r[3] === span);
    const tier1 = (gain) => rows.find((r) => primary(r) && r[2] === gain);
    const fmt = (c) => (c ? `${pct(summary(c[7]).m)}${c[7].length > 1 ? ` · ${c[7].length} seeds` : ''}` : '—');
    leak.innerHTML = `
      <tr><th>coupled network, 0 dB</th><th>fixed window: frames 16–61</th><th>each clip’s own length</th></tr>
      <tr><td>no input (gain 0)</td><td>${fmt(gate(0, 'fixed'))}</td><td>${fmt(gate(0, 'clip'))}</td></tr>
      <tr><td>gain 1</td><td>${fmt(tier1(1))}</td><td>${fmt(gate(1, 'clip'))}</td></tr>
      <tr><td>gain 2</td><td>${fmt(tier1(2))}</td><td>${fmt(gate(2, 'clip'))}</td></tr>`;
  }
  return () => disposers.forEach((d) => d());
}

// ---------------------------------------------------------------------------
// 09 · three ways in: the pathways on the chosen clip
// ---------------------------------------------------------------------------

export function drawPathways(shared, store) {
  const clip = shared.clip();
  if (!clip || !$('pwEnvelope')) return;
  const fe = store.frontend;
  const env = shared.envelope();
  drawHeatmap($('pwEnvelope'), env.rows, env.frames, env.mels, { min: 0, max: 1.6 });
  const quad = quadratureRows(clip.samples, fe);
  drawPhaseHeat($('pwQuadrature'), quad.rows, quad.phase, quad.frames, quad.mels);
  const car = shared.carrier ??= new Map();
  if (!car.has(clip.key)) car.set(clip.key, carrierRows(clip.samples, fe));
  const c = car.get(clip.key);
  drawSignedHeat($('pwCarrier'), c.rows, c.T, c.G);
}

export { envelopeRows, windowEdges };
