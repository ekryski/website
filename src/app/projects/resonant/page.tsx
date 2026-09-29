import { type Metadata } from 'next'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { pageMetadata } from '@/lib/metadata'

const REPO = 'https://github.com/ekryski/oscillator-research'
const GUIDE = '/articles/how-a-machine-hears-a-number'
const STUDY = '/articles/does-the-physics-do-the-work'

/** Section chrome, shared so the sections below stay in step. */
const HEADING = 'text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100'
const BODY = 'mt-4 space-y-4 text-base text-zinc-600 dark:text-zinc-400'

const title = 'Resonant'
const description =
  'A research project testing whether speech models can be built on coupled-oscillator physics instead of attention, with Kuramoto oscillators at the core.'

export const metadata: Metadata = pageMetadata({
  title,
  description,
  url: '/projects/resonant',
  image: '/resonant/og.png',
  imageAlt:
    'A sound wave rippling through a lattice of oscillators and resolving into the digit seven',
})

/** The two articles carry their reading order; the research card has none. */
const reading: Array<{
  href: string
  internal: boolean
  order?: string
  wide?: boolean
  title: string
  blurb: string
  cta: string
}> = [
  {
    href: GUIDE,
    internal: true,
    order: '01',
    title: 'How a machine hears a number',
    blurb:
      'The interactive guide: walking you through how your ear hears, how speech models work, followed by the new untrained 2,000 parameter oscillator model running live in your browser on real spoken digits.',
    cta: 'Read the guide',
  },
  {
    href: STUDY,
    internal: true,
    order: '02',
    title: 'Does the physics do the work?',
    blurb:
      'The follow-up: what an untrained network of coupled oscillators adds to spoken-digit recognition, how a 6,353-run study tested it against its own input, simpler memories and trained networks, and every model running live in your browser.',
    cta: 'Read the article',
  },
  {
    href: REPO,
    internal: false,
    wide: true,
    title: 'The research',
    blurb:
      'Two papers so far: a survey of oscillator networks in machine learning, and a study of 6,353 runs measuring what an untrained oscillator network adds to spoken-digit recognition, against its baselines and ablations. Each ships with the code and the raw per-run data behind its numbers.',
    cta: 'Read the papers',
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
            A coupled-oscillator network is a population of rhythmic units that pull each
            other toward phase agreement. Wire them onto a geometric structure with a
            coupling function and drive them with sound, and the field’s collective state
            becomes a representation of that sound. The physics does the transducing, and
            what you read out is the network’s own response to the input.
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

      <div className="mt-16 space-y-12 sm:mt-20">
        <section>
          <h2 className={HEADING}>The idea is old</h2>
          <div className={BODY}>
            <p>
              It runs from Huygens noticing in 1665 that two pendulum clocks on one beam
              fall into step, through the Hopf model of the cochlea (like your inner ear), reservoir computing that acts like a ripple in a pond,
              and Mead’s case for letting physics do the computing directly because it's more efficient than our von Neumann computers. What is new is
              that three fields have arrived at the same dynamics from different directions:
              Physics now describes synchronization regimes that exhibit computational
              properties rather than mere order. Neuroscience has identified the neuron as a
              complex chemical and physical system with functional oscillatory properties.
              Machine learning has recently produced oscillator architectures that are
              effective at classification, image generation and path navigation, with
              evidence suggesting that oscillatory neural networks can be trained, learn,
              remember and reason. Suggesting that oscillation and fluid dynamics are a fundamental property of the universe, and maybe intelligence.
            </p>
            <p>
              That convergence is the motivation here. My working hypothesis is that a
              substrate whose native operations are resonance and entrainment (like the oscillators in the guide) more closely
              resembles the biological neurons that evolution refined to sense and learn
              from signals in the physical world, and that a trainable model built from
              those dynamics would make questions about learning, forgetting and rhythm
              disruption addressable in simulation.
            </p>
          </div>
        </section>

        <section>
          <h2 className={HEADING}>Why speech</h2>
          <div className={BODY}>
            <p>
              While I believe that oscillator models may be generalizable to other domains, 
              and this theory is gaining support due to work by other researchers, speech is the natural 
              place to explore this idea, because speech is oscillation at
              every scale: prosody near 1 Hz, syllable rhythm at 4–8 Hz, phone transitions
              at 10–40 Hz, pitch and formants from 100 Hz to several kHz. An oscillator
              field is a frequency-selective medium with intrinsic timescales, locking
              behaviour and spatial wave modes, which is the representational vocabulary
              that structure would seem to want.
            </p>
          </div>
        </section>

        <section>
          <h2 className={HEADING}>The core</h2>
          <div className={BODY}>
            <p>
              Project Resonant is the exploration of this idea. Its core is a grid of{' '}
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
              and the phase field doubles as a fixed-size streaming memory, with no cache
              that grows with the length of what you said. The model in the interactive guide 
              is roughly 2,000 parameters and classifies spoken digits with incredible accuracy,
              without training and with even the most basic linear readout method. <span className="font-bold">There is more to come as I have already begun training more complex models.</span>
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
                  {item.order && (
                    <span
                      aria-hidden="true"
                      className="absolute top-6 right-6 font-mono text-base font-bold tracking-wider text-violet-500 dark:text-violet-400"
                    >
                      {item.order}
                    </span>
                  )}
                  <h3
                    className={clsx(
                      'text-lg font-semibold text-zinc-800 dark:text-zinc-100',
                      item.order && 'pr-10',
                    )}
                  >
                    {item.order && <span className="sr-only">{`Part ${Number(item.order)}: `}</span>}
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
                <li key={item.title} className={clsx(item.wide && 'sm:col-span-2')}>
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
                    <div className={clsx(shell, 'relative opacity-80')}>{body}</div>
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
