import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { PapersProfileLinks } from '@/components/PapersProfileLinks'
import { SimpleLayout } from '@/components/SimpleLayout'
import { pageMetadata } from '@/lib/metadata'

interface Paper {
  title: string
  authors: string
  venue: string
  date: string
  description: string
  href: string
  cta: string
}

const papers: Paper[] = [
  {
    title:
      'From Synchronization Physics to Trained Dynamics: A Survey of Oscillator Networks in Machine Learning',
    authors: 'Eric Kryski',
    venue: 'SSRN Working Paper, September 2026',
    date: '2026-09-01',
    description:
      'A survey of coupled-oscillator networks as a machine-learning substrate, organizing eighteen published oscillatory neural network systems around whether gradients reach the oscillator dynamics and how a model is trained around them. Argues that a substrate whose native operations are resonance and entrainment resembles how neurons evolved to sense physical signals, and closes with open directions for shared data, model evaluation, and controls.',
    href: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7445198',
    cta: 'Read on SSRN',
  },
  {
    title:
      'Emotive Expression through the Movement of Interactive Robotic Vehicles',
    authors: 'Eric Kryski, Ehud Sharlin',
    venue: 'INTERACT 2011 · LNCS vol. 6948 · Springer',
    date: '2011-01-01',
    description:
      'Design of interactive personal vehicles that express behavioral, personality-like traits through motion to make commuting more satisfying. Presents the design goals, the evolution of the vehicle prototypes, and preliminary findings from a design critique evaluation.',
    href: 'https://link.springer.com/chapter/10.1007/978-3-642-23765-2_7',
    cta: 'Read on Springer',
  },
]

function PaperEntry({ paper }: { paper: Paper }) {
  return (
    <Card as="article">
      <Card.Title as="h3" href={paper.href}>
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

export const metadata: Metadata = pageMetadata({
  title: 'Papers',
  description:
    "Papers I've published, from human-robot interaction research as an undergrad to a survey of oscillator networks in machine learning.",
  url: '/papers',
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
      <div className="space-y-16">
        {sortedPapers.map((paper) => (
          <PaperEntry key={paper.href} paper={paper} />
        ))}
      </div>

      <PapersProfileLinks />
    </SimpleLayout>
  )
}
