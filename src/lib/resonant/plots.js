// Small canvas drawing kit for the figures. No dependencies, no chart library:
// every panel here is a handful of pixels or rectangles, and going direct keeps
// the redraws cheap enough to run inside the playback animation loop.

/** Size a canvas to its CSS box at device resolution; returns a ready 2D ctx. */
export function fitCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  return ctx;
}

// The guide's palette is scoped to its own wrapper (so it cannot leak into the
// rest of the site), which means variables must be read from THAT element and
// not from :root.
const css = (name) => {
  const root = document.querySelector('[data-resonant-root]') || document.documentElement;
  return getComputedStyle(root).getPropertyValue(name).trim();
};

// --- colormaps --------------------------------------------------------------

/** Cyclic phase colormap: hue rides theta, so 0 and 2*pi are the same color. */
export function phaseColor(theta) {
  const h = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * 360;
  return `hsl(${h}, 78%, 58%)`;
}

/** Magnitude ramp (dark -> violet -> orange -> pale), v in [0, 1]. */
export function magmaColor(v) {
  const t = Math.min(1, Math.max(0, v));
  const stops = [[8, 10, 30], [63, 22, 106], [148, 44, 112], [222, 85, 72],
                 [251, 156, 66], [252, 232, 179]];
  const x = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  const f = x - i;
  const c = stops[i].map((a, k) => Math.round(a + (stops[i + 1][k] - a) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// --- panels -----------------------------------------------------------------

/** Waveform with optional playhead and a highlighted analysis window. */
export function drawWaveform(canvas, samples, opts = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight, mid = h / 2;
  if (opts.window) {
    const [a, b] = opts.window;
    ctx.fillStyle = 'rgba(120, 190, 255, 0.18)';
    ctx.fillRect(a * w, 0, Math.max(1.5, (b - a) * w), h);
  }
  ctx.strokeStyle = opts.color || css('--accent');
  ctx.lineWidth = 1;
  ctx.beginPath();
  const step = Math.max(1, Math.floor(samples.length / w));
  for (let x = 0; x < w; x++) {
    let lo = 1, hi = -1;
    const start = Math.floor((x / w) * samples.length);
    for (let i = start; i < Math.min(samples.length, start + step); i++) {
      if (samples[i] < lo) lo = samples[i];
      if (samples[i] > hi) hi = samples[i];
    }
    ctx.moveTo(x + 0.5, mid - hi * mid * 0.95);
    ctx.lineTo(x + 0.5, mid - lo * mid * 0.95);
  }
  ctx.stroke();
  drawPlayhead(ctx, w, h, opts.playhead);
}

/**
 * Generic heatmap. data is column-major by time: value(t, k) = data[t * K + k],
 * drawn with k = 0 at the BOTTOM (low frequency down, as spectrograms are read).
 */
export function drawHeatmap(canvas, data, T, K, opts = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  let min = opts.min, max = opts.max;
  if (max === undefined) {
    max = -Infinity;
    for (let i = 0; i < T * K; i++) if (data[i] > max) max = data[i];
  }
  if (min === undefined) {
    // clip-relative range: loud frame sets the top, everything `dynamicRange`
    // log units below it reads as silence. Keeps quiet and loud clips legible.
    if (opts.dynamicRange) min = max - opts.dynamicRange;
    else { min = Infinity; for (let i = 0; i < T * K; i++) if (data[i] < min) min = data[i]; }
  }
  const span = Math.max(1e-9, max - min);
  const cw = w / T, ch = h / K;
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < K; k++) {
      ctx.fillStyle = magmaColor((data[t * K + k] - min) / span);
      ctx.fillRect(t * cw, h - (k + 1) * ch, Math.ceil(cw) + 0.5, Math.ceil(ch) + 0.5);
    }
  }
  if (opts.highlightRow !== undefined) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, h - (opts.highlightRow + 1) * ch, w, ch);
  }
  drawPlayhead(ctx, w, h, opts.playhead);
}

/** A G x G phase field as a square of cyclic-colored cells. */
export function drawField(canvas, theta, offset, G, opts = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const cw = w / G, ch = h / G;
  for (let r = 0; r < G; r++) {
    for (let c = 0; c < G; c++) {
      ctx.fillStyle = phaseColor(theta[offset + r * G + c]);
      // row 0 (lowest band) at the bottom, matching the mel panels above it
      ctx.fillRect(c * cw, h - (r + 1) * ch, Math.ceil(cw) + 0.5, Math.ceil(ch) + 0.5);
    }
  }
  if (opts.highlightRow !== undefined && opts.highlightRow >= 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.5, h - (opts.highlightRow + 1) * ch, w - 1, ch);
  }
}

/** Line chart of one or more equal-length series; opts.yMax sets the top (default 1). */
export function drawLines(canvas, series, opts = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const pad = 2, yMax = opts.yMax ?? 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 1;
  for (const frac of [0.25, 0.5, 0.75]) {
    ctx.beginPath();
    ctx.moveTo(0, h * frac); ctx.lineTo(w, h * frac);
    ctx.stroke();
  }
  for (const s of series) {
    ctx.strokeStyle = s.color || css('--accent');
    ctx.lineWidth = s.width || 1.4;
    ctx.beginPath();
    const n = s.values.length;
    for (let t = 0; t < n; t++) {
      const x = (t / Math.max(1, n - 1)) * w;
      const y = h - pad - Math.min(1, Math.max(0, s.values[t] / yMax)) * (h - 2 * pad);
      if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  drawPlayhead(ctx, w, h, opts.playhead);
}

/** Horizontal bars, one per value; used for the drive rows and the readout. */
export function drawBars(canvas, values, opts = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const n = values.length, gap = opts.gap ?? 2;
  const bh = (h - gap * (n - 1)) / n;
  const max = opts.max ?? Math.max(1e-6, ...values);
  for (let i = 0; i < n; i++) {
    // index 0 at the bottom, so the bars line up with the heatmaps
    const y = h - (i + 1) * bh - i * gap;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, y, w, bh);
    ctx.fillStyle = opts.color ? opts.color(i, values[i] / max) : magmaColor(values[i] / max);
    ctx.fillRect(0, y, (values[i] / max) * w, bh);
  }
}

/** Spectrum / curve plot with axis labels. */
export function drawCurve(canvas, xs, ys, opts = {}) {
  const ctx = fitCanvas(canvas);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const padL = opts.padL ?? 34, padB = opts.padB ?? 18, padT = 6, padR = 6;
  const xmin = opts.xmin ?? Math.min(...xs), xmax = opts.xmax ?? Math.max(...xs);
  const ymin = opts.ymin ?? Math.min(...ys), ymax = opts.ymax ?? Math.max(...ys);
  const X = (v) => padL + ((v - xmin) / (xmax - xmin || 1)) * (w - padL - padR);
  const Y = (v) => h - padB - ((v - ymin) / (ymax - ymin || 1)) * (h - padB - padT);

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.fillStyle = css('--muted');
  ctx.font = '10px ui-monospace, monospace';
  ctx.beginPath();
  ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.lineTo(w - padR, h - padB);
  ctx.stroke();
  (opts.xTicks || []).forEach((t) => {
    ctx.fillText(t.label, X(t.value) - 8, h - 5);
    ctx.beginPath(); ctx.moveTo(X(t.value), h - padB); ctx.lineTo(X(t.value), h - padB + 3); ctx.stroke();
  });
  (opts.yTicks || []).forEach((t) => {
    ctx.fillText(t.label, 2, Y(t.value) + 3);
  });
  for (const band of opts.bands || []) {
    ctx.fillStyle = band.color;
    ctx.beginPath();
    band.xs.forEach((x, i) => (i ? ctx.lineTo(X(x), Y(band.ys[i])) : ctx.moveTo(X(x), Y(band.ys[i]))));
    ctx.lineTo(X(band.xs[band.xs.length - 1]), Y(ymin));
    ctx.lineTo(X(band.xs[0]), Y(ymin));
    ctx.fill();
  }
  ctx.beginPath();
  xs.forEach((x, i) => (i ? ctx.lineTo(X(x), Y(ys[i])) : ctx.moveTo(X(x), Y(ys[i]))));
  if (opts.fill) {   // a filled area reads far better than a line for dense spectra
    ctx.save();
    ctx.lineTo(X(xs[xs.length - 1]), Y(ymin));
    ctx.lineTo(X(xs[0]), Y(ymin));
    ctx.closePath();
    ctx.fillStyle = opts.fill;
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    xs.forEach((x, i) => (i ? ctx.lineTo(X(x), Y(ys[i])) : ctx.moveTo(X(x), Y(ys[i]))));
  }
  ctx.strokeStyle = opts.color || css('--accent');
  ctx.lineWidth = 1.8;
  ctx.stroke();
  for (const m of opts.markers || []) {
    const weight = m.weight ?? 1;                   // 0..1: how loud this band is
    const color = m.color || css('--hot');
    if (opts.dropLines) {
      // a stem from the frequency axis up to the curve — reads as "this
      // frequency is present right now, and here is where the ear puts it"
      ctx.save();
      ctx.globalAlpha = 0.25 + 0.6 * weight;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(X(m.x), Y(ymin)); ctx.lineTo(X(m.x), Y(m.y));
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = 0.45 + 0.55 * weight;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(X(m.x), Y(m.y), 2.5 + 3.5 * weight, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
    if (m.label) { ctx.fillStyle = color; ctx.fillText(m.label, X(m.x) + 6, Y(m.y) - 4); }
  }
}

function drawPlayhead(ctx, w, h, frac) {
  if (frac === undefined || frac === null) return;
  ctx.strokeStyle = css('--hot');
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(frac * w, 0); ctx.lineTo(frac * w, h);
  ctx.stroke();
}
