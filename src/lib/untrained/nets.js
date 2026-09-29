// The five trained baselines, forward pass only, from their exported weights.
//
// Ports of harness/models/baselines/. Each maps the band-energy rows [T][16]
// to a hidden trajectory [T][H]; the post then reads frames 16 onward, the
// frames every arm is read over, with the shared statistics and readout.
//
//   gru          one GRU layer, 18 hidden units
//   tcn          two residual blocks, each a dilated causal convolution 16 -> 10,
//                a ReLU and a dilated causal convolution 10 -> 16 added back onto
//                the block's input; kernel 3, dilations 1, 2 and 4, 8
//   cnn          two causal 1-D convolutions (kernel 5), 16 -> 13 -> 16, a ReLU
//                between them and a linear output
//   transformer  input projection + sinusoidal positions, one causal
//                self-attention layer (2 heads of 8), post-norm, a 2-layer FFN
//   s4d          a diagonal state-space layer, 16 channels x 16 complex poles,
//                and a linear output

const sigmoid = (v) => 1 / (1 + Math.exp(-v));

function linear(w, b, x, xOff, inDim, outDim, out, outOff) {
  for (let o = 0; o < outDim; o++) {
    let acc = b ? b[o] : 0;
    for (let i = 0; i < inDim; i++) acc += w[o * inDim + i] * x[xOff + i];
    out[outOff + o] = acc;
  }
}

function gru(p, rows, T, G) {
  const H = p['gru.weight_hh_l0'].shape[1];
  const wi = p['gru.weight_ih_l0'], wh = p['gru.weight_hh_l0'];
  const bi = p['gru.bias_ih_l0'], bh = p['gru.bias_hh_l0'];
  const out = new Float64Array(T * H);
  let h = new Float64Array(H);
  const gi = new Float64Array(3 * H), gh = new Float64Array(3 * H);
  for (let t = 0; t < T; t++) {
    linear(wi, bi, rows, t * G, G, 3 * H, gi, 0);
    linear(wh, bh, h, 0, H, 3 * H, gh, 0);
    const next = new Float64Array(H);
    for (let k = 0; k < H; k++) {
      const r = sigmoid(gi[k] + gh[k]);
      const z = sigmoid(gi[H + k] + gh[H + k]);
      const n = Math.tanh(gi[2 * H + k] + r * gh[2 * H + k]);
      next[k] = (1 - z) * n + z * h[k];
    }
    h = next;
    out.set(h, t * H);
  }
  return { hidden: out, H };
}

/**
 * Causal conv1d with dilation d, left-padded with (k - 1) * d zeros: [T][inC] -> [T][outC],
 * rectified if relu.
 */
function causalConv(w, b, x, T, inC, outC, k, { dilation = 1, relu = false } = {}) {
  const out = new Float64Array(T * outC);
  const pad = (k - 1) * dilation;
  for (let t = 0; t < T; t++) {
    for (let o = 0; o < outC; o++) {
      let acc = b[o];
      for (let i = 0; i < inC; i++) {
        for (let j = 0; j < k; j++) {
          const src = t + j * dilation - pad;
          if (src >= 0) acc += w[(o * inC + i) * k + j] * x[src * inC + i];
        }
      }
      out[t * outC + o] = relu ? Math.max(0, acc) : acc;
    }
  }
  return out;
}

function cnn(p, rows, T, G) {
  const w1 = p['c1.weight'], w2 = p['c2.weight'];
  const hidden = w1.shape[0], k = w1.shape[2];
  const x = causalConv(w1, p['c1.bias'], rows, T, G, hidden, k, { relu: true });
  return { hidden: causalConv(w2, p['c2.bias'], x, T, hidden, w2.shape[0], k), H: w2.shape[0] };
}

/** The harness's TCN dilations, per residual block (harness/models/baselines/tcn.py). */
const TCN_DILATIONS = [[1, 2], [4, 8]];

function tcn(p, rows, T, G) {
  let x = Float64Array.from(rows);
  TCN_DILATIONS.forEach(([d1, d2], b) => {
    const w1 = p[`blocks.${b}.0.weight`], w2 = p[`blocks.${b}.1.weight`];
    const hidden = w1.shape[0], k = w1.shape[2];
    const h = causalConv(w1, p[`blocks.${b}.0.bias`], x, T, G, hidden, k, { dilation: d1, relu: true });
    const y = causalConv(w2, p[`blocks.${b}.1.bias`], h, T, hidden, G, k, { dilation: d2 });
    for (let i = 0; i < x.length; i++) x[i] += y[i];      // the residual path
  });
  return { hidden: x, H: G };
}

function layerNorm(x, off, d, w, b) {
  let m = 0;
  for (let i = 0; i < d; i++) m += x[off + i];
  m /= d;
  let v = 0;
  for (let i = 0; i < d; i++) v += (x[off + i] - m) ** 2;
  const inv = 1 / Math.sqrt(v / d + 1e-5);
  for (let i = 0; i < d; i++) x[off + i] = (x[off + i] - m) * inv * w[i] + b[i];
}

function transformer(p, rows, T, G) {
  const d = p['inp.weight'].shape[0], heads = 2, hd = d / heads;
  const x = new Float64Array(T * d);
  for (let t = 0; t < T; t++) {
    linear(p['inp.weight'], p['inp.bias'], rows, t * G, G, d, x, t * d);
    for (let i = 0; i < d / 2; i++) {
      const ang = t / 10000 ** ((2 * i) / d);
      x[t * d + i] += Math.sin(ang);
      x[t * d + d / 2 + i] += Math.cos(ang);
    }
  }
  const qkv = new Float64Array(T * 3 * d);
  for (let t = 0; t < T; t++) linear(p['attn.in_proj_weight'], p['attn.in_proj_bias'], x, t * d, d, 3 * d, qkv, t * 3 * d);
  const att = new Float64Array(T * d);
  const scale = 1 / Math.sqrt(hd);
  const sc = new Float64Array(T);
  for (let h = 0; h < heads; h++) {
    for (let t = 0; t < T; t++) {
      let max = -Infinity;
      for (let s = 0; s <= t; s++) {              // causal: position t sees 0..t
        let acc = 0;
        for (let i = 0; i < hd; i++) acc += qkv[t * 3 * d + h * hd + i] * qkv[s * 3 * d + d + h * hd + i];
        sc[s] = acc * scale;
        if (sc[s] > max) max = sc[s];
      }
      let z = 0;
      for (let s = 0; s <= t; s++) { sc[s] = Math.exp(sc[s] - max); z += sc[s]; }
      for (let i = 0; i < hd; i++) {
        let acc = 0;
        for (let s = 0; s <= t; s++) acc += sc[s] * qkv[s * 3 * d + 2 * d + h * hd + i];
        att[t * d + h * hd + i] = acc / z;
      }
    }
  }
  const a = new Float64Array(d), f = new Float64Array(d), g = new Float64Array(d);
  for (let t = 0; t < T; t++) {
    linear(p['attn.out_proj.weight'], p['attn.out_proj.bias'], att, t * d, d, d, a, 0);
    for (let i = 0; i < d; i++) x[t * d + i] += a[i];
    layerNorm(x, t * d, d, p['ln1.weight'], p['ln1.bias']);
    linear(p['ff1.weight'], p['ff1.bias'], x, t * d, d, d, f, 0);
    for (let i = 0; i < d; i++) f[i] = Math.max(0, f[i]);
    linear(p['ff2.weight'], p['ff2.bias'], f, 0, d, d, g, 0);
    for (let i = 0; i < d; i++) x[t * d + i] += g[i];
    layerNorm(x, t * d, d, p['ln2.weight'], p['ln2.bias']);
  }
  return { hidden: x, H: d };
}

function s4d(p, rows, T, G) {
  const H = p['inp.weight'].shape[0], S = p.log_decay.shape[1];
  const u = new Float64Array(T * H);
  for (let t = 0; t < T; t++) linear(p['inp.weight'], p['inp.bias'], rows, t * G, G, H, u, t * H);
  const ar = new Float64Array(H * S), ai = new Float64Array(H * S);
  for (let k = 0; k < H * S; k++) {
    const mag = Math.exp(-Math.exp(p.log_decay[k]));
    ar[k] = mag * Math.cos(p.freq[k]); ai[k] = mag * Math.sin(p.freq[k]);
  }
  const xr = new Float64Array(H * S), xi = new Float64Array(H * S);
  const y = new Float64Array(H), out = new Float64Array(T * H);
  for (let t = 0; t < T; t++) {
    for (let h = 0; h < H; h++) {
      const ut = u[t * H + h];
      let acc = 0;
      for (let s = 0; s < S; s++) {
        const k = h * S + s;
        const nr = ar[k] * xr[k] - ai[k] * xi[k] + p.b[k] * ut;
        const ni = ar[k] * xi[k] + ai[k] * xr[k];
        xr[k] = nr; xi[k] = ni;
        acc += nr * p.c_re[k] - ni * p.c_im[k];   // Re(x c)
      }
      y[h] = acc + p.d_skip[h] * ut;
    }
    linear(p['out.weight'], p['out.bias'], y, 0, H, H, out, t * H);
  }
  return { hidden: out, H };
}

export const NETS = { gru, tcn, cnn, transformer, s4d };

/** Hidden trajectory [T][H] for a trained baseline. rows: Float32Array(T * G). */
export function netHidden(arch, params, rows, T, G) {
  if (!NETS[arch]) throw new Error(`unknown baseline ${arch}`);
  return NETS[arch](params, rows, T, G);
}
