import { type Metadata } from 'next'

/**
 * Shared page and article metadata.
 *
 * The reason this exists: Next.js does NOT deep-merge `openGraph` or
 * `twitter`. A page that declares either one replaces the root layout's copy
 * wholesale — including its `images` — so any page that sets an Open Graph
 * title without restating the image ships a share card with no picture on it.
 * Every page and article therefore goes through here.
 */

const BRAND = 'Eric Kryski'
const DEFAULT_IMAGE = '/og-image.png'
const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630

interface ArticleMeta {
  title: string
  description: string
  date: string
  author?: string
  published?: boolean
}

interface ImageOptions {
  /** Path to a custom share image, 1200×630. Defaults to the site card. */
  image?: string
  imageAlt?: string
}

function shareImages(image: string, alt: string) {
  return {
    openGraph: [{ url: image, width: IMAGE_WIDTH, height: IMAGE_HEIGHT, alt }],
    twitter: [image],
  }
}

/** Metadata for a standard (non-article) page. */
export function pageMetadata({
  title,
  description,
  url,
  image = DEFAULT_IMAGE,
  imageAlt = BRAND,
}: {
  title: string
  description: string
  url: string
} & ImageOptions): Metadata {
  const images = shareImages(image, imageAlt)
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title: `${title} - ${BRAND}`,
      description,
      url,
      images: images.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - ${BRAND}`,
      description,
      images: images.twitter,
    },
    alternates: { canonical: url },
  }
}

/**
 * Metadata for an article, derived from the same `article` object the page and
 * the index render — including `published`, so a draft is noindexed by the one
 * flag rather than by a second one kept in step by hand.
 */
export function articleMetadata(
  article: ArticleMeta,
  slug: string,
  { image = DEFAULT_IMAGE, imageAlt = article.title }: ImageOptions = {},
): Metadata {
  const url = `/articles/${slug}`
  const images = shareImages(image, imageAlt)
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url,
      publishedTime: article.date,
      authors: [article.author ?? BRAND],
      images: images.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: images.twitter,
    },
    alternates: { canonical: url },
    ...(article.published === false
      ? { robots: { index: false, follow: false } }
      : {}),
  }
}
