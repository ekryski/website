// A live console: pick an arm, one of the study's conditions and a clip, press play.
//
// The run happens first (a few tens of milliseconds), then the audio plays and every
// panel is driven off the playhead, so what you hear and what you see are the
// same instant of the simulation. The scores appear when the read's last
// window closes: the readout reads four windows of frames 16 to 61, so there
// is no honest verdict before the clip ends.
//
// Every option comes from the export's manifest. A control is disabled when
// the paper ran nothing there, and the note under the controls says why.

import { runConfig } from './engine.js';
import { addNoise, gaussian } from './frontend.js';
import { LatticeView, phaseRGB } from './lattice3d.js';
import { drawWaveform, drawHeatmap, drawField, drawLines, drawBars } from '../resonant/plots.js';
import { drawMosaic, drawPhaseHeat, shadeWindows, pct } from './panels.js';
import { MicRecorder, micSupported, micErrorMessage, conditionForBank } from './mic.js';

const CHANNEL_COLORS = ['#7cc4ff', '#6ee7a8', '#ffd166', '#ff8a5b', '#c4a7ff', '#ff9ecf', '#9be7ff', '#e7eaf1'];

export const MODELS = [
  { key: 'coupled', label: 'coupled oscillator network', short: 'coupled network', match: { kind: 'network', coupled: true } },
  { key: 'uncoupled', label: 'uncoupled oscillator network', short: 'uncoupled network', match: { kind: 'network', coupled: false } },
  { key: 'bank-state', label: 'leaky-integrator bank, state-matched', short: 'leaky bank (1,024)', match: { kind: 'bank', channels: 4 } },
  { key: 'bank-width', label: 'leaky-integrator bank, width-matched', short: 'leaky bank (2,048)', match: { kind: 'bank', channels: 8 } },
  { key: 'baseline', label: 'spectrogram-only baseline (whole clip)', short: 'spectrogram only', match: { kind: 'baseline' }, read: 'windowed@wholeclip' },
  { key: 'baseline16', label: 'spectrogram-only baseline (from frame 16)', short: 'spectrogram only, frame 16 on', match: { kind: 'baseline' }, read: 'windowed' },
  { key: 'trained-gru', label: 'GRU, trained', short: 'GRU', match: { kind: 'trained', arch: 'gru' } },
  { key: 'trained-tcn', label: 'TCN, trained', short: 'TCN', match: { kind: 'trained', arch: 'tcn' } },
  { key: 'trained-cnn', label: 'CNN, trained', short: 'CNN', match: { kind: 'trained', arch: 'cnn' } },
  { key: 'trained-transformer', label: 'transformer, trained', short: 'transformer', match: { kind: 'trained', arch: 'transformer' } },
  { key: 'trained-s4d', label: 'S4D, trained', short: 'S4D', match: { kind: 'trained', arch: 's4d' } },
];

export const FUNCTIONS = {
  kuramoto: 'Kuramoto', 'kuramoto-sakaguchi': 'Kuramoto–Sakaguchi', 'second-harmonic': 'second harmonic',
  winfree: 'Winfree', 'stuart-landau': 'Stuart–Landau', 'stuart-landau-fixed': 'Stuart–Landau, fixed amplitude',
};
export const GEOS = {
  torus: 'torus', cylinder: 'cylinder', sheet: 'sheet', helix: 'helix', cube: 'cube', sphere: 'sphere',
  coil: 'coil', cochlea: 'cochlea', 'cochlea-matched': 'cochlea, matched coupling',
};
export const PATHWAY_NAMES = { spectrogram: 'spectrogram', quadrature: 'quadrature' };
/** The record keeps the noise level relative to the speech (5 dB louder); people read it as SNR. */
export const NOISE_NAMES = (db) => (db === null ? 'clean' : db === 0 ? '0 dB' : `−${db} dB`);
export const EXPERIMENT_NAMES = {
  controls: 'the controls experiment', design: 'the design experiment', cochlea: 'the cochlea experiment',
  quadrature: 'the quadrature experiment',
};

/** Does a manifest config belong to a model option? */
function isModel(cfg, model) {
  for (const [k, v] of Object.entries(model.match)) if (cfg.arm[k] !== v) return false;
  return (model.read ?? 'windowed') === cfg.read;
}

const FIELDS = {
  fn: (c) => (c.arm.kind === 'network' && c.arm.coupled ? c.arm.coupling : null),
  geo: (c) => (c.arm.kind === 'network' && c.arm.coupled ? c.arm.geometry : null),
  gain: (c) => c.gain,
  noise: (c) => c.noise_db,
};

/**
 * Mount the console. ctx: {store, clips, player}; opts: {prefix}.
 * Returns {dispose}.
 */
export function mountConsole(ctx, { prefix }) {
  const { store, player } = ctx;
  const root = document.getElementById(`${prefix}-root`);
  if (!root) return { dispose() {} };
  const $ = (name) => document.getElementById(`${prefix}-${name}`);
  const configs = Object.values(store.manifest.configs);
  const models = MODELS;
  const G = store.physics.grid;
  const disposers = [];
  const on = (el, type, fn) => {
    if (!el) return;
    el.addEventListener(type, fn);
    disposers.push(() => el.removeEventListener(type, fn));
  };

  const clips = [...ctx.clips];
  const sel = {
    model: 'coupled', fn: 'kuramoto', geo: 'torus', gain: 1, noise: null,
    pathway: 'spectrogram', clip: Math.max(0, clips.findIndex((c) => c.digit === 7)), channel: 0,
  };
  const local = { cfg: null, result: null, samples: null, frame: 0, final: true, token: 0, running: false };

  const view = new LatticeView($('view3d'), G);
  view.setGeometry('torus');
  let raf = 0, alive = true, last = performance.now();
  const loop = (now) => {
    if (!alive) return;
    if (!$('view3d').hidden) view.render((now - last) / 1000);
    last = now;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  disposers.push(() => { alive = false; cancelAnimationFrame(raf); view.dispose(); });

  // --- choosing a config ---------------------------------------------------

  const modelOf = (key) => models.find((m) => m.key === key);
  const pool = (s) => configs.filter((c) => c.pathway === s.pathway && isModel(c, modelOf(s.model)));

  /** The config for a selection, adjusting whatever the export does not have; `changed` wins. */
  function resolve(changed) {
    const moved = [];
    let cands = pool(sel);
    if (!cands.length) {
      // a model the paper never ran on this pathway keeps the model and moves the pathway
      const other = Object.keys(PATHWAY_NAMES).find((p) => pool({ ...sel, pathway: p }).length);
      if (other) {
        moved.push(['pathway', sel.pathway, other]);
        sel.pathway = other;
      } else {
        sel.model = models.find((m) => pool({ ...sel, model: m.key }).length).key;
      }
      cands = pool(sel);
    }
    const order = ['fn', 'geo', 'gain', 'noise'];
    if (changed && order.includes(changed)) {
      order.splice(order.indexOf(changed), 1);
      order.unshift(changed);
    }
    for (const key of order) {
      const vals = cands.map(FIELDS[key]);
      if (vals.every((v) => v === null)) continue;
      if (!vals.includes(sel[key])) {
        const prefer = { fn: 'kuramoto', geo: 'torus', gain: 1, noise: 0 }[key];
        const next = vals.includes(prefer) ? prefer : vals.find((v) => v !== null);
        if (sel[key] !== undefined && key !== changed) moved.push([key, sel[key], next]);
        sel[key] = next;
      }
      cands = cands.filter((c) => FIELDS[key](c) === sel[key]);
    }
    return { cfg: cands[0], moved };
  }

  /**
   * Values of `key` the current model has on this pathway. Coupling functions and geometries are offered
   * whenever any run has them (picking one moves the other settings to a run that does); gain and noise
   * only where the chosen function and geometry were run.
   */
  function available(key) {
    let cands = pool(sel);
    if (key === 'gain' || key === 'noise') {
      for (const k of ['fn', 'geo']) {
        if (cands.some((c) => FIELDS[k](c) !== null)) cands = cands.filter((c) => FIELDS[k](c) === sel[k]);
      }
    }
    return new Set(cands.map(FIELDS[key]));
  }

  // --- controls ------------------------------------------------------------

  function buildControls() {
    const modelSel = $('model');
    modelSel.innerHTML = '';
    for (const m of models) {
      const opt = document.createElement('option');
      opt.value = m.key;
      opt.textContent = m.label;
      modelSel.appendChild(opt);
    }
    on(modelSel, 'change', () => { sel.model = modelSel.value; select('model'); });

    const fnSel = $('fn');
    on(fnSel, 'change', () => { sel.fn = fnSel.value; select('fn'); });
    const geoSel = $('geo');
    on(geoSel, 'change', () => { sel.geo = geoSel.value; select('geo'); });

    const clipSel = $('clip');
    clipSel.innerHTML = '';
    clips.forEach((clip, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `digit ${clip.digit} · speaker ${clip.speaker}`;
      clipSel.appendChild(opt);
    });
    on(clipSel, 'change', () => { sel.clip = Number(clipSel.value); recompute(); });

    const speed = $('speed');
    on(speed, 'input', () => { $('speedVal').textContent = `${(Number(speed.value) / 100).toFixed(1)}×`; });

    root.querySelectorAll('[data-chan]').forEach((btn) => {
      on(btn, 'click', () => { sel.channel = Number(btn.dataset.chan); draw(local.frame); });
    });
    on($('spin'), 'click', () => { view.spin = !view.spin; });
    on($('play'), 'click', () => {
      if (local.playing) { player.stop(); return; }
      startPlayback();
    });
  }

  function segButtons(host, values, current, enabled, label, onPick) {
    host.innerHTML = '';
    for (const v of values) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'segBtn';
      b.textContent = label(v);
      b.setAttribute('aria-pressed', String(v === current));
      b.disabled = !enabled.has(v);
      b.addEventListener('click', () => onPick(v));
      host.appendChild(b);
    }
  }

  function refreshControls() {
    $('model').value = sel.model;
    const m = modelOf(sel.model);
    const isField = m.match.kind === 'network' && m.match.coupled;

    // coupling function: every function the export has for this model and pathway
    const fnSel = $('fn');
    const fns = available('fn');
    fnSel.innerHTML = '';
    for (const [k, name] of Object.entries(FUNCTIONS)) {
      const opt = document.createElement('option');
      opt.value = k; opt.textContent = name; opt.disabled = !fns.has(k);
      fnSel.appendChild(opt);
    }
    fnSel.value = sel.fn;
    $('fnField').hidden = !isField;
    if ($('geo')) {
      const geoSel = $('geo');
      const geos = available('geo');
      geoSel.innerHTML = '';
      for (const [k, name] of Object.entries(GEOS)) {
        const opt = document.createElement('option');
        opt.value = k; opt.textContent = name; opt.disabled = !geos.has(k);
        geoSel.appendChild(opt);
      }
      geoSel.value = sel.geo;
      $('geoField').hidden = !isField;
    }
    const gains = available('gain');
    const gainValues = [...new Set(configs.filter((c) => c.pathway === sel.pathway && c.gain !== null).map((c) => c.gain))]
      .sort((a, b) => a - b);
    // a model the gain cannot act on gets a statement, not a control
    if (gains.has(null)) $('gain').innerHTML = '<span class="segNote">does not apply</span>';
    else segButtons($('gain'), gainValues, sel.gain, gains, (v) => `${v}`, (v) => { sel.gain = v; select('gain'); });
    const noises = available('noise');
    segButtons($('noise'), [null, 0, 5], sel.noise, noises, NOISE_NAMES, (v) => { sel.noise = v; select('noise'); });
    // a pathway is offered only for a model the paper (or this page) ran on it
    segButtons($('pathway'), Object.keys(PATHWAY_NAMES), sel.pathway,
               new Set(Object.keys(PATHWAY_NAMES).filter((p) => configs.some((c) => c.pathway === p && isModel(c, m)))),
               (p) => PATHWAY_NAMES[p], (p) => { sel.pathway = p; select('pathway'); });
    $('clip').value = String(sel.clip);
  }

  function explain(cfg, moved) {
    const notes = [];
    const a = cfg.arm;
    if (a.kind === 'baseline' || a.kind === 'trained') {
      notes.push(a.kind === 'baseline'
        ? 'Input gain does not apply: the baseline has no dynamics for it to act on, and the readout’s standardization would divide out any fixed scale.'
        : 'Input gain does not apply: a trained network learns its own input scale. Each is trained once per noise level, on the input as it is.');
    }
    if (cfg.experiment === 'design' || cfg.experiment === 'cochlea') {
      notes.push('The design and cochlea experiments read network design at 0 and −5 dB only, because clean audio nearly saturates the task.');
    }
    if (a.coupling?.startsWith('stuart-landau')) {
      notes.push('The Stuart–Landau functions were run on the torus only; the free-amplitude network also on clean audio, in the controls experiment.');
    }
    if (cfg.pathway === 'quadrature') {
      notes.push('The quadrature pathway drives phase oscillators only: a leaky integrator has no phase for the push to act on, and the Stuart–Landau networks were not run on it.');
    }
    const NAMES = { fn: 'the coupling function', geo: 'the geometry', gain: 'the gain', noise: 'the noise', pathway: 'the pathway' };
    const FORMATS = { noise: NOISE_NAMES, fn: (v) => FUNCTIONS[v], geo: (v) => GEOS[v], pathway: (v) => PATHWAY_NAMES[v] };
    for (const [key, from, to] of moved) {
      const fmt = FORMATS[key] ?? ((v) => String(v));
      notes.push(`Moved ${NAMES[key]} from ${fmt(from)} to ${fmt(to)}, the nearest setting the paper ran with this choice.`);
    }
    $('controlNote').textContent = notes.join(' ');
  }

  function select(changed) {
    const { cfg, moved } = resolve(changed);
    refreshControls();
    explain(cfg, moved);
    recompute();
  }

  // --- running -------------------------------------------------------------

  async function unitNoise(clip, db) {
    if (clip.index !== undefined) {
      const n = await store.noise(clip.index, db);
      if (n) return n;
    }
    return gaussian(1000 + Math.round(db * 10), clip.samples.length);
  }

  async function recompute() {
    const { cfg } = resolve();
    local.cfg = cfg;
    if (local.playing) player.stop();
    const token = ++local.token;
    const clip = clips[sel.clip];
    let samples = clip.samples;
    if (cfg.noise_db !== null) samples = addNoise(samples, clip.speech, await unitNoise(clip, cfg.noise_db), cfg.noise_db);
    const progress = $('progress');
    progress.textContent = '';
    $('play').disabled = true;
    root.classList.add('busy');
    let result;
    try {
      result = await runConfig(store, cfg.id, samples);
    } catch (err) {
      console.error('untrained: run failed', err);
      progress.textContent = 'could not run this config';
      root.classList.remove('busy');
      $('play').disabled = false;
      return;
    }
    if (token !== local.token) return;           // a newer choice superseded this run
    root.classList.remove('busy');
    progress.textContent = '';
    $('play').disabled = false;
    local.result = result;
    local.samples = samples;
    local.playKey = `${prefix}:${sel.clip}:${cfg.noise_db}:${clip.live ? clip.take : 0}`;
    player.prepareSamples(local.playKey, samples, 16000);
    local.maxR = 0.15;
    if (result.display.R) local.maxR = Math.max(0.15, 1.15 * result.display.R.reduce((a, b) => Math.max(a, b), 0));
    local.final = true;
    local.frame = result.T - 1;
    setupView(cfg, result);
    draw(local.frame);
  }

  // --- drawing -------------------------------------------------------------

  function setupView(cfg, result) {
    const a = cfg.arm, kind = a.kind;
    const oscillators = kind === 'network';
    $('view3d').hidden = !oscillators;
    $('view2d').hidden = oscillators;
    $('chanRow').hidden = !oscillators;
    $('gridsPanel').hidden = !oscillators;
    const geo = oscillators ? (a.coupled ? a.geometry : 'torus') : 'torus';
    if (oscillators) view.setGeometry(geo);
    const titles = {
      network: a.coupled ? `the network on its ${GEOS[geo]}` : 'the uncoupled network (coupling set to zero)',
      bank: `the bank’s ${a.channels * 256} units`,
      trained: `the ${modelOf(sel.model)?.short ?? a.arch}’s hidden units`,
      baseline: 'what the readout reads: the band energies',
    };
    $('viewTitle').textContent = titles[kind];
    const notes = {
      network: a.coupling === 'stuart-landau'
        ? 'Each cell is one oscillator: hue is its phase, brightness its amplitude. Row r is driven by mel band r. Drag to turn it.'
        : 'Each cell is one oscillator and its hue is its phase. Row r is driven by mel band r; the white line marks the loudest band. Drag to turn it.',
      bank: 'Each square is one channel. Rows are mel bands; columns run from the fastest time constant (16 ms, channel 1, left) to the slowest (1 s). Brightness is the unit’s state.',
      trained: 'Hidden units over time (brighter is larger), frames 16 on: the trajectory the readout’s statistics are taken over.',
      baseline: 'The drive rows themselves, with the read’s four windows marked: the readout reads the input directly, with nothing between them.',
    };
    $('viewNote').textContent = notes[kind];
    $('stripArm').textContent = { network: a.coupled ? 'oscillators' : 'uncoupled', bank: 'leaky bank', trained: a.arch, baseline: '(nothing)' }[kind];
    const rTitles = {
      network: 'order parameter R per channel · drive rows now',
      bank: 'four units of the loudest band, fast to slow · drive rows now',
      trained: 'four hidden units · drive rows now',
      baseline: 'four band energies · drive rows now',
    };
    $('traceTitle').textContent = rTitles[kind];
    $('inputTitle').textContent = `input · ${PATHWAY_NAMES[cfg.pathway]} pathway`;
    buildScoreBars();
    buildWindows(result);
    updateRecord(cfg, result);
  }

  function buildScoreBars() {
    const host = $('bars');
    if (host.children.length) return;
    for (let k = 0; k < 10; k++) {
      const row = document.createElement('div');
      row.className = 'readoutRow';
      row.innerHTML = `<span>${k}</span><div class="bar"><i style="width:0%"></i></div><span class="pct">—</span>`;
      host.appendChild(row);
    }
  }

  function buildWindows(result) {
    const host = $('windows');
    host.innerHTML = '';
    const e = result.edges;
    const T = result.T;
    const warm = document.createElement('div');
    warm.className = 'win warm';
    warm.style.flex = String(e[0] / T);
    warm.textContent = e[0] ? 'warm-up' : '';
    if (e[0]) host.appendChild(warm);
    for (let j = 0; j < e.length - 1; j++) {
      const d = document.createElement('div');
      d.className = 'win';
      d.style.flex = String((e[j + 1] - e[j]) / T);
      d.textContent = `window ${j + 1}`;
      host.appendChild(d);
    }
  }

  function updateRecord(cfg) {
    const rec = cfg.record;
    const ex = cfg.export;
    const m = $('mRecord');
    const note = $('recordNote');
    const tag = $('fitTag');
    tag.textContent = rec ? 'in the paper' : 'not in the paper';
    tag.className = `tag ${rec ? 'ok' : 'off'}`;
    if (rec) {
      m.textContent = `${(rec.mean * 100).toFixed(1)} ± ${(rec.sd * 100).toFixed(1)}%`;
      const s0 = rec.seeds['0'];
      note.textContent = `From ${EXPERIMENT_NAMES[cfg.experiment] ?? 'the record'}: mean ± SD over ${rec.n} seeds on the `
        + `6,000 test clips, at 2,048 training clips and width 192.${s0 !== undefined ? ` This page runs seed 0 (${pct(s0)}).` : ''}`;
    } else {
      m.textContent = ex ? pct(ex.acc) : 'not run';
      note.textContent = 'The paper did not run this arm here. It is included as a reference: its readout was fitted the '
        + `paper’s way${ex ? ` and scores ${pct(ex.acc)} on the ${cfg.n_test.toLocaleString()} test clips, at seed 0` : ''}.`;
    }
    if (cfg.export && cfg.n_test && cfg.n_test < 6000) note.textContent += ' (Development data: a short training set, not the paper’s fit.)';
  }

  function frameInfo() {
    const r = local.result;
    const stride = r.display.stride;
    const df = Math.min(r.display.frames - 1, Math.floor(local.frame / stride));
    return { t: local.frame, df, T: r.T };
  }

  function loudest(rows, t, Gb) {
    let best = -1, bv = 0.05;
    for (let b = 0; b < Gb; b++) {
      const v = Math.abs(rows[t * Gb + b]);
      if (v > bv) { bv = v; best = b; }
    }
    return best;
  }

  function draw(frame) {
    const r = local.result;
    if (!r) return;
    const cfg = local.cfg, a = cfg.arm, kind = a.kind, d = r.display;
    local.frame = Math.max(0, Math.min(r.T - 1, frame));
    const { t, df, T } = frameInfo();
    const frac = (t + 0.5) / T;
    const input = r.input;
    const sr = store.frontend.sample_rate, hop = store.frontend.hop;
    const seconds = (t * hop + store.frontend.n_fft / 2) / sr;
    $('time').textContent = `${seconds.toFixed(2)} s · frame ${t + 1}/${T}`;

    drawWaveform($('wave'), local.samples, { playhead: frac });
    const hot = loudest(input.rows, t, G);
    if (cfg.pathway === 'quadrature') drawPhaseHeat($('rows'), input.rows, input.phase, T, G, { playhead: frac });
    else drawHeatmap($('rows'), input.rows, T, G, { min: 0, max: 1.6, playhead: frac, highlightRow: hot >= 0 ? hot : undefined });
    shadeWindows($('rows'), r.edges, T);

    // drive rows entering right now
    const now = Array.from(input.rows.slice(t * G, (t + 1) * G), Math.abs);
    drawBars($('drive'), now, { max: 1.6 });

    // traces up to now
    const series = [];
    const step = Math.max(1, Math.floor(T / 400));
    if (kind === 'network') {
      for (let c = 0; c < d.C; c++) {
        const values = [];
        for (let k = 0; k <= t; k += step) values.push(d.R[Math.floor(k / d.stride) * d.C + c]);
        series.push({ values, color: CHANNEL_COLORS[c], width: c === sel.channel ? 2.2 : 1.2 });
      }
      $('traceScale').textContent = `0 – ${local.maxR.toFixed(2)}`;
      drawLines($('trace'), series, { yMax: local.maxR });
    } else {
      const pick = traceSignals(kind, d, hot);
      for (let s = 0; s < pick.length; s++) {
        const values = [];
        for (let k = 0; k <= t; k += step) values.push(pick[s](k));
        series.push({ values, color: CHANNEL_COLORS[s], width: 1.5 });
      }
      const top = kind === 'baseline' ? 1.6 : kind === 'bank' ? 1 : Math.max(1e-3, ...series.flatMap((x) => x.values.map(Math.abs)));
      $('traceScale').textContent = `0 – ${top.toFixed(2)}`;
      drawLines($('trace'), series.map((x) => ({ ...x, values: x.values.map((v) => Math.max(0, v)) })), { yMax: top });
    }

    // the arm itself
    if (kind === 'network') {
      const base = df * d.C * d.N;
      const ch = Math.min(sel.channel, d.C - 1);
      const off = base + ch * d.N;
      view.paint((i) => {
        const rgb = phaseRGB(d.state[off + i]);
        if (!d.amp) return rgb;
        const k = Math.min(1, d.amp[off + i]);
        return rgb.map((v) => v * (0.25 + 0.75 * k));
      }, hot);
      $('viewTag').textContent = `channel ${ch + 1} of ${d.C}`;
      root.querySelectorAll('.fieldGrid').forEach((canvas) => {
        const c = Number(canvas.dataset.ch);
        drawField(canvas, d.state, base + c * d.N, G, { highlightRow: c === ch ? hot : -1 });
      });
    } else if (kind === 'bank') {
      drawMosaic($('view2d'), d.state, df * d.C * d.N, d.C, G, { cols: d.C > 4 ? 4 : 2, lo: 0, hi: 1 });
      $('viewTag').textContent = `${d.C} channels × 16 × 16`;
    } else if (kind === 'trained') {
      drawHeatmap($('view2d'), d.hidden, T, d.H, { min: 0, playhead: frac });
      shadeWindows($('view2d'), r.edges, T, { labels: true });
      $('viewTag').textContent = `${d.H} units × ${T} frames`;
    } else {
      drawHeatmap($('view2d'), input.rows, T, G, { min: 0, max: 1.6, playhead: frac });
      shadeWindows($('view2d'), r.edges, T, { labels: true });
      $('viewTag').textContent = `${G} bands × ${T} frames`;
    }

    // the read and the verdict
    const closed = local.final || t >= T - 1;
    [...$('windows').querySelectorAll('.win:not(.warm)')].forEach((el, j) => {
      el.classList.toggle('done', closed || t >= r.edges[j + 1] - 1);
      el.classList.toggle('live', !closed && t >= r.edges[j] && t < r.edges[j + 1]);
    });
    updateScores(closed ? r : null);
    const truth = clips[sel.clip].digit;
    $('mTruth').textContent = clips[sel.clip].live ? 'your voice' : `“${truth}” sample`;
    $('mMs').textContent = `${r.ms.toFixed(0)} ms`;
  }

  function traceSignals(kind, d, hot) {
    const row = hot >= 0 ? hot : 4;
    if (kind === 'bank') {
      // one unit per channel in the loudest band's row: channel 1 is the fastest, the last the slowest
      const chans = [0, Math.floor(d.C / 3), Math.floor((2 * d.C) / 3), d.C - 1];
      return chans.map((c) => (k) => d.state[Math.min(d.frames - 1, Math.floor(k / d.stride)) * d.C * d.N + c * d.N + row * G + 7]);
    }
    if (kind === 'trained') return [0, 1, 2, 3].map((u) => (k) => d.hidden[k * d.H + u]);
    const bands = [2, 6, 10, 14];
    return bands.map((b) => (k) => local.result.input.rows[k * G + b]);
  }

  function updateScores(r) {
    const rows = [...$('bars').children];
    const verdict = $('verdict');
    if (!r) {
      rows.forEach((row) => {
        row.classList.remove('win');
        row.querySelector('i').style.width = '0%';
        row.querySelector('.pct').textContent = '·';
      });
      verdict.textContent = 'listening…';
      verdict.style.color = 'var(--muted)';
      $('mPred').textContent = '…';
      return;
    }
    const top = Math.max(1, ...r.logits);
    rows.forEach((row, k) => {
      row.querySelector('i').style.width = `${(Math.max(0, r.logits[k]) / top) * 100}%`;
      row.querySelector('.pct').textContent = r.logits[k].toFixed(2);
      row.classList.toggle('win', k === r.predicted);
    });
    const truth = clips[sel.clip].digit;
    $('mPred').textContent = String(r.predicted);
    if (clips[sel.clip].live) {
      verdict.textContent = `heard “${r.predicted}”`;
      verdict.style.color = 'var(--accent)';
    } else {
      const ok = r.predicted === truth;
      verdict.textContent = ok ? `correct · “${r.predicted}”` : `wrong · said “${r.predicted}”`;
      verdict.style.color = ok ? 'var(--good)' : 'var(--hot)';
    }
  }

  function startPlayback() {
    if (!local.result) return;
    const rate = Number($('speed').value) / 100;
    const sr = store.frontend.sample_rate, hop = store.frontend.hop, nfft = store.frontend.n_fft;
    local.playing = true;
    local.final = false;
    $('play').textContent = '■ Stop';
    player.play(local.playKey, {
      rate,
      onTick: (seconds) => {
        draw(Math.round((seconds * sr - nfft / 2) / hop));
      },
      onEnd: () => {
        local.playing = false;
        local.final = true;
        $('play').textContent = '▶ Play & run';
        draw(local.result.T - 1);
      },
    });
  }

  // --- microphone ----------------------------------------------------------

  function wireMic() {
    const btn = $('mic');
    const status = $('micStatus'), meter = $('micLevel');
    const say = (text) => { status.textContent = text; };
    const setLevel = (v) => { meter.style.width = `${Math.min(100, v * 140).toFixed(0)}%`; };
    if (!micSupported()) { btn.disabled = true; say('this browser cannot record audio'); return; }
    let recorder = null, takes = 0;
    const rest = () => { btn.textContent = '🎤 record'; btn.classList.remove('recording'); btn.disabled = false; setLevel(0); };

    async function finish() {
      const take = recorder?.stop();
      recorder = null;
      rest();
      if (!take) return;
      say('shaping the take like a corpus clip…');
      const clip = await conditionForBank(take.samples, take.sampleRate);
      if (!clip) { say('nothing loud enough to be a word · try again, closer'); return; }
      takes++;
      const live = { digit: null, speaker: 'you', live: true, take: takes, samples: clip.samples, speech: clip.speech };
      const at = clips.findIndex((c) => c.live);
      const index = at >= 0 ? at : clips.length;
      clips[index] = live;
      let opt = $('clip').querySelector('option[data-live]');
      if (!opt) {
        opt = document.createElement('option');
        opt.dataset.live = '1';
        opt.value = String(index);
        $('clip').appendChild(opt);
      }
      opt.textContent = 'your recording';
      sel.clip = index;
      $('clip').value = String(index);
      say(`${clip.seconds.toFixed(2)} s of speech${clip.snrDb < 28 ? ` · only ${clip.snrDb.toFixed(0)} dB over the room, expect misses` : ''}${clip.truncated ? ' · cut to 1 s' : ''}`);
      await recompute();
      startPlayback();
    }

    on(btn, 'click', async () => {
      if (recorder) { finish(); return; }
      player.stop();
      btn.disabled = true;
      say('waiting for the microphone…');
      recorder = new MicRecorder({ sampleRate: 16000 });
      try {
        await recorder.start({
          onLevel: (level, seconds) => { setLevel(level); btn.textContent = `■ stop ${seconds.toFixed(1)}s`; },
          onLimit: finish,
        });
      } catch (err) {
        recorder.dispose();
        recorder = null;
        say(micErrorMessage(err));
        rest();
        return;
      }
      btn.disabled = false;
      btn.classList.add('recording');
      btn.textContent = '■ stop 0.0s';
      say('say one digit, zero to nine');
    });
    disposers.push(() => { recorder?.dispose(); recorder = null; });
  }

  // --- start ---------------------------------------------------------------

  buildControls();
  wireMic();
  select(null);
  const onResize = () => draw(local.frame);
  window.addEventListener('resize', onResize);
  disposers.push(() => window.removeEventListener('resize', onResize));
  return { dispose: () => disposers.forEach((fn) => fn()) };
}
