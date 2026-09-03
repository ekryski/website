import glob from 'fast-glob'

interface Article {
  title: string
  description: string
  author: string
  date: string
  published?: boolean
  featured?: boolean
}

export interface ArticleWithSlug extends Article {
  slug: string
}

async function importArticle(
  articleFilename: string,
): Promise<ArticleWithSlug> {
  const { article } = (await import(`@/app/articles/${articleFilename}`)) as {
    // Import article dynamically
    default: React.ComponentType
    article: Article
  }

  return {
    slug: articleFilename.replace(/(\/page)?\.mdx$/, ''),
    ...article,
  }
}

export async function getAllArticles() {
  const articleFilenames = await glob('*/page.mdx', {
    cwd: './src/app/articles',
  })

  const articles = await Promise.all(articleFilenames.map(importArticle))

  return articles
    .filter((a) => a.published !== false)
    .sort((a, z) => +new Date(z.date) - +new Date(a.date))
}

/**
 * The hand-picked set the home page leads with, newest first. Marked with
 * `featured: true` in an article's own frontmatter, so the choice lives with
 * the piece rather than in a list here.
 */
export async function getFeaturedArticles(limit?: number) {
  const featured = (await getAllArticles()).filter((article) => article.featured)
  return typeof limit === 'number' ? featured.slice(0, limit) : featured
}
