// The eight lattice geometries as coupling operators.
//
// A geometry never changes what is stored: every channel is 256 oscillators in
// a 16 x 16 grid, row r driven by mel band r. It changes which oscillators are
// neighbours, i.e. how the grid's edges are glued, and so how one channel's
// kernel of taps becomes an operator. Port of harness/models/geometries/: the
// export ships each geometry's capped taps (the coupling ceiling already
// applied), and this builds the same dense [C, N, N] operator the harness's
// matmul path builds from its gather index.
//
//   torus     both axes wrap                          taps G x G
//   cylinder  columns wrap, rows (frequency) open      taps 2G x G, zero-padded rows
//   sheet     neither wraps                            taps 2G x 2G
//   helix     one closed ring of 256, 64 per turn      taps 256
//   cube      16 x 4 x 4, every axis wraps             taps 16 x 4 x 4
//   sphere    as cylinder, sources weighted by cos(latitude)
//   coil      one open line of 256, apex (lowest band) to base, 64 per turn;
//             taps 2N at signed offsets, zero-padded so the line never closes
//   cochlea   the coil with the travelling wave's direction (already in its
//             taps) and each site's incoming coupling weighted by the spiral's
//             curvature there, 1 at the apex to 1/4 at the base
//   cochlea-matched  the cochlea's weights rescaled to average 1: the control
//             at the coil's average coupling

export const GEOMETRIES = ['torus', 'cylinder', 'sheet', 'helix', 'cube', 'sphere', 'coil', 'cochlea', 'cochlea-matched'];
const COILS = new Set(['coil', 'cochlea', 'cochlea-matched']);
/** The cochlea's radius at the apex, as a share of its radius at the base (harness Cochlea.APEX_RADIUS). */
const APEX_RADIUS = 0.25;

function offsetIndex(G, rowsMod, colsMod) {
  const N = G * G, idx = new Int32Array(N * N);
  for (let i = 0; i < N; i++) {
    const yi = Math.floor(i / G), xi = i % G;
    for (let j = 0; j < N; j++) {
      const yj = Math.floor(j / G), xj = j % G;
      const dy = (((yi - yj) % rowsMod) + rowsMod) % rowsMod;
      const dx = (((xi - xj) % colsMod) + colsMod) % colsMod;
      idx[i * N + j] = dy * colsMod + dx;
    }
  }
  return idx;
}

function circulantIndex(name, G) {
  const N = G * G;
  if (name === 'torus') return offsetIndex(G, G, G);
  if (name === 'cylinder' || name === 'sphere') return offsetIndex(G, 2 * G, G);
  if (name === 'sheet') return offsetIndex(G, 2 * G, 2 * G);
  if (name === 'helix' || COILS.has(name)) {
    const M = name === 'helix' ? N : 2 * N;      // the coil's taps sit in a buffer of 2N: the line stays open
    const idx = new Int32Array(N * N);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) idx[i * N + j] = (((i - j) % M) + M) % M;
    return idx;
  }
  if (name === 'cube') {
    const s = Math.round(Math.sqrt(G)), idx = new Int32Array(N * N);
    const z = (p) => Math.floor(p / (s * s)), y = (p) => Math.floor(p / s) % s, x = (p) => p % s;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const dz = (((z(i) - z(j)) % G) + G) % G;
        const dy = (((y(i) - y(j)) % s) + s) % s;
        const dx = (((x(i) - x(j)) % s) + s) % s;
        idx[i * N + j] = dz * s * s + dy * s + dx;
      }
    }
    return idx;
  }
  throw new Error(`unknown geometry ${name}`);
}

/** cos(latitude) per row, south to north, poles open (harness sphere_cos_weights). */
export function sphereWeights(G) {
  const w = new Float64Array(G);
  for (let r = 0; r < G; r++) w[r] = Math.cos(-Math.PI / 2 + (Math.PI * (r + 0.5)) / G);
  return w;
}

/**
 * The cochlea's curvature weight on the coupling into each of the N coil sites:
 * APEX_RADIUS ** (p / (N - 1)), 1 at the apex (p = 0) and APEX_RADIUS at the base;
 * rescaled to average 1 for the matched control. None for the other geometries.
 */
export function curvatureWeights(name, N) {
  if (name !== 'cochlea' && name !== 'cochlea-matched') return null;
  const w = new Float64Array(N);
  for (let p = 0; p < N; p++) w[p] = APEX_RADIUS ** (p / (N - 1));
  if (name === 'cochlea-matched') {
    const mean = w.reduce((a, b) => a + b, 0) / N;
    for (let p = 0; p < N; p++) w[p] /= mean;
  }
  return w;
}

/**
 * Dense operator [C][N][N] (Float64Array, row-major): out_i = sum_j op[i][j] f_j.
 * taps: Float32Array(C * tapsPerChannel) from the export.
 */
export function denseOperator(name, taps, C, G) {
  const N = G * G, idx = circulantIndex(name, G);
  const per = taps.length / C;
  const op = new Float64Array(C * N * N);
  const source = name === 'sphere' ? sphereWeights(G) : null;
  const target = curvatureWeights(name, N);
  for (let c = 0; c < C; c++) {
    const base = c * per, ob = c * N * N;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        let v = taps[base + idx[i * N + j]];
        if (source) v *= source[Math.floor(j / G)];     // the source's area element
        if (target) v *= target[i];                      // the curvature where the coupling lands
        op[ob + i * N + j] = v;
      }
    }
  }
  return op;
}

/** Row sums: each site's response to a uniform field (Winfree's K * 1). */
export function rowSums(op, C, N) {
  const out = new Float64Array(C * N);
  for (let c = 0; c < C; c++) {
    for (let i = 0; i < N; i++) {
      let s = 0;
      const row = c * N * N + i * N;
      for (let j = 0; j < N; j++) s += op[row + j];
      out[c * N + i] = s;
    }
  }
  return out;
}
