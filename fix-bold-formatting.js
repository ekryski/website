#!/usr/bin/env node
/**
 * Fix incorrect markdown bold formatting across all article MDX files.
 * Handles:
 * 1. Trailing space inside bold: **text ** -> **text**
 * 2. Leading space inside bold: ** text** -> **text**
 * 3. Both: ** text ** -> **text**
 * 4. Inside links: [**text **](url) -> [**text**](url)
 * 5. Bold followed by word without space: **text**Word -> **text** Word
 * 6. Word followed by bold without space: word**text** -> word **text**
 */

const fs = require('fs')
const path = require('path')
const { globSync } = require('fast-glob')

const articlesDir = path.join(__dirname, 'src/app/articles')
const mdxFiles = globSync('**/page.mdx', { cwd: articlesDir })

function fixBoldFormatting(content) {
  let result = content
  let prev
  let iterations = 0
  const maxIterations = 10

  // Run until no more changes (handles overlapping/cascading fixes)
  // Order: space fixes first, then normalize spaces (step 1) last to clean up any introduced
  do {
    prev = result

    // 1. Add space after bold when followed by letter/digit: **text**Word -> **text** Word
    result = result.replace(/\*\*([^*\n]+?)\*\*([a-zA-Z0-9\u00C0-\u024F])/g, (_, c1, c2) => `**${c1.trim()}** ${c2}`)

    // 2. Add space before bold when preceded by letter/digit: word**text** -> word **text**
    result = result.replace(/([a-zA-Z0-9\u00C0-\u024F])\*\*([^*\n]+?)\*\*/g, (_, c1, c2) => `${c1} **${c2.trim()}**`)

    // 3. Normalize spaces inside bold: trim leading/trailing (run last to clean up)
    result = result.replace(/\*\*\s*([^*]+?)\s*\*\*/g, (_, c) => '**' + c.trim() + '**')
  } while (result !== prev && ++iterations < maxIterations)

  return result
}

let totalFixed = 0
for (const relPath of mdxFiles) {
  const filePath = path.join(articlesDir, relPath)
  const original = fs.readFileSync(filePath, 'utf8')
  const fixed = fixBoldFormatting(original)
  if (original !== fixed) {
    fs.writeFileSync(filePath, fixed, 'utf8')
    totalFixed++
    console.log('Fixed:', relPath)
  }
}

console.log(`\nDone. Fixed ${totalFixed} files.`)
