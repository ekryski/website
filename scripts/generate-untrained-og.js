#!/usr/bin/env node
/**
 * Generates the social card for the paper 02 post:
 *
 *   public/untrained/og.png   1200x630
 *
 * The post's question in one frame: the same 16 x 16 lattice of oscillators
 * twice, once coupled (neighbours pull each other into a travelling wave) and
 * once uncoupled (every oscillator keeps its own time, so the phases scatter).
 * Hue is phase, the cyclic colour map the live figures use. The phases are
 * drawn, not simulated: this is an illustration, and it says so nowhere else.
 */

const sharp = require('sharp')
const { join } = require('path')
const { mkdirSync } = require('fs')

const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'public', 'untrained', 'og.png')
const W = 1200
const H = 630
const G = 16
const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"

function phaseColor(theta) {
  const hue = ((((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI)) * 360
  return `hsl(${hue.toFixed(1)}, 78%, 58%)`
}

/** A deterministic scatter, so the card is the same on every build. */
function scatter(i) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return (x - Math.floor(x)) * 2 * Math.PI
}

function lattice(x0, y0, size, phase) {
  const cell = size / G, gap = 3
  const out = []
  for (let r = 0; r < G; r++) {
    for (let c = 0; c < G; c++) {
      const x = x0 + c * cell, y = y0 + (G - 1 - r) * cell
      out.push(`<rect x="${(x + gap / 2).toFixed(1)}" y="${(y + gap / 2).toFixed(1)}" width="${(cell - gap).toFixed(1)}" ` +
        `height="${(cell - gap).toFixed(1)}" rx="3" fill="${phaseColor(phase(r, c))}"/>`)
    }
  }
  return out.join('')
}

const size = 280
const top = 205
const left = 536
const gap = 44
const coupled = lattice(left, top, size, (r, c) => 0.55 * c + 0.3 * r + 0.25 * Math.sin(r * 0.7))
const uncoupled = lattice(left + size + gap, top, size, (r, c) => scatter(r * G + c))

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#0b0d12"/>
  <text x="72" y="118" font-family="${MONO}" font-size="19" letter-spacing="4" fill="#a78bfa">PROJECT RESONANT · PAPER 02</text>
  <text x="72" y="222" font-family="${FONT}" font-size="60" font-weight="800" fill="#ffffff">Does the</text>
  <text x="72" y="292" font-family="${FONT}" font-size="60" font-weight="800" fill="#ffffff">physics do</text>
  <text x="72" y="362" font-family="${FONT}" font-size="60" font-weight="800" fill="#ffffff">the work?</text>
  <text x="74" y="440" font-family="${MONO}" font-size="21" fill="#8d96ab">1,024 untrained oscillators,</text>
  <text x="74" y="472" font-family="${MONO}" font-size="21" fill="#8d96ab">ten models, one readout,</text>
  <text x="74" y="504" font-family="${MONO}" font-size="21" fill="#8d96ab">live in your browser</text>
  ${coupled}
  ${uncoupled}
  <text x="${left + size / 2}" y="${top - 22}" text-anchor="middle" font-family="${MONO}" font-size="18" letter-spacing="3" fill="#7cc4ff">COUPLED</text>
  <text x="${left + size + gap + size / 2}" y="${top - 22}" text-anchor="middle" font-family="${MONO}" font-size="18" letter-spacing="3" fill="#7cc4ff">UNCOUPLED</text>
  <text x="${left + size + gap / 2}" y="${top + size + 48}" text-anchor="middle" font-family="${MONO}" font-size="17" fill="#8d96ab">the same 256 oscillators · hue = phase</text>
</svg>`

mkdirSync(join(ROOT, 'public', 'untrained'), { recursive: true })
sharp(Buffer.from(svg))
  .png()
  .toFile(OUT)
  .then(() => console.log(`wrote ${OUT}`))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
