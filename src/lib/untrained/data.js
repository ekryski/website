// Everything the post runs on comes from one export of paper 02's harness
// (papers/02-untrained-reservoirs/src/scripts/export_web_demo.py): the front
// end's constants, the seed-0 physics, the demo clips and, per config, the
// readout fitted at that exact registered condition.
//
// Loading is lazy: the manifest and the clips up front, and each readout,
// projection and trained network only when a config that needs it is picked.
// Nothing here touches the DOM, so the same code runs in Node for the parity
// check (scripts/check-untrained-parity.mjs).

export const BASE = '/untrained';

/** Decode a {shape, dtype, b64} payload. */
export function decodeB64(payload) {
  const bin = atob(payload.b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (payload.dtype === 'float32') return new Float32Array(bytes.buffer);
  if (payload.dtype === 'int16') return new Int16Array(bytes.buffer);
  if (payload.dtype === 'float64') return new Float64Array(bytes.buffer);
  throw new Error(`unknown dtype ${payload.dtype}`);
}

// float16 -> float32 through a table: no Float16Array needed in older browsers
let HALF = null;
function halfTable() {
  if (HALF) return HALF;
  HALF = new Float32Array(65536);
  for (let h = 0; h < 65536; h++) {
    const s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 0x1f, f = h & 0x3ff;
    HALF[h] = e === 0 ? s * 2 ** -14 * (f / 1024)
      : e === 31 ? (f ? NaN : s * Infinity)
      : s * 2 ** (e - 15) * (1 + f / 1024);
  }
  return HALF;
}

export function decodeHalf(buffer) {
  const src = new Uint16Array(buffer);
  const out = new Float32Array(src.length);
  const t = halfTable();
  for (let i = 0; i < src.length; i++) out[i] = t[src[i]];
  return out;
}

/** A typed view per named array of a binary written by write_bin(). */
export function viewLayout(buffer, layout) {
  const out = {};
  for (const [name, [offset, count, dtype, shape]] of Object.entries(layout)) {
    if (dtype === 'float32') out[name] = new Float32Array(buffer, offset, count);
    else if (dtype === 'float64') out[name] = new Float64Array(buffer, offset, count);
    else throw new Error(`${name}: unexpected ${dtype}`);
    out[name].shape = shape;
  }
  return out;
}

/**
 * The store: the manifest plus a cache of everything fetched after it.
 * fetchBytes(url) -> ArrayBuffer and fetchJson(url) are injectable so Node can
 * read the files from disk.
 */
export class Store {
  constructor({ base = BASE, fetchBytes, fetchJson } = {}) {
    this.base = base;
    this.fetchBytes = fetchBytes || (async (url) => (await fetch(url)).arrayBuffer());
    this.fetchJson = fetchJson || (async (url) => (await fetch(url)).json());
    this.cache = new Map();
    this.manifest = null;
  }

  url(path) { return `${this.base}/${path}`; }

  async load() {
    const m = await this.fetchJson(this.url('manifest.json'));
    this.manifest = m;
    const fe = m.frontend;
    this.frontend = { ...fe, melFb: decodeB64(fe.mel_fb) };
    const ph = m.physics;
    this.physics = {
      ...ph,
      omega: decodeB64(ph.omega),
      phase0: decodeB64(ph.phase0),
      slState0: decodeB64(ph.sl.state0),
      taps: Object.fromEntries(Object.entries(ph.geometries).map(([k, g]) => [k, decodeB64(g.taps)])),
    };
    this.banks = Object.fromEntries(Object.entries(m.banks).map(([k, b]) => [k, {
      ...b, inputGain: decodeB64(b.input_gain), tau: decodeB64(b.tau_s),
    }]));
    return this;
  }

  once(key, make) {
    if (!this.cache.has(key)) {
      const p = make().catch((err) => { this.cache.delete(key); throw err; });
      this.cache.set(key, p);
    }
    return this.cache.get(key);
  }

  config(id) {
    const c = this.manifest.configs[id];
    if (!c) throw new Error(`no config ${id}`);
    return c;
  }

  /** The fitted readout for a config: {inv1, shift, P, mean2, sd2, weight, bias, ...}. */
  readout(id) {
    const cfg = this.config(id);
    return this.once(`readout:${id}`, async () => {
      const r = cfg.readout;
      const parts = viewLayout(await this.fetchBytes(this.url(r.file)), r.layout);
      const out = { ...parts, native: r.native, width: r.width, projected: r.projected };
      if (r.projected) out.P = await this.projection(r.projection);
      return out;
    });
  }

  projection(file) {
    return this.once(`proj:${file}`, async () => decodeHalf(await this.fetchBytes(this.url(file))));
  }

  /** A trained baseline's weights, by parameter name. */
  net(id) {
    const cfg = this.config(id);
    return this.once(`net:${cfg.net.file}`, async () =>
      viewLayout(await this.fetchBytes(this.url(cfg.net.file)), cfg.net.layout));
  }

  /** Unit noise for demo clip k at +level dB, as the harness drew it. */
  async noise(clipIndex, levelDb) {
    const n = this.manifest.noise;
    const all = await this.once('noise', async () => new Int16Array(await this.fetchBytes(this.url(n.file))));
    const li = n.levels_db.indexOf(levelDb);
    if (li < 0) return null;
    const off = (clipIndex * n.levels_db.length + li) * n.samples;
    const out = new Float32Array(n.samples);
    for (let i = 0; i < n.samples; i++) out[i] = all[off + i] / n.scale;
    return out;
  }
}

/** Decode a 16-bit PCM mono WAV at the bank's own scale (int16 / 32767). */
export function decodeBankWav(arrayBuffer, int16Scale = 32767) {
  const view = new DataView(arrayBuffer);
  const tag = (o) => String.fromCharCode(...[0, 1, 2, 3].map((k) => view.getUint8(o + k)));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('not a RIFF/WAVE file');
  let offset = 12, rate = 16000, data = null;
  while (offset + 8 <= view.byteLength) {
    const id = tag(offset), size = view.getUint32(offset + 4, true), body = offset + 8;
    if (id === 'fmt ') rate = view.getUint32(body + 4, true);
    else if (id === 'data') data = { start: body, size: Math.min(size, view.byteLength - body) };
    offset = body + size + (size % 2);
  }
  if (!data) throw new Error('missing data chunk');
  const n = Math.floor(data.size / 2);
  const samples = new Float32Array(n);
  for (let i = 0; i < n; i++) samples[i] = view.getInt16(data.start + 2 * i, true) / int16Scale;
  return { samples, sampleRate: rate };
}
