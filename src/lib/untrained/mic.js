// A microphone take, shaped the way paper 02's bank shapes a corpus recording.
//
// The bank (harness/stimuli/digits.py:load_clip) resamples each AudioMNIST
// recording to 16 kHz, scales its peak to 0.5, trims everything below 1% of
// that peak from both ends, caps it at one second and zero-pads it to 16,000
// samples, so every word starts at the first sample. A browser recording also
// carries room tone, which a 1% threshold cannot cut, so the word is found
// first with the first guide's envelope detector, and the bank's own recipe is
// applied to what it finds.

import { resample, highPass, speechBounds } from '../resonant/mic.js';

export { MicRecorder, micSupported, micErrorMessage } from '../resonant/mic.js';

const PEAK = 0.5;
const TRIM_FRACTION = 0.01;

/** Recording in, one bank-shaped clip out, or null if it holds no speech. */
export async function conditionForBank(raw, rawRate, sampleRate = 16000, total = 16000) {
  const cleaned = highPass(await resample(raw, rawRate, sampleRate), sampleRate);
  const bounds = speechBounds(cleaned, sampleRate);
  if (!bounds) return null;
  let word = cleaned.slice(bounds.start, bounds.end);
  let peak = 0;
  for (let i = 0; i < word.length; i++) peak = Math.max(peak, Math.abs(word[i]));
  if (peak <= 0) return null;
  for (let i = 0; i < word.length; i++) word[i] = (PEAK * word[i]) / peak;
  let a = 0, b = word.length - 1;
  while (a < b && Math.abs(word[a]) <= TRIM_FRACTION * PEAK) a++;
  while (b > a && Math.abs(word[b]) <= TRIM_FRACTION * PEAK) b--;
  word = word.subarray(a, b + 1);
  const length = Math.min(total, word.length);
  const clip = new Float32Array(total);
  clip.set(word.subarray(0, length));
  // the bank stores int16; round the same way so the take is a clip the bank could hold
  for (let i = 0; i < total; i++) clip[i] = Math.round(clip[i] * 32767) / 32767;
  return { samples: clip, speech: length, sampleRate, seconds: length / sampleRate,
           truncated: word.length > total, snrDb: bounds.snrDb };
}
