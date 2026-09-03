#!/usr/bin/env node

/**
 * Build-time script to generate public/llms.txt.
 *
 * llms.txt is a plain-markdown map of the site for language models and agents:
 * what is here, at which URL, described in one line. It is generated from the
 * same article frontmatter the pages, sitemap and feed read, so it cannot drift
 * out of date the way a hand-written index would.
 */

const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erickryski.com'
const articlesDir = path.join(process.cwd(), 'src', 'app', 'articles')

/** The fixed pages, in the order a reader should meet them. */
const PAGES = [
  ['About', '/about', 'Who I am, what I have built, and what I am working on now.'],
  ['Articles', '/articles', 'Every essay, newest first.'],
  ['Projects', '/projects', 'Products and open source I have built, past and present.'],
  [
    'Resonant',
    '/projects/resonant',
    'Research project testing whether speech models can be built on coupled-oscillator physics instead of attention.',
  ],
  ['Speaking', '/speaking', 'Conference talks and podcast appearances.'],
  ['Tools', '/tools', 'The hardware and software I actually use.'],
  ['CV', '/cv', 'Full curriculum vitae.'],
]

function readArticle(dir) {
  const file = path.join(articlesDir, dir, 'page.mdx')
  if (!fs.existsSync(file)) return null
  const content = fs.readFileSync(file, 'utf-8')
  const title = content.match(/title:\s*['"]([^'"]*)['"]/)?.[1]
  const date = content.match(/date:\s*['"]([^'"]*)['"]/)?.[1]
  const published = content.match(/published:\s*(true|false)/)?.[1] === 'true'
  const description = content
    .match(/description:\s*['"]([\s\S]*?)['"]\s*[,}]/m)?.[1]
    ?.trim()
    .replace(/\s+/g, ' ')
    // the source is a JS string literal: drop its escaping
    .replace(/\\(['"])/g, '$1')
  if (!title || !date || !published) return null
  return { slug: dir, title, date, description: description || '' }
}

const articles = fs
  .readdirSync(articlesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => readArticle(entry.name))
  .filter(Boolean)
  .sort((a, z) => +new Date(z.date) - +new Date(a.date))

const lines = [
  '# Eric Kryski',
  '',
  '> Software designer and entrepreneur in Calgary, Canada. Co-founder and CEO of Bidali, building at the intersection of money and intelligence, and researching oscillator-based speech models.',
  '',
  'Writing on distributed computing, payments, startups, economics and AI. Everything below is a page on this site; the full text of each article lives at its URL.',
  '',
  '## Pages',
  '',
  ...PAGES.map(([name, url, blurb]) => `- [${name}](${siteUrl}${url}): ${blurb}`),
  '',
  '## Articles',
  '',
  ...articles.map(
    (article) =>
      `- [${article.title}](${siteUrl}/articles/${article.slug}) (${article.date}): ${article.description}`,
  ),
  '',
  '## Optional',
  '',
  `- [RSS feed](${siteUrl}/feed.xml): every article, as XML.`,
  `- [Sitemap](${siteUrl}/sitemap.xml): every indexable URL.`,
  '',
]

fs.writeFileSync(path.join(process.cwd(), 'public', 'llms.txt'), lines.join('\n'))
console.log(`Generated public/llms.txt (${articles.length} articles)`)
