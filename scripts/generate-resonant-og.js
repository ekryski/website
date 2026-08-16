#!/usr/bin/env node
/**
 * Generates the artwork for the Resonant guide and project page.
 *
 *   public/resonant/og.png            1200x630 social card
 *   public/resonant/field.png         the same art without the baked-in title
 *   public/resonant/stadium.png       the crowd-wave illustration (section 06)
 *   public/resonant/torus.png         the phase field on its torus (section 06)
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

function card({ width, height, compact, caption = true }) {
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

    ${caption
      ? `<text x="72" y="${height - 92}" font-family="${FONT}" font-size="52" font-weight="700" fill="#ffffff">
      How a machine hears a number
    </text>
    <text x="74" y="${height - 48}" font-family="${MONO}" font-size="22" fill="#8d96ab">
      speech, Fourier, and a field of coupled oscillators
    </text>`
      : ''}`}
  </g>
</svg>`
}

/**
 * The stadium crowd — the guide's running analogy, drawn rather than photographed.
 *
 * A bowl seen from outside the south-west corner, tilted down enough to show the
 * field and the far stands, with the roof open. Every seat is a dot, and the dot's
 * hue is that fan's phase, so the wave travelling around the bowl is literally the
 * phase field the article is about.
 */
function stadium({ width = 1200, height = 680 }) {
  const cx = width / 2
  const cy = height * 0.52
  const outerRx = width * 0.42
  const outerRy = outerRx * 0.42        // squash = the downward viewing angle
  const innerRx = outerRx * 0.55
  const innerRy = outerRy * 0.55
  const wallDepth = height * 0.13
  const waveCenter = Math.PI * 0.78     // the wave crest, currently at the near-left

  // Seating bowl: concentric rings that stay strictly between the pitch and the
  // rim. No vertical lift — the ellipses themselves supply the perspective, so
  // the far rows tuck under the far rim and the near rows sit against the near
  // one instead of floating over the grass or above the wall.
  const seats = []
  const rings = 10
  const seatInnerRx = innerRx * 1.09    // clear of the touchline
  const seatInnerRy = innerRy * 1.09
  const seatOuterRx = outerRx * 0.93    // inside the rim
  const seatOuterRy = outerRy * 0.93
  for (let r = 0; r < rings; r++) {
    const t = r / (rings - 1)
    const rx = seatInnerRx + (seatOuterRx - seatInnerRx) * t
    const ry = seatInnerRy + (seatOuterRy - seatInnerRy) * t
    const lift = 0
    const count = Math.round(84 + 76 * t)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * 2 * Math.PI
      const x = cx + rx * Math.cos(a)
      const y = cy + ry * Math.sin(a) - lift
      // the wave: a travelling band of raised arms, brightest at its crest
      let d = Math.abs(((a - waveCenter + Math.PI) % (2 * Math.PI)) - Math.PI)
      const crest = Math.max(0, 1 - d / 0.85)
      const hue = ((a / (2 * Math.PI)) * 360 + 200) % 360
      const raised = crest > 0.25
      const rad = (1.9 + 2.6 * crest) * (0.75 + 0.35 * t)
      const color = raised
        ? `hsl(${hue.toFixed(0)}, 85%, ${(58 + 20 * crest).toFixed(0)}%)`
        : `hsl(${hue.toFixed(0)}, 38%, ${(44 + 10 * t).toFixed(0)}%)`
      seats.push(
        `<circle cx="${x.toFixed(1)}" cy="${(y - crest * 2.5).toFixed(1)}" r="${rad.toFixed(2)}" fill="${color}" opacity="${(0.62 + 0.38 * crest).toFixed(2)}"/>`,
      )
    }
  }

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1024"/>
      <stop offset="60%" stop-color="#181231"/>
      <stop offset="100%" stop-color="#0a0a12"/>
    </linearGradient>
    <radialGradient id="pitch" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#1f6b46"/>
      <stop offset="100%" stop-color="#12472f"/>
    </radialGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#241a3a"/>
      <stop offset="100%" stop-color="#0e0a18"/>
    </linearGradient>
    <filter id="bowlGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#sky)"/>
  ${Array.from({ length: 70 }, (_, i) => {
    const x = (i * 137.5) % width
    const y = ((i * 61.8) % (height * 0.42))
    return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.7 + (i % 3) * 0.5).toFixed(1)}" fill="#cbd5ff" opacity="${(0.12 + (i % 5) * 0.05).toFixed(2)}"/>`
  }).join('')}

  <!-- light spill from the open roof -->
  <ellipse cx="${cx}" cy="${cy - 20}" rx="${outerRx * 0.95}" ry="${outerRy * 0.95}" fill="#5b6cff" opacity="0.18" filter="url(#bowlGlow)"/>

  <!-- outer wall: the near side of the bowl, seen from outside -->
  <path d="M ${cx - outerRx} ${cy} a ${outerRx} ${outerRy} 0 0 0 ${outerRx * 2} 0 l 0 ${wallDepth} a ${outerRx} ${outerRy} 0 0 1 ${-outerRx * 2} 0 Z" fill="url(#wall)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${outerRx}" ry="${outerRy}" fill="none" stroke="#3b2f5c" stroke-width="3"/>

  <!-- the field -->
  <ellipse cx="${cx}" cy="${cy + 6}" rx="${innerRx}" ry="${innerRy}" fill="url(#pitch)"/>
  <ellipse cx="${cx}" cy="${cy + 6}" rx="${innerRx * 0.98}" ry="${innerRy * 0.94}" fill="none" stroke="#d8f5e4" stroke-width="2" opacity="0.5"/>
  <line x1="${cx}" y1="${cy + 6 - innerRy * 0.94}" x2="${cx}" y2="${cy + 6 + innerRy * 0.94}" stroke="#d8f5e4" stroke-width="2" opacity="0.45"/>
  <ellipse cx="${cx}" cy="${cy + 6}" rx="${innerRx * 0.2}" ry="${innerRy * 0.2}" fill="none" stroke="#d8f5e4" stroke-width="2" opacity="0.45"/>

  <!-- floodlights: far rim only, so they read as standing behind the bowl -->
  ${[1.18, 1.38, 1.62, 1.82].map((f) => {
    const a = Math.PI * f
    const x = cx + outerRx * 0.99 * Math.cos(a)
    const y = cy + outerRy * 0.99 * Math.sin(a) - height * 0.075
    return `<g opacity="0.9"><line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${x.toFixed(0)}" y2="${(y - 52).toFixed(0)}" stroke="#4a3f6b" stroke-width="4"/><rect x="${(x - 17).toFixed(0)}" y="${(y - 68).toFixed(0)}" width="34" height="16" rx="4" fill="#fdf6d8"/><ellipse cx="${x.toFixed(0)}" cy="${(y - 52).toFixed(0)}" rx="46" ry="26" fill="#fdf6d8" opacity="0.10"/></g>`
  }).join('')}

  <!-- the crowd -->
  ${seats.join('')}
</svg>`
}

/**
 * The torus figure for "Why a torus": the same phase colours as the stadium
 * crowd, wrapped onto the surface the oscillators actually live on. Rows run
 * around the tube (frequency bands), columns around the ring, and both wrap.
 */
function torus({ width = 1200, height = 720 }) {
  const cx = width / 2
  const cy = height * 0.45
  const R = 1.0
  const r = 0.44
  const tilt = (62 * Math.PI) / 180
  // the torus spans (R + r) either side, so keep a margin at that half-width
  const scale = Math.min((width / 2 - 70) / (R + r), (height / 2 - 60) / 1.07)

  const uSteps = 84        // around the ring  (columns)
  const vSteps = 26        // around the tube  (rows = frequency bands)
  const dots = []
  for (let i = 0; i < uSteps; i++) {
    for (let j = 0; j < vSteps; j++) {
      const u = (i / uSteps) * 2 * Math.PI
      const v = (j / vSteps) * 2 * Math.PI
      const x = (R + r * Math.cos(v)) * Math.cos(u)
      const y0 = (R + r * Math.cos(v)) * Math.sin(u)
      const z0 = r * Math.sin(v)
      const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt)
      const depth = y0 * Math.sin(tilt) + z0 * Math.cos(tilt)
      // a travelling wave: phase advances around the ring and around the tube,
      // which is what a coupled field on a periodic grid actually looks like
      const phase = 3 * u + 2 * v
      const hue = ((((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI)) * 360
      const near = (depth + 1) / 2                     // 0 far, 1 near
      dots.push({
        x: cx + x * scale,
        y: cy + y * scale,
        depth,
        rad: 2.0 + 2.8 * near,
        color: `hsl(${hue.toFixed(0)}, 82%, ${(44 + 24 * near).toFixed(0)}%)`,
        opacity: (0.16 + 0.74 * near).toFixed(2),
      })
    }
  }
  dots.sort((a, b) => a.depth - b.depth)               // painter's algorithm

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1024"/>
      <stop offset="60%" stop-color="#171233"/>
      <stop offset="100%" stop-color="#0a0a12"/>
    </linearGradient>
    <filter id="tglow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="32"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#tsky)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${((R + r) * scale * 0.98).toFixed(0)}" ry="${((R + r) * scale * 0.5).toFixed(0)}" fill="#5b6cff" opacity="0.16" filter="url(#tglow)"/>
  ${dots.map((d) => `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${d.rad.toFixed(2)}" fill="${d.color}" opacity="${d.opacity}"/>`).join('')}
  <text x="${cx}" y="${height - 22}" text-anchor="middle" font-family="${MONO}" font-size="19" letter-spacing="2" fill="#8d96ab">every oscillator has the same neighbourhood — no edges, no corners</text>
</svg>`
}


async function main() {
  mkdirSync(join(ROOT, 'public', 'resonant'), { recursive: true })
  mkdirSync(join(ROOT, 'src', 'images', 'projects'), { recursive: true })

  await sharp(Buffer.from(card({ width: W, height: H, compact: false })))
    .png()
    .toFile(OG_OUT)
  console.log(`wrote ${OG_OUT}`)

  // same artwork without the baked-in title, for pages that supply their own
  await sharp(Buffer.from(card({ width: W, height: H, compact: false, caption: false })))
    .png()
    .toFile(join(ROOT, 'public', 'resonant', 'field.png'))
  console.log(`wrote ${join(ROOT, 'public', 'resonant', 'field.png')}`)

  await sharp(Buffer.from(stadium({})))
    .png()
    .toFile(join(ROOT, 'public', 'resonant', 'stadium.png'))
  console.log(`wrote ${join(ROOT, 'public', 'resonant', 'stadium.png')}`)

  await sharp(Buffer.from(torus({})))
    .png()
    .toFile(join(ROOT, 'public', 'resonant', 'torus.png'))
  console.log(`wrote ${join(ROOT, 'public', 'resonant', 'torus.png')}`)

  await sharp(Buffer.from(card({ width: 256, height: 256, compact: true })))
    .png()
    .toFile(LOGO_OUT)
  console.log(`wrote ${LOGO_OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
