import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'

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
    cta: 'Read the guide',
  },
  {
    href: REPO,
    internal: false,
    title: 'The repository',
    blurb:
      'The code, the architecture, every experiment log, and the verdicts — including the ones that went against the hypothesis.',
    cta: 'View on GitHub',
  },
]

const status = [
  [
    'Spoken digits',
    'A frozen, untrained field plus a linear readout reads held-out speakers well — and a control shows most of that is the driven oscillator bank, not the coupling.',
  ],
  [
    'Text to speech',
    'A first milestone passed against a param-matched control; the harder rungs are open.',
  ],
  [
    'Speech to text',
    'Being explored. More experiments to come, and whatever they return gets recorded.',
  ],
]

function ArrowIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6.75 5.75 9.25 8l-2.5 2.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  )
}

export default function ResonantProject() {
  return (
    <Container className="mt-16 sm:mt-32">
      <header className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            Resonant: speech models made of oscillators, not attention.
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            Most speech models are a stack of matrix multiplications wrapped around a
            spectrogram. Resonant asks a different question: what if the middle of the
            network were a physical system — a field of coupled oscillators, driven by the
            audio itself, whose synchronization does the computing? It is a hypothesis
            built to fail cleanly, with parameter-matched controls and verdicts written
            before the runs.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-800/5 dark:border-zinc-700/50">
          <Image
            src="/resonant/field.png"
            alt="A spoken waveform rippling through a lattice of coupled oscillators and resolving into the digit seven"
            width={1200}
            height={630}
            className="h-auto w-full"
            unoptimized
            priority
          />
        </div>
      </header>

      <div className="mt-20 space-y-20 sm:mt-24">
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
          <h2 className="text-3xl font-bold tracking-tight text-violet-500 sm:text-4xl dark:text-violet-400">
            Learn more
          </h2>
          <ul role="list" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {reading.map((item) => {
              const outbound = item.internal
                ? {}
                : { target: '_blank', rel: 'noopener noreferrer' }
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    {...outbound}
                    className="group relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-zinc-100/60 p-6 transition hover:border-violet-300 hover:bg-violet-50 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:hover:border-violet-400/40 dark:hover:bg-zinc-800"
                  >
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {item.blurb}
                    </p>
                    <span className="mt-6 flex items-center text-sm font-medium text-violet-500 dark:text-violet-400">
                      {item.cta}
                      <ArrowIcon className="ml-1 h-4 w-4 stroke-current transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Where it stands
          </h2>
          <dl className="mt-6 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            {status.map(([term, detail]) => (
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
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-500 dark:text-violet-400"
            >
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
    </Container>
  )
}
