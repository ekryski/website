#!/usr/bin/env node
/**
 * Generates the share card and project logo for /projects/resonant.
 *
 *   public/resonant/og.png            1200x630 social card
 *   src/images/projects/resonant.png  256x256 project-list logo
 *
 * The picture is the guide's argument in one frame: a spoken waveform enters
 * from the left, ripples outward through a lattice of phase oscillators (hue =
 * phase, the same cyclic colour map the live figures use), and resolves into a
 * digit on the right. Sound in, motion through the substrate, an answer out.
 */

const sharp = require('sharp')
const { join } = require('path')
const { mkdirSync } = require('fs')

const ROOT = join(__dirname, '..')
const OG_OUT = join(ROOT, 'public', 'resonant', 'og.png')
const LOGO_OUT = join(ROOT, 'src', 'images', 'projects', 'resonant.png')

const W = 1200
const H = 630
const FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif"
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"

/** The guide's cyclic phase colour map (hue rides the phase). */
function phaseColor(theta, light = 58) {
  const hue = (((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * 360
  return `hsl(${hue.toFixed(1)}, 78%, ${light}%)`
}

/**
 * The oscillator lattice: a dot grid whose phase is set by distance from the
 * ripple source, so the field visibly carries a travelling wave.
 */
function lattice({ x0, y0, cols, rows, step, sourceX, sourceY, wavelength }) {
  const dots = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * step
      const y = y0 + r * step
      const d = Math.hypot(x - sourceX, y - sourceY)
      const phase = (d / wavelength) * 2 * Math.PI
      // amplitude falls off with distance — the ripple is spending itself
      const fade = Math.max(0.12, 1 - d / 760)
      const radius = 3.2 + 2.6 * Math.max(0, Math.cos(phase)) * fade
      dots.push(
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(2)}" ` +
          `fill="${phaseColor(phase)}" opacity="${(0.22 + 0.62 * fade).toFixed(3)}"/>`,
      )
    }
  }
  return dots.join('')
}

/** Expanding wavefronts, drawn as thin arcs through the lattice. */
function ripples({ cx, cy, count, spacing }) {
  const rings = []
  for (let i = 1; i <= count; i++) {
    const r = i * spacing
    rings.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${phaseColor(i * 1.1, 66)}" ` +
        `stroke-width="${(2.4 - i * 0.16).toFixed(2)}" opacity="${(0.5 - i * 0.035).toFixed(3)}"/>`,
    )
  }
  return rings.join('')
}

/** The spoken waveform entering from the left edge. */
function waveform({ x0, y0, width, height, samples }) {
  const pts = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    // a syllable-shaped envelope on a fast carrier — reads as speech, not a sine
    const env = Math.exp(-Math.pow((t - 0.55) * 2.6, 2)) * (0.55 + 0.45 * Math.sin(t * 34))
    const y = y0 + Math.sin(t * 96) * env * height * 0.5
    pts.push(`${(x0 + t * width).toFixed(1)},${y.toFixed(1)}`)
  }
  return `<polyline points="${pts.join(' ')}" fill="none" stroke="#7cc4ff" stroke-width="2.4" opacity="0.95"/>`
}

function card({ width, height, compact }) {
  const cx = compact ? width * 0.5 : 560
  const cy = height * 0.5
  const step = compact ? 18 : 30

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="${(cx / width) * 100}%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1b2440"/>
      <stop offset="100%" stop-color="#080a10"/>
    </radialGradient>
    <linearGradient id="fadeRight" x1="0" x2="1">
      <stop offset="0%" stop-color="#080a10" stop-opacity="0"/>
      <stop offset="70%" stop-color="#080a10" stop-opacity="0.92"/>
    </linearGradient>
    <clipPath id="frame"><rect width="${width}" height="${height}" rx="${compact ? 48 : 0}"/></clipPath>
  </defs>

  <g clip-path="url(#frame)">
    <rect width="${width}" height="${height}" fill="url(#glow)"/>
    ${lattice({
      x0: compact ? 14 : 150,
      y0: compact ? 14 : 60,
      cols: compact ? 14 : 34,
      rows: compact ? 14 : 18,
      step,
      sourceX: cx,
      sourceY: cy,
      wavelength: compact ? 46 : 78,
    })}
    ${ripples({ cx, cy, count: compact ? 4 : 7, spacing: compact ? 30 : 74 })}
    ${compact ? '' : waveform({ x0: -10, y0: cy, width: 250, height: 240, samples: 460 })}
    ${compact ? '' : `<rect x="${width - 420}" y="0" width="420" height="${height}" fill="url(#fadeRight)"/>`}
    ${compact
      ? ''
      : `
    <text x="40" y="${cy - 132}" font-family="${MONO}" font-size="19" letter-spacing="4"
          fill="#7cc4ff" opacity="0.92">SOUND IN</text>
    <text x="${width - 232}" y="${cy + 56}" font-family="${FONT}" font-size="196" font-weight="700"
          fill="#ffffff" text-anchor="middle">7</text>
    <text x="${width - 232}" y="${cy + 118}" font-family="${MONO}" font-size="19" letter-spacing="4"
          fill="#6ee7a8" opacity="0.92" text-anchor="middle">ANSWER OUT</text>

    <text x="72" y="${height - 92}" font-family="${FONT}" font-size="52" font-weight="700" fill="#ffffff">
      How a machine hears a number
    </text>
    <text x="74" y="${height - 48}" font-family="${MONO}" font-size="22" fill="#8d96ab">
      speech, Fourier, and a field of coupled oscillators
    </text>`}
  </g>
</svg>`
}

async function main() {
  mkdirSync(join(ROOT, 'public', 'resonant'), { recursive: true })
  mkdirSync(join(ROOT, 'src', 'images', 'projects'), { recursive: true })

  await sharp(Buffer.from(card({ width: W, height: H, compact: false })))
    .png()
    .toFile(OG_OUT)
  console.log(`wrote ${OG_OUT}`)

  await sharp(Buffer.from(card({ width: 256, height: 256, compact: true })))
    .png()
    .toFile(LOGO_OUT)
  console.log(`wrote ${LOGO_OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
