// Minimal RIFF/WAVE reader for the demo clips.
//
// We parse the PCM ourselves instead of using decodeAudioData because the
// analysis path has to match the Python export bit-for-bit: decodeAudioData
// resamples into the AudioContext's rate, which would silently change the
// frame grid. (Playback still goes through Web Audio — see player.js.)

/** Decode a 16-bit PCM mono WAV into {samples: Float32Array, sampleRate}. */
export function decodeWav(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const tag = (o) => String.fromCharCode(view.getUint8(o), view.getUint8(o + 1),
                                         view.getUint8(o + 2), view.getUint8(o + 3));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('not a RIFF/WAVE file');

  let offset = 12, fmt = null, data = null;
  while (offset + 8 <= view.byteLength) {
    const id = tag(offset);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (id === 'fmt ') {
      fmt = {
        format: view.getUint16(body, true),
        channels: view.getUint16(body + 2, true),
        sampleRate: view.getUint32(body + 4, true),
        bits: view.getUint16(body + 14, true),
      };
    } else if (id === 'data') {
      data = { start: body, size: Math.min(size, view.byteLength - body) };
    }
    offset = body + size + (size % 2); // chunks are word-aligned
  }
  if (!fmt || !data) throw new Error('missing fmt/data chunk');
  if (fmt.format !== 1 || fmt.bits !== 16) throw new Error('expected 16-bit PCM');

  const frames = Math.floor(data.size / 2 / fmt.channels);
  const samples = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    let acc = 0;
    for (let c = 0; c < fmt.channels; c++) {
      acc += view.getInt16(data.start + 2 * (i * fmt.channels + c), true);
    }
    samples[i] = acc / fmt.channels / 32768; // int16 -> [-1, 1)
  }
  return { samples, sampleRate: fmt.sampleRate };
}
