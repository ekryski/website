#!/usr/bin/env node
/**
 * Generates project logos for the waffle house org, in its house style:
 * 80s-neon cyberpunk on near-black, drawn as SVG and rasterized with sharp.
 *
 *   src/images/projects/iron.png    a waffle iron, plates glowing
 *   src/images/projects/butter.png  a pat of butter melting on a waffle
 *
 * They are shown at 48px in the projects list, so the rule for both is: one
 * bold silhouette, two neon accents, nothing that turns to mush when small.
 */

const sharp = require('sharp')
const { join } = require('path')
const { mkdirSync } = require('fs')

const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'src', 'images', 'projects')
const SIZE = 512

const MAGENTA = '#ff2fa0'
const CYAN = '#22e0ff'
const BUTTER = '#ffd45e'
const BUTTER_DEEP = '#f59e0b'

/** Shared scaffolding: dark round field, neon glow filters, synthwave horizon. */
function frame(inner, { glowA = MAGENTA, glowB = CYAN } = {}) {
  return `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="#2a1040"/>
      <stop offset="55%" stop-color="#140a24"/>
      <stop offset="100%" stop-color="#08060f"/>
    </radialGradient>
    <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${glowA}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${glowB}" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="9" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="18" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="round"><circle cx="256" cy="256" r="256"/></clipPath>
  </defs>

  <g clip-path="url(#round)">
    <rect width="512" height="512" fill="url(#bg)"/>
    <!-- horizon: the one unmistakably 80s cue, kept low so it never fights the mark -->
    <g opacity="0.55">
      ${Array.from({ length: 7 }, (_, i) => {
        const y = 430 + i * i * 3.2
        return `<line x1="0" y1="${y}" x2="512" y2="${y}" stroke="${CYAN}" stroke-width="${(2.4 - i * 0.28).toFixed(2)}" opacity="${(0.5 - i * 0.06).toFixed(2)}"/>`
      }).join('')}
      ${Array.from({ length: 11 }, (_, i) => {
        const x = 256 + (i - 5) * 96
        return `<line x1="${x}" y1="512" x2="${256 + (i - 5) * 22}" y2="430" stroke="${MAGENTA}" stroke-width="1.6" opacity="0.30"/>`
      }).join('')}
    </g>
    <rect width="512" height="512" fill="url(#scan)" opacity="0.35"/>
    ${inner}
    <circle cx="256" cy="256" r="250" fill="none" stroke="${glowA}" stroke-width="6" opacity="0.55"/>
  </g>
</svg>`
}

/** A waffle grid: the shared motif, drawn as glowing neon cells. */
function waffleGrid({ x, y, w, h, cells, color, weight = 5, opacity = 0.95 }) {
  const step = w / cells
  const lines = []
  for (let i = 1; i < cells; i++) {
    lines.push(
      `<line x1="${x + i * step}" y1="${y}" x2="${x + i * step}" y2="${y + h}" stroke="${color}" stroke-width="${weight}" opacity="${opacity}"/>`,
    )
    const stepY = h / cells
    lines.push(
      `<line x1="${x}" y1="${y + i * stepY}" x2="${x + w}" y2="${y + i * stepY}" stroke="${color}" stroke-width="${weight}" opacity="${opacity}"/>`,
    )
  }
  return lines.join('')
}

/** Iron: a waffle iron cracked open, its plates lit from inside. */
function ironArt() {
  return `
  <g filter="url(#softGlow)" opacity="0.85">
    <ellipse cx="256" cy="300" rx="150" ry="40" fill="${MAGENTA}" opacity="0.35"/>
  </g>
  <g filter="url(#glow)">
    <!-- lower plate -->
    <rect x="112" y="268" width="288" height="86" rx="20" fill="#170d22" stroke="${CYAN}" stroke-width="7"/>
    ${waffleGrid({ x: 128, y: 282, w: 256, h: 58, cells: 4, color: CYAN, weight: 4, opacity: 0.75 })}
    <!-- upper plate, hinged open -->
    <g transform="rotate(-14 132 250)">
      <rect x="112" y="164" width="288" height="86" rx="20" fill="#170d22" stroke="${MAGENTA}" stroke-width="7"/>
      ${waffleGrid({ x: 128, y: 178, w: 256, h: 58, cells: 4, color: MAGENTA, weight: 4, opacity: 0.8 })}
    </g>
    <!-- hinge + handle -->
    <circle cx="120" cy="258" r="16" fill="#170d22" stroke="${CYAN}" stroke-width="7"/>
    <path d="M400 300 h44 a16 16 0 0 1 0 32 h-44" fill="none" stroke="${CYAN}" stroke-width="7" stroke-linecap="round"/>
  </g>`
}

/** Butter: a pat sliding off a waffle, mid-melt. */
function butterArt() {
  return `
  <g filter="url(#softGlow)" opacity="0.8">
    <ellipse cx="256" cy="330" rx="140" ry="44" fill="${BUTTER_DEEP}" opacity="0.35"/>
  </g>
  <g filter="url(#glow)">
    <!-- the waffle, in perspective -->
    <path d="M120 296 L392 296 L352 386 L160 386 Z" fill="#170d22" stroke="${CYAN}" stroke-width="7" stroke-linejoin="round"/>
    <g opacity="0.7" stroke="${CYAN}" stroke-width="4">
      <line x1="188" y1="296" x2="176" y2="386"/>
      <line x1="256" y1="296" x2="256" y2="386"/>
      <line x1="324" y1="296" x2="336" y2="386"/>
      <line x1="134" y1="326" x2="378" y2="326"/>
      <line x1="147" y1="356" x2="365" y2="356"/>
    </g>
    <!-- melt running off the near edge -->
    <path d="M206 296 q-8 44 6 66 q10 16 26 8 q-14-30 -6-74 Z" fill="${BUTTER}" opacity="0.9"/>
    <path d="M300 296 q10 40 -2 60" fill="none" stroke="${BUTTER}" stroke-width="8" stroke-linecap="round" opacity="0.85"/>
    <!-- the pat itself -->
    <g transform="translate(0 26) rotate(-8 256 220)">
      <path d="M176 236 L236 176 L336 176 L276 236 Z" fill="${BUTTER}" stroke="#fff3c4" stroke-width="5" stroke-linejoin="round"/>
      <path d="M276 236 L336 176 L336 236 L276 296 Z" fill="${BUTTER_DEEP}" stroke="#fff3c4" stroke-width="5" stroke-linejoin="round"/>
      <path d="M176 236 L276 236 L276 296 L176 296 Z" fill="#ffe9a3" stroke="#fff3c4" stroke-width="5" stroke-linejoin="round"/>
    </g>
  </g>`
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const jobs = [
    ['iron.png', frame(ironArt(), { glowA: MAGENTA, glowB: CYAN })],
    ['butter.png', frame(butterArt(), { glowA: MAGENTA, glowB: CYAN })],  // same ring as iron: one family
  ]
  for (const [name, svg] of jobs) {
    await sharp(Buffer.from(svg)).png().toFile(join(OUT_DIR, name))
    console.log(`wrote ${join(OUT_DIR, name)}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
