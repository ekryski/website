// The six lattice geometries as coupling operators.
//
// A geometry never changes what is stored: every channel is 256 oscillators in
// a 16 x 16 grid, row r driven by mel band r. It changes which oscillators are
// neighbours, i.e. how the grid's edges are glued, and so how one channel's
// kernel of taps becomes an operator. Port of harness/models/geometries/: the
// export ships each geometry's clamped taps (the coupling ceiling already
// applied), and this builds the same dense [C, N, N] operator the harness's
// matmul path builds from its gather index.
//
//   torus     both axes wrap                          taps G x G
//   cylinder  columns wrap, rows (frequency) open      taps 2G x G, zero-padded rows
//   sheet     neither wraps                            taps 2G x 2G
//   helix     one closed ring of 256, 64 per turn      taps 256
//   cube      16 x 4 x 4, every axis wraps             taps 16 x 4 x 4
//   sphere    as cylinder, sources weighted by cos(latitude)

export const GEOMETRIES = ['torus', 'cylinder', 'sheet', 'helix', 'cube', 'sphere'];

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
  if (name === 'helix') {
    const idx = new Int32Array(N * N);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) idx[i * N + j] = (((i - j) % N) + N) % N;
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
 * Dense operator [C][N][N] (Float64Array, row-major): out_i = sum_j op[i][j] f_j.
 * taps: Float32Array(C * tapsPerChannel) from the export.
 */
export function denseOperator(name, taps, C, G) {
  const N = G * G, idx = circulantIndex(name, G);
  const per = taps.length / C;
  const op = new Float64Array(C * N * N);
  const w = name === 'sphere' ? sphereWeights(G) : null;
  for (let c = 0; c < C; c++) {
    const base = c * per, ob = c * N * N;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        let v = taps[base + idx[i * N + j]];
        if (w) v *= w[Math.floor(j / G)];     // the source's area element
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

/** A site's nearest neighbours under a geometry, as (row, col) pairs: for the figures. */
export function neighbours(name, G, r, c) {
  const out = [];
  const add = (rr, cc) => out.push([rr, cc]);
  const wrapR = name === 'torus' || name === 'cube';
  const wrapC = name !== 'sheet';
  if (name === 'helix') {
    const N = G * G, p = r * G + c;
    for (const d of [-1, 1, -64, 64]) {
      const q = (((p + d) % N) + N) % N;
      add(Math.floor(q / G), q % G);
    }
    return out;
  }
  if (name === 'cube') {
    const s = Math.round(Math.sqrt(G));
    const y = Math.floor(c / s), x = c % s;
    add((r + 1) % G, c); add((r + G - 1) % G, c);
    add(r, ((y + 1) % s) * s + x); add(r, ((y + s - 1) % s) * s + x);
    add(r, y * s + ((x + 1) % s)); add(r, y * s + ((x + s - 1) % s));
    return out;
  }
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    let rr = r + dr, cc = c + dc;
    if (rr < 0 || rr >= G) { if (!wrapR) continue; rr = (rr + G) % G; }
    if (cc < 0 || cc >= G) { if (!wrapC) continue; cc = (cc + G) % G; }
    add(rr, cc);
  }
  return out;
}
