// Audio playback + a clock the animations can hang off.
//
// Analysis reads the raw PCM (wav.js); this only handles making noise and
// reporting how far through the clip we are. The AudioContext is created on the
// first user gesture, as browsers require.

export class ClipPlayer {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();   // url -> AudioBuffer
    this.source = null;
    this.onTick = null;
    this.onEnd = null;
    this._raf = null;
  }

  _ensureContext() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /** Decode for playback (a copy — decodeAudioData detaches the buffer). */
  async prepare(url, arrayBuffer) {
    if (this.buffers.has(url)) return this.buffers.get(url);
    const ctx = this._ensureContext();
    const buf = await ctx.decodeAudioData(arrayBuffer.slice(0));
    this.buffers.set(url, buf);
    return buf;
  }

  /**
   * Register raw samples (a microphone take) under `key`, replacing whatever
   * was there. The buffer keeps its own rate — playback resamples it.
   */
  prepareSamples(key, samples, sampleRate) {
    const ctx = this._ensureContext();
    const buf = ctx.createBuffer(1, samples.length, sampleRate);
    buf.copyToChannel(samples, 0);
    this.buffers.set(key, buf);
    return buf;
  }

  get playing() { return this.source !== null; }

  /** Play url at `rate`; calls onTick(seconds, fraction) every animation frame. */
  play(url, { rate = 1, onTick = null, onEnd = null } = {}) {
    this.stop();
    const ctx = this._ensureContext();
    const buffer = this.buffers.get(url);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    src.connect(ctx.destination);
    const startedAt = ctx.currentTime;
    src.start();
    this.source = src;
    this.onTick = onTick;
    this.onEnd = onEnd;

    const duration = buffer.duration / rate;
    const tick = () => {
      if (!this.source) return;
      const elapsed = (ctx.currentTime - startedAt) * rate;
      const frac = Math.min(1, elapsed / buffer.duration);
      if (this.onTick) this.onTick(elapsed, frac);
      if ((ctx.currentTime - startedAt) >= duration) { this.stop(); return; }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    if (this.source) {
      try { this.source.stop(); } catch { /* already ended */ }
      this.source.disconnect();
      this.source = null;
      if (this.onEnd) this.onEnd();
    }
  }
}
