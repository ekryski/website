#!/usr/bin/env node
/**
 * Optimizes home page photos for web: resizes to max 600px width, JPEG quality 80.
 * Source: planning/resources/
 * Output: src/images/photos/image-1.jpg through image-5.jpg
 * Add rotate: 90 for portrait photos that display sideways (rotates 90° clockwise).
 */

const sharp = require('sharp')
const { mkdir } = require('fs/promises')
const { join } = require('path')

const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'src', 'images', 'photos')
const MAX_WIDTH = 600
const QUALITY = 80

const PHOTOS = [
  { src: 'eric-hiking.jpeg', out: 'image-1.jpg', rotate: 90 },
  { src: 'eric-golf.jpeg', out: 'image-2.jpg' },
  { src: 'mountain.jpeg', out: 'image-3.jpg' },
  { src: 'eric-ray-dalio.jpeg', out: 'image-4.jpg', rotate: 90 },
  { src: 'eric-snowboarding.jpeg', out: 'image-5.jpg', rotate: 90 },
]

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const { src, out, rotate } of PHOTOS) {
    const srcPath = join(ROOT, 'planning', 'resources', src)
    const outPath = join(OUT_DIR, out)
    let pipeline = sharp(srcPath)
    if (rotate === 90) {
      pipeline = pipeline.rotate(90)
    }
    await pipeline
      .resize(MAX_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: QUALITY })
      .toFile(outPath)
    console.log(`✓ ${src} → ${out}${rotate === 90 ? ' (rotated 90° CW)' : ''}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
