#!/usr/bin/env node
/**
 * Normalizes project logos to PNG format at 56x56 for web.
 * Output: src/images/projects/
 */

const sharp = require('sharp')
const { mkdir, writeFile } = require('fs/promises')
const { join } = require('path')
const https = require('https')

const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'src', 'images', 'projects')
const SIZE = 56

const PROJECT_LOGOS = [
  {
    src: join(ROOT, 'planning', 'resources', 'deliciousdb-logo.png'),
    out: 'deliciousdb.png',
    project: 'DeliciousDB',
  },
  {
    src: '/Users/eric/Development/personal/sam/Sam/Sam/Resources/Assets.xcassets/AppIcon.appiconset/icon_512x512.png',
    out: 'sam.png',
    project: 'Sam',
  },
  {
    url: 'https://avatars.githubusercontent.com/u/32400533?v=4',
    out: 'feathersjs.png',
    project: 'FeathersJS',
  },
  {
    src: join(ROOT, 'planning', 'resources', 'caress-finger.svg'),
    out: 'caress.png',
    project: 'Caress',
  },
]

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const item of PROJECT_LOGOS) {
    const outPath = join(OUT_DIR, item.out)
    try {
      let input
      if (item.url) {
        input = await fetchUrl(item.url)
      } else {
        input = item.src
      }
      await sharp(input).resize(SIZE, SIZE).png().toFile(outPath)
      console.log(`✓ ${item.project}: ${item.out}`)
    } catch (err) {
      console.error(`✗ ${item.project}:`, err.message)
    }
  }
}

main()
