// The leaky-integrator bank: the control that has memory but never rotates.
//
// Port of harness/models/leaky_bank.py. Each unit holds one number and, every
// frame, moves a fraction a of the way toward its squashed input:
//
//   x <- (1 - a) x + a tanh(g_in * g * u)
//
// u is its band's row value (band r drives every unit of row r, in every
// channel and column, the network's routing), g the input gain, g_in the unit's
// own weight drawn N(1, 0.1^2), and a = 1 - exp(-1 / (tau * rate)) its leak
// rate. The time constants tau run log-spaced from one hop frame (16 ms) to one
// clip (1 s): within a row, channel 0's 16 columns hold the fastest units and
// the last channel's the slowest. No unit sees another. The state-matched bank
// has 4 channels (1,024 units), the width-matched one 8 (2,048).

export class LeakyBank {
  constructor({ bank, grid = 16, gain = 1, rateHz = 62.5 }) {
    this.C = bank.channels; this.G = grid; this.N = grid * grid;
    this.D = this.C * this.N;
    this.gain = gain;
    this.inputGain = bank.inputGain;
    this.tau = bank.tau;
    this.a = new Float64Array(this.D);
    for (let i = 0; i < this.D; i++) this.a[i] = 1 - Math.exp(-1 / (this.tau[i] * rateHz));
    this.reset();
  }

  reset() { this.x = new Float64Array(this.D); }

  step(rowDrive, _quad, sig) {
    const { C, G, N, x, a, inputGain } = this;
    for (let c = 0; c < C; c++) {
      for (let r = 0; r < G; r++) {
        const u = rowDrive[r] * this.gain;
        for (let col = 0; col < G; col++) {
          const i = c * N + r * G + col;
          x[i] = (1 - a[i]) * x[i] + a[i] * Math.tanh(inputGain[i] * u);
          sig[i] = x[i];
        }
      }
    }
  }
}
