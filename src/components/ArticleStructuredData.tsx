import { authorRef, siteUrl } from '@/components/StructuredData'

/**
 * BlogPosting + BreadcrumbList for a single article.
 *
 * The author is a reference to the Person in the root layout's graph rather
 * than a second copy of it, so every article reinforces one entity. Breadcrumbs
 * spell out the Home > Articles > piece hierarchy that the URL only implies.
 */
export function ArticleStructuredData({
  title,
  description,
  date,
  path,
  image = '/og-image.png',
}: {
  title: string
  description: string
  date: string
  /** Site-relative path, e.g. /articles/how-a-machine-hears-a-number */
  path: string
  image?: string
}) {
  const url = `${siteUrl}${path}`
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'BlogPosting',
              headline: title,
              description,
              datePublished: date,
              dateModified: date,
              url,
              mainEntityOfPage: { '@type': 'WebPage', '@id': url },
              image: [`${siteUrl}${image}`],
              author: authorRef,
              publisher: authorRef,
              inLanguage: 'en',
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Articles',
                  item: `${siteUrl}/articles`,
                },
                { '@type': 'ListItem', position: 3, name: title, item: url },
              ],
            },
          ],
        }),
      }}
    />
  )
}
