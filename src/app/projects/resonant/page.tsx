import { type Metadata } from 'next'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'

// The repository is not public yet — kept for the commented-out repository card below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // The repository is not public yet — it needs a clean-up pass first. Keep
    // the card, drop the link: href: null renders it as a non-interactive
    // "coming soon" tile. Restore by putting `href: REPO, internal: false`
    // back and deleting the two lines below.
    // href: REPO,
    // internal: false,
    href: null,
    internal: false,
    title: 'The repository',
    blurb:
      'The code, the architecture, every experiment log, and the verdicts — including the ones that went against the hypothesis. Going public once it has had a clean-up pass.',
    cta: 'Coming soon',
  },
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
              Oscillator based models could usher in a new paradigm for AI and computing, 
              helping us better understand intelligence and the brain. Project Resonant, 
              is an early experiment, but is showing promise. It is a step towards that future.
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
              const body = (
                <>
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{item.blurb}</p>
                  <span
                    className={clsx(
                      'mt-6 flex items-center text-sm font-medium',
                      item.href
                        ? 'text-violet-500 dark:text-violet-400'
                        : 'text-zinc-400 dark:text-zinc-500',
                    )}
                  >
                    {item.cta}
                    {item.href && (
                      <ArrowIcon className="ml-1 h-4 w-4 stroke-current transition group-hover:translate-x-0.5" />
                    )}
                  </span>
                </>
              )
              const shell =
                'flex h-full flex-col rounded-2xl border p-6 transition border-zinc-200 bg-zinc-100/60 dark:border-zinc-700/50 dark:bg-zinc-800/50'
              return (
                <li key={item.title}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      {...outbound}
                      className={clsx(
                        shell,
                        'group relative hover:border-violet-300 hover:bg-violet-50 dark:hover:border-violet-400/40 dark:hover:bg-zinc-800',
                      )}
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className={clsx(shell, 'opacity-80')}>{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </Container>
  )
}
