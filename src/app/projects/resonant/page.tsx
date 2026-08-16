import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import { ResonantGuide } from '@/components/resonant/ResonantGuide'

const title = 'How a machine hears a number'
const description =
  'A progressive guide to speech model architectures — pressure waves, Fourier transforms, mel spectrograms, vocoders, and a coupled-oscillator core — where every figure is computed live in your browser from real recordings of spoken digits.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'speech recognition',
    'mel spectrogram',
    'STFT',
    'Fourier transform',
    'neural vocoder',
    'Kuramoto model',
    'coupled oscillators',
    'machine learning',
    'Project Resonant',
  ],
  openGraph: {
    type: 'article',
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

export default function ResonantProject() {
  return (
    <Container className="mt-16 sm:mt-32">
      <header className="max-w-2xl">
        <p className="font-mono text-xs font-semibold tracking-[0.18em] text-violet-500 uppercase dark:text-violet-400">
          Project Resonant · a field guide
        </p>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          How a machine hears a number.
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          Start with air moving. End with a physics simulation that can tell{' '}
          <em>“three”</em> from <em>“eight”</em>. Every figure on this page is computed
          live, in your browser, from real recordings — nothing here is a mockup.
        </p>
        <p className="mt-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
          Ten held-out clips from AudioMNIST · ~20 min read
        </p>
      </header>

      <div className="mt-16 sm:mt-20">
        <ResonantGuide />
      </div>
    </Container>
  )
}
