import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { PapersProfileLinks } from '@/components/PapersProfileLinks'
import { SimpleLayout } from '@/components/SimpleLayout'
import { authorRef, siteUrl } from '@/components/StructuredData'
import { pageMetadata } from '@/lib/metadata'
import { type Paper, papers } from '@/lib/papers'

function PaperEntry({ paper }: { paper: Paper }) {
  return (
    <Card as="article">
      <Card.Title as="h2" href={paper.href}>
        {paper.title}
      </Card.Title>
      <Card.Eyebrow decorate>{paper.venue}</Card.Eyebrow>
      <p className="relative z-10 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {paper.authors}
      </p>
      <Card.Description>{paper.description}</Card.Description>
      <Card.Cta>{paper.cta}</Card.Cta>
    </Card>
  )
}

/** The list as scholarly articles, so search engines and assistants can cite each one. */
function PapersStructuredData({ papers }: { papers: Paper[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/research`,
    url: `${siteUrl}/research`,
    name: 'Research',
    author: authorRef,
    hasPart: papers.map((paper) => ({
      '@type': 'ScholarlyArticle',
      name: paper.title,
      abstract: paper.description,
      datePublished: paper.date,
      url: paper.href,
      author: paper.authors
        .split(', ')
        .map((name) => (name === 'Eric Kryski' ? authorRef : { '@type': 'Person', name })),
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export const metadata: Metadata = pageMetadata({
  title: 'Research',
  description:
    "Papers I've published, from human-robot interaction research as an undergrad to research on oscillator networks in machine learning.",
  url: '/research',
})

export default function Papers() {
  const sortedPapers = [...papers].sort(
    (a, z) => +new Date(z.date) - +new Date(a.date),
  )

  return (
    <SimpleLayout
      title="Papers I've published."
      intro="Research I've put into writing, from undergrad human-robot interaction work to more recent research into oscillator networks and machine learning. See my Google Scholar and ORCID profiles, linked below, for the complete record."
    >
      <PapersStructuredData papers={sortedPapers} />
      <div className="space-y-16">
        {sortedPapers.map((paper) => (
          <PaperEntry key={paper.href} paper={paper} />
        ))}
      </div>

      <PapersProfileLinks />
    </SimpleLayout>
  )
}
