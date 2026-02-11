#!/usr/bin/env node
/**
 * Generates og-image.png (1200x630) for social sharing.
 * Layout: bold intro text on left (vertically centered), portrait on right.
 * Matches the About page aesthetic without paragraph text.
 */

const sharp = require('sharp')
const { join } = require('path')

const ROOT = join(__dirname, '..')
const PORTRAIT = join(ROOT, 'src', 'images', 'portrait.png')
const OUT = join(ROOT, 'public', 'og-image.png')

const WIDTH = 1200
const HEIGHT = 630
const PORTRAIT_SIZE = 480
const TEXT_LEFT = 80
const PORTRAIT_LEFT = 620
const PORTRAIT_TOP = 75

async function main() {
  // Portrait: square, rounded corners, slight rotation (3°)
  const portraitBuffer = await sharp(PORTRAIT)
    .resize(PORTRAIT_SIZE, PORTRAIT_SIZE, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer()

  // Text SVG - bold intro, vertically centered to align with portrait height
  // 4 lines ~52px each = 208px total, center at 315 so first line at 211
  const lineHeight = 52
  const textBlockHeight = 4 * lineHeight
  const textStartY = HEIGHT / 2 - textBlockHeight / 2 + lineHeight / 2

  const textSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${TEXT_LEFT}"
        y="${textStartY}"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="42"
        font-weight="700"
        fill="#27272a"
      >
        <tspan x="${TEXT_LEFT}" dy="0">I'm Eric Kryski. I live in</tspan>
        <tspan x="${TEXT_LEFT}" dy="${lineHeight}">Calgary, Canada 🇨🇦</tspan>
        <tspan x="${TEXT_LEFT}" dy="${lineHeight}">where I design, build</tspan>
        <tspan x="${TEXT_LEFT}" dy="${lineHeight}">and invest in the future.</tspan>
      </text>
    </svg>
  `

  const textBuffer = await sharp(Buffer.from(textSvg))
    .png()
    .toBuffer()

  // White background
  const background = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toBuffer()

  // Portrait with rounded corners - use a mask
  const { width: pw, height: ph } = await sharp(portraitBuffer).metadata()
  const roundedMask = Buffer.from(`
    <svg width="${pw}" height="${ph}">
      <rect x="0" y="0" width="${pw}" height="${ph}" rx="24" ry="24" fill="white"/>
    </svg>
  `)
  const portraitMasked = await sharp(portraitBuffer)
    .composite([{ input: roundedMask, blend: 'dest-in' }])
    .rotate(3)
    .png()
    .toBuffer()

  // Composite: background + portrait (right) + text (left)
  await sharp(background)
    .composite([
      {
        input: portraitMasked,
        left: PORTRAIT_LEFT,
        top: PORTRAIT_TOP,
      },
      {
        input: textBuffer,
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toFile(OUT)

  console.log('✓ Generated public/og-image.png (1200x630)')
}

main().catch(console.error)
