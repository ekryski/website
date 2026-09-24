// Parity check for the paper 02 post: run every exported config on every demo
// clip in Node, with the page's own code, and compare the ten scores against
// the ones the Python export computed with the harness.
//
//   node scripts/check-untrained-parity.mjs [--dir public/untrained] [--only <substring>] [--clips 4]
//
// Exits non-zero if any config disagrees on a predicted digit or its scores
// drift past the tolerance.

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { Store, decodeBankWav } from '../src/lib/untrained/data.js'
import { addNoise } from '../src/lib/untrained/frontend.js'
import { runConfig } from '../src/lib/untrained/engine.js'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const dir = path.resolve(opt('dir', 'public/untrained'))
const only = opt('only', '')
const maxClips = Number(opt('clips', '20'))
const TOL = Number(opt('tol', '2e-3'))

const toBuffer = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
const store = new Store({
  base: dir,
  fetchBytes: async (url) => toBuffer(await readFile(url)),
  fetchJson: async (url) => JSON.parse(await readFile(url, 'utf8')),
})
await store.load()
const m = store.manifest

const clips = []
for (const c of m.clips.slice(0, maxClips)) {
  const { samples } = decodeBankWav(toBuffer(await readFile(path.join(dir, c.file))), m.frontend.int16_scale)
  clips.push({ ...c, speech: c.samples, samples })
}

let failures = 0
const ids = Object.keys(m.configs).filter((id) => id.includes(only))
for (const id of ids) {
  const cfg = m.configs[id]
  let worst = 0, flips = 0, correct = 0
  const t0 = Date.now()
  for (let k = 0; k < clips.length; k++) {
    let samples = clips[k].samples
    if (cfg.noise_db !== null) {
      samples = addNoise(samples, clips[k].speech, await store.noise(k, cfg.noise_db), cfg.noise_db)
    }
    const r = await runConfig(store, id, samples, { keepDisplay: false })
    const ref = cfg.demo.logits[k]
    let refTop = 0
    for (let c = 0; c < ref.length; c++) {
      worst = Math.max(worst, Math.abs(r.logits[c] - ref[c]))
      if (ref[c] > ref[refTop]) refTop = c
    }
    if (refTop !== r.predicted) flips++
    if (r.predicted === clips[k].digit) correct++
  }
  const ok = flips === 0 && worst < TOL
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${id.padEnd(64)} max |dscore| ${worst.toExponential(2)}  flips ${flips}  ` +
    `${correct}/${clips.length} right  ${((Date.now() - t0) / clips.length).toFixed(0)} ms/clip`)
}
console.log(failures ? `${failures} of ${ids.length} configs disagree` : `all ${ids.length} configs agree`)
process.exit(failures ? 1 : 0)
