import { type Metadata } from 'next'
import Link from 'next/link'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'

const REPO = 'https://github.com/ekryski/resonant'
const GUIDE = '/articles/how-a-machine-hears-a-number'

const title = 'Resonant'
const description =
  'A research project testing whether speech models can be built on coupled-oscillator physics instead of attention — a field of Kuramoto oscillators as the core of a streaming speech model.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} - Eric Kryski`,
    description,
    url: '/projects/resonant',
    images: [
      {
        url: '/resonant/og.png',
        width: 1200,
        height: 630,
        alt: 'A sound wave rippling through a lattice of oscillators and resolving into the digit seven',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} - Eric Kryski`,
    description,
    images: ['/resonant/og.png'],
  },
  alternates: { canonical: '/projects/resonant' },
}

const reading = [
  {
    href: GUIDE,
    internal: true,
    title: 'How a machine hears a number',
    blurb:
      'The interactive guide: pressure waves through Fourier, mel spectrograms, vocoders, and the oscillator core — with the whole pipeline running live in your browser on real spoken digits.',
  },
  {
    href: REPO,
    internal: false,
    title: 'The repository',
    blurb:
      'The code, the architecture, every experiment log, and the verdicts — including the ones that went against the hypothesis.',
  },
]

export default function ResonantProject() {
  return (
    <SimpleLayout
      title="Resonant: speech models made of oscillators, not attention."
      intro="Most speech models are a stack of matrix multiplications wrapped around a spectrogram. Resonant asks a different question: what if the middle of the network were a physical system — a field of coupled oscillators, driven by the audio itself, whose synchronization does the computing? It is a hypothesis built to fail cleanly, with parameter-matched controls and verdicts written before the runs."
    >
      <div className="space-y-20">
        <section>
          <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            The idea
          </h2>
          <div className="mt-4 max-w-2xl space-y-4 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              Speech <em>is</em> oscillation — vocal folds cycling, resonances ringing,
              syllables landing at 4–8 Hz. So the core here is a grid of{' '}
              <a
                href="https://en.wikipedia.org/wiki/Kuramoto_model"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-500 dark:text-violet-400"
              >
                Kuramoto oscillators
              </a>{' '}
              on a torus. Audio enters as a driving force, the oscillators pull each other
              toward agreement, and the readout is simply where every oscillator sits on
              its circle and how fast it is turning.
            </p>
            <p>
              Because the coupling is a circular convolution, one step costs a single FFT,
              and the phase field doubles as a fixed-size streaming memory — no cache that
              grows with the length of what you said. The physics of the configuration in
              the guide is roughly 2,000 numbers.
            </p>
            <p>
              It is early, it is honest about what it has and has not shown, and the
              results that contradict the hypothesis get written down alongside the ones
              that support it.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Start here
          </h2>
          <ul role="list" className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {reading.map((item) => (
              <Card as="li" key={item.href}>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                  {item.internal ? (
                    <Card.Link href={item.href}>{item.title}</Card.Link>
                  ) : (
                    <Card.Link href={item.href} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </Card.Link>
                  )}
                </h3>
                <Card.Description>{item.blurb}</Card.Description>
                <Card.Cta>{item.internal ? 'Read the guide' : 'View on GitHub'}</Card.Cta>
              </Card>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Where it stands
          </h2>
          <dl className="mt-6 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              ['Spoken digits', 'A frozen, untrained field plus a linear readout reads held-out speakers well — and a control shows most of that is the driven oscillator bank, not the coupling.'],
              ['Text to speech', 'A first milestone passed against a param-matched control; the harder rungs are open.'],
              ['Speech to text', 'Being explored. More experiments to come, and whatever they return gets recorded.'],
            ].map(([term, detail]) => (
              <div key={term}>
                <dt className="font-mono text-xs font-semibold tracking-[0.14em] text-violet-500 uppercase dark:text-violet-400">
                  {term}
                </dt>
                <dd className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{detail}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
            The full picture — hypothesis, architecture, and every run —{' '}
            <a href={REPO} target="_blank" rel="noopener noreferrer" className="text-violet-500 dark:text-violet-400">
              lives in the repository
            </a>
            . The concepts behind it are explained from scratch in{' '}
            <Link href={GUIDE} className="text-violet-500 dark:text-violet-400">
              the guide
            </Link>
            .
          </p>
        </section>
      </div>
    </SimpleLayout>
  )
}
