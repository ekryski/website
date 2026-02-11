#!/usr/bin/env node

/**
 * Build-time script to generate public/feed.xml from article metadata.
 * Replaces the dynamic feed.xml route for static export compatibility.
 */

const fs = require('fs')
const path = require('path')
const { Feed } = require('feed')

require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
if (!siteUrl) {
  console.error('Error: NEXT_PUBLIC_SITE_URL is required. Set it in .env.local or as an environment variable.')
  process.exit(1)
}

const articlesDir = path.join(process.cwd(), 'src', 'app', 'articles')

function extractArticleFromMdx(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const title = content.match(/title:\s*['"]([^'"]*)['"]/)?.[1]
  const date = content.match(/date:\s*['"]([^'"]*)['"]/)?.[1]
  const author = content.match(/author:\s*['"]([^'"]*)['"]/)?.[1]
  const publishedMatch = content.match(/published:\s*(true|false)/)
  const published = publishedMatch ? publishedMatch[1] === 'true' : false
  const descriptionMatch = content.match(
    /description:\s*['"]([\s\S]*?)['"]\s*[,}]/m,
  )
  const description = descriptionMatch
    ? descriptionMatch[1].trim().replace(/\s+/g, ' ')
    : ''

  if (!title || !date) return null
  return { title, date, author: author || 'Eric Kryski', description, published }
}

function getArticleSlug(filePath) {
  const relative = path.relative(articlesDir, filePath)
  return path.dirname(relative)
}

const articleFiles = fs
  .readdirSync(articlesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(articlesDir, d.name, 'page.mdx'))
  .filter((p) => fs.existsSync(p))

const articles = articleFiles
  .map((filePath) => {
    const article = extractArticleFromMdx(filePath)
    if (!article) return null
    return {
      ...article,
      slug: getArticleSlug(filePath),
    }
  })
  .filter(Boolean)
  .filter((a) => a.published === true)
  .sort((a, b) => new Date(b.date) - new Date(a.date))

const feed = new Feed({
  title: 'Eric Kryski',
  description:
    "Read Eric Kryski's musings on design, development, finance and entrepreneurship",
  author: {
    name: 'Eric Kryski',
    email: 'hello@erickryski.com',
  },
  id: siteUrl,
  link: siteUrl,
  image: `${siteUrl}/favicon.ico`,
  favicon: `${siteUrl}/favicon.ico`,
  copyright: `All rights reserved ${new Date().getFullYear()}`,
  feedLinks: {
    rss2: `${siteUrl}/feed.xml`,
  },
})

for (const article of articles) {
  const publicUrl = `${siteUrl}/articles/${article.slug}`
  feed.addItem({
    title: article.title,
    id: publicUrl,
    link: publicUrl,
    description: article.description,
    content: article.description,
    author: [{ name: article.author, email: 'hello@erickryski.com' }],
    date: new Date(article.date),
  })
}

const outputPath = path.join(process.cwd(), 'public', 'feed.xml')
fs.writeFileSync(outputPath, feed.rss2(), 'utf-8')
console.log(`Generated ${outputPath} with ${articles.length} articles`)
