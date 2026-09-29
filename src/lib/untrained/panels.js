// Drawing helpers the first guide's plots.js does not have: value grids,
// phase-and-amplitude heatmaps, windows, labelled columns.

import { fitCanvas, magmaColor, phaseColor } from '../resonant/plots.js';

/** A G x G grid of values in [lo, hi], row 0 at the bottom. */
export function drawValueGrid(ctx, x0, y0, w, h, values, offset, G, lo = 0, hi = 1, color = magmaColor) {
  const cw = w / G, ch = h / G, span = Math.max(1e-9, hi - lo);
  for (let r = 0; r < G; r++) {
    for (let c = 0; c < G; c++) {
      ctx.fillStyle = color((values[offset + r * G + c] - lo) / span);
      ctx.fillRect(x0 + c * cw, y0 + h - (r + 1) * ch, Math.ceil(cw) + 0.5, Math.ceil(ch) + 0.5);
    }
  }
}

/** Channels side by side, as a mosaic of cols x rows tiles, each a G x G value grid. */
export function drawMosaic(canvas, values, offset, channels, G, opts = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const cols = opts.cols ?? Math.min(4, channels), rows = Math.ceil(channels / cols);
  const gap = 8, label = 14;
  const tile = Math.min((w - gap * (cols - 1)) / cols, (h - rows * label - gap * (rows - 1)) / rows);
  const ox = (w - (tile * cols + gap * (cols - 1))) / 2;
  ctx.font = '10px ui-monospace, monospace';
  for (let c = 0; c < channels; c++) {
    const col = c % cols, row = Math.floor(c / cols);
    const x = ox + col * (tile + gap), y = row * (tile + gap + label) + label;
    drawValueGrid(ctx, x, y, tile, tile, values, offset + c * G * G, G, opts.lo ?? 0, opts.hi ?? 1, opts.color);
    ctx.fillStyle = 'rgba(200,210,230,0.7)';
    ctx.fillText(opts.labels ? opts.labels[c] : `ch ${c + 1}`, x, y - 4);
  }
}

/** Heatmap where hue is phase and brightness is amplitude: the quadrature pathway's pairs. */
export function drawPhaseHeat(canvas, amp, phase, T, K, opts = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const cw = w / T, ch = h / K;
  let max = 1e-9;
  for (let i = 0; i < T * K; i++) max = Math.max(max, amp[i]);
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < K; k++) {
      const a = amp[t * K + k] / max;
      ctx.globalAlpha = Math.min(1, 0.08 + a);
      ctx.fillStyle = phaseColor(phase[t * K + k]);
      ctx.fillRect(t * cw, h - (k + 1) * ch, Math.ceil(cw) + 0.5, Math.ceil(ch) + 0.5);
    }
  }
  ctx.globalAlpha = 1;
  playhead(ctx, w, h, opts.playhead);
}

/** Shade the read's windows over a time axis of T frames. */
export function shadeWindows(canvas, edges, T, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth, h = canvas.clientHeight;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, (edges[0] / T) * w, h);          // the warm-up nobody reads
  for (let j = 0; j < edges.length - 1; j++) {
    const x = (edges[j] / T) * w;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    if (opts.labels) {
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(231,234,241,0.75)';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText(`w${j + 1}`, x + 4, 12);
    }
  }
  ctx.restore();
}

export function playhead(ctx, w, h, frac) {
  if (frac === undefined || frac === null) return;
  ctx.strokeStyle = '#ff8a5b';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(frac * w, 0); ctx.lineTo(frac * w, h); ctx.stroke();
}

/** Percent with one decimal. */
export const pct = (v) => `${(v * 100).toFixed(1)}%`;

/**
 * Labelled columns on a 0-100% axis with chance marked: accuracy against a setting.
 * items: [{label, value (0..1 or null), hot}]
 */
export function drawColumns(canvas, items, { chance = 0.1 } = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const padB = 18, padT = 16, gap = 10;
  const n = items.length, cw = (w - gap * (n - 1)) / n;
  const y = (v) => h - padB - v * (h - padB - padT);
  ctx.font = '10.5px ui-monospace, monospace';
  ctx.textAlign = 'center';
  items.forEach((it, i) => {
    const x = i * (cw + gap);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(x, padT, cw, h - padB - padT);
    if (it.value !== null && it.value !== undefined) {
      ctx.fillStyle = it.hot ? '#6ee7a8' : '#7cc4ff';
      ctx.fillRect(x, y(it.value), cw, y(0) - y(it.value));
      ctx.fillStyle = '#e7eaf1';
      ctx.fillText(pct(it.value), x + cw / 2, y(it.value) - 4);
    } else {
      ctx.fillStyle = 'rgba(141,150,171,0.8)';
      ctx.fillText('not run', x + cw / 2, y(0.5));
    }
    ctx.fillStyle = 'rgba(141,150,171,0.95)';
    ctx.fillText(it.label, x + cw / 2, h - 5);
  });
  ctx.strokeStyle = 'rgba(255,209,102,0.7)';
  ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(0, y(chance)); ctx.lineTo(w, y(chance)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,209,102,0.85)';
  ctx.fillText('chance', 2, y(chance) - 3);
}

/**
 * Lines over time with labelled axes: seconds along the bottom, value up the left.
 * series: [{ values, color, width }], one value per frame at `rate` frames a second.
 */
export function drawTimeSeries(canvas, series, { rate = 62.5, yMax = 1, yLabel = '', yTicks = [0, 0.5, 1] } = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const padL = 34, padR = 8, padT = 16, padB = 22;
  const n = Math.max(...series.map((s) => s.values.length));
  const tMax = (n - 1) / rate;
  const X = (t) => padL + (t / tMax) * (w - padL - padR);
  const Y = (v) => h - padB - (Math.min(yMax, Math.max(0, v)) / yMax) * (h - padT - padB);
  ctx.font = '10px ui-monospace, monospace';
  ctx.lineWidth = 1;
  // grid and ticks
  for (const v of yTicks) {
    ctx.strokeStyle = v === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(w - padR, Y(v)); ctx.stroke();
    ctx.fillStyle = 'rgba(200,210,230,0.7)';
    ctx.textAlign = 'right';
    ctx.fillText(String(v), padL - 6, Y(v) + 3);
  }
  ctx.textAlign = 'center';
  for (let t = 0; t <= tMax + 1e-9; t += 0.25) {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.moveTo(X(t), h - padB); ctx.lineTo(X(t), h - padB + 4); ctx.stroke();
    ctx.fillStyle = 'rgba(200,210,230,0.7)';
    ctx.fillText(`${t.toFixed(2)} s`, Math.min(w - padR - 16, Math.max(padL + 14, X(t))), h - 6);
  }
  ctx.textAlign = 'left';
  if (yLabel) ctx.fillText(yLabel, padL, 10);
  for (const s of series) {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width ?? 1.4;
    ctx.beginPath();
    s.values.forEach((v, t) => (t ? ctx.lineTo(X(t / rate), Y(v)) : ctx.moveTo(X(t / rate), Y(v))));
    ctx.stroke();
  }
}
