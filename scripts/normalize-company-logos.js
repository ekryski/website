#!/usr/bin/env node
/**
 * Normalizes company logos from planning/resources to PNG format at 56x56.
 * Creates copies in src/images/companies/
 */

const sharp = require('sharp')
const { mkdir } = require('fs/promises')
const { join } = require('path')

const ROOT = join(__dirname, '..')
const SRC_DIR = join(ROOT, 'planning', 'resources')
const OUT_DIR = join(ROOT, 'src', 'images', 'companies')

const COMPANY_LOGOS = [
  { file: 'bidali_logo.jpeg', out: 'bidali.png', company: 'Bidali' },
  { file: 'bullish-ventures-logo.jpeg', out: 'bullish-ventures.png', company: 'Bullish Ventures' },
  { file: 'calgary-scientific-logo.avif', out: 'calgary-scientific.png', company: 'Calgary Scientific Inc' },
  { file: 'canadian-blockchain-consortium-logo.jpeg', out: 'canadian-blockchain-consortium.png', company: 'Canadian Blockchain Consortium' },
  { file: 'kissmetrics-logo.jpeg', out: 'kissmetrics.png', company: 'KISSmetrics' },
  { file: 'my-mobile-coverage-logo.jpeg', out: 'my-mobile-coverage.png', company: 'MyMobileCoverage' },
  { file: 'petro-feed-logo.avif', out: 'petro-feed.png', company: 'PetroFeed' },
]

const SIZE = 56

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const { file, out, company } of COMPANY_LOGOS) {
    const srcPath = join(SRC_DIR, file)
    const outPath = join(OUT_DIR, out)
    try {
      await sharp(srcPath)
        .resize(SIZE, SIZE)
        .png()
        .toFile(outPath)
      console.log(`✓ ${company}: ${out}`)
    } catch (err) {
      console.error(`✗ ${company} (${file}):`, err.message)
    }
  }
}

main()
