import { MetadataRoute } from 'next'

import { getAllArticles } from '@/lib/articles'
import { papers } from '@/lib/papers'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erickryski.com'
  const articles = await getAllArticles()

  const articleUrls = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: new Date(article.date),
  }))

  // lastmod only where the date is real: search engines stop trusting a lastmod
  // that changes on every build
  const newest = (dates: string[]) => new Date(Math.max(...dates.map((d) => +new Date(d))))
  const lastArticle = newest(articles.map((a) => a.date))
  const lastPaper = newest(papers.map((p) => p.date))

  const page = (path: string, lastModified?: Date) => ({
    url: `${siteUrl}${path}`,
    ...(lastModified ? { lastModified } : {}),
  })

  return [
    page('', lastArticle),
    page('/about'),
    page('/articles', lastArticle),
    page('/papers', lastPaper),
    page('/projects'),
    page('/projects/resonant'),
    page('/speaking'),
    page('/tools'),
    page('/cv'),
    ...articleUrls,
  ]
}
