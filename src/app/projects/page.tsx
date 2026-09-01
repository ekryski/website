import { type Metadata } from 'next'
import Image from 'next/image'
import clsx from 'clsx'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import logoBidali from '@/images/companies/bidali.png'
import logoCaress from '@/images/projects/caress.png'
import logoDeliciousDB from '@/images/projects/deliciousdb.png'
import logoButter from '@/images/projects/butter.png'
import logoFeathersJS from '@/images/projects/feathersjs.png'
import logoIron from '@/images/projects/iron.png'
import logoResonant from '@/images/projects/resonant.png'
import logoSam from '@/images/projects/sam.png'

function ProjectIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3.75 9.75h16.5m-16.5 6.75h16.5M3.75 5.25a2.25 2.25 0 0 1 2.25-2.25h12a2.25 2.25 0 0 1 2.25 2.25v13.5a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V5.25Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
    </svg>
  )
}

const projects = [
  {
    name: 'Bidali',
    description:
      'Discover a new way to pay and save. Earn instant cash back, send and receive money for free, and manage gift cards from 1,000+ brands.',
    link: { href: 'https://www.bidali.com/', label: 'bidali.com' },
    logo: logoBidali,
  },
  {
    name: 'Resonant',
    description:
      'Research project testing whether speech models can be built on coupled-oscillator physics instead of attention — with an interactive guide that runs the whole pipeline live in your browser.',
    link: { href: '/projects/resonant', label: 'Project overview', internal: true },
    logo: logoResonant,
  },
  {
    name: 'Butter',
    description:
      'Melt away latency with ultra-smooth local inference. A dependency-light LLM inference library for Apple Silicon, built on pre-compiled Metal kernels from Iron. No Python, no MLX, no JIT.',
    link: { href: 'https://github.com/waffuruai/butter', label: 'Coming soon' },
    logo: logoButter,
  },
  {
    name: 'Iron',
    description:
      'Press raw math directly into high-performance silicon. A Rust kernel DSL that compiles one definition down to Metal, CUDA, HIP, and Vulkan.',
    link: { href: 'https://github.com/waffuruai/iron', label: 'Coming soon' },
    logo: logoIron,
  },
  {
    name: 'FeathersJS',
    description:
      'Node.js web framework and service-oriented architecture pattern for real-time web applications.',
    link: { href: 'https://feathersjs.com', label: 'feathersjs.com' },
    logo: logoFeathersJS,
  },
  {
    name: 'Caress',
    description:
      'Realtime gesture and touch recognition library for JavaScript.',
    link: { href: 'https://github.com/ekryski/caress-client', label: 'Archived' },
    logo: logoCaress,
  },
]

/** Recent client work through Bullish Ventures. Listed rather than carded:
 *  these are engagements, not products of mine. */
const engagements = [
  {
    name: 'Uncoil (Matter)',
    period: '2025',
    description:
      'An AI-driven marketing platform. Omni-channel ad generation routing prospects to landing pages written for their buyer persona, with LLM content generation and performance analysis, and business rules automated in n8n.',
    stack: 'Node.js · React · PostgreSQL · Supabase · GCP · n8n',
  },
  {
    name: 'Plume Network',
    period: '2024 – 2025',
    description:
      'The first iteration of the network, plus the pre-launch and mainnet portals. Also ran static and dynamic analysis on sybil attack and usage patterns to separate bot traffic from real users.',
    stack: 'Node.js · React · PostgreSQL · Redis · Vercel',
  },
]

const comingSoon = [
  {
    name: 'Sam',
    description: 'Your personalized AI assistant on your Mac.',
    link: { href: '#', label: 'Coming soon' },
    logo: logoSam,
  },
  {
    name: 'DeliciousDB',
    description:
      'AI-powered DBMS that runs on your local device and enables you to manage multiple DBs such as Postgres, MySQL, Redis, MongoDB, and more.',
    link: { href: '#', label: 'Coming soon' },
    logo: logoDeliciousDB,
  },
]

function LinkIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.06Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.535 0l-1.061 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'Projects',
  description:
    "Things I've made trying to put my dent in the universe. Bidali, FeathersJS, DeliciousDB, Caress, and more.",
  openGraph: {
    title: 'Projects - Eric Kryski',
    description:
      "Things I've made trying to put my dent in the universe. Bidali, FeathersJS, DeliciousDB, Caress, and more.",
    url: '/projects',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects - Eric Kryski',
    description:
      "Things I've made trying to put my dent in the universe. Bidali, FeathersJS, DeliciousDB, Caress, and more.",
  },
}

type Project = {
  name: string
  description: string
  link: { href: string; label: string; internal?: boolean }
  logo?: typeof logoBidali
}

/** Logos that are artwork in their own right sit full-bleed; wordmarks get a plate. */
const FULL_BLEED = new Set(['Sam', 'DeliciousDB', 'Resonant', 'Butter', 'Iron'])

function ProjectCard({ project }: { project: Project }) {
  const fullBleedLogo = FULL_BLEED.has(project.name)
  const isLink = project.link.href !== '#'
  // internal pages open in this tab; everything else is an outbound link
  const outboundProps = project.link.internal
    ? {}
    : { target: '_blank', rel: 'noopener noreferrer' }

  return (
    <Card as="li">
      <div
        className={clsx(
          'relative z-10 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full',
          fullBleedLogo
            ? 'ring-0 dark:ring-0'
            : 'bg-white ring-1 shadow-md shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0',
        )}
      >
        {project.logo ? (
          <Image
            src={project.logo}
            alt=""
            width={fullBleedLogo ? 48 : 32}
            height={fullBleedLogo ? 48 : 32}
            className={clsx(
              'overflow-hidden rounded-full',
              fullBleedLogo ? 'h-12 w-12 object-cover' : 'h-8 w-8',
            )}
            unoptimized
          />
        ) : (
          <ProjectIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
        )}
      </div>
      <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
        {isLink ? (
          <Card.Link href={project.link.href}>{project.name}</Card.Link>
        ) : (
          project.name
        )}
      </h2>
      <Card.Description>{project.description}</Card.Description>
      {isLink && (
        <p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 dark:text-zinc-200">
          <a
            href={project.link.href}
            {...outboundProps}
            className="flex items-center transition group-hover:text-violet-500 dark:group-hover:text-violet-400"
          >
            <LinkIcon className="h-6 w-6 flex-none" />
            <span className="ml-2">{project.link.label}</span>
          </a>
        </p>
      )}
    </Card>
  )
}

export default function Projects() {
  return (
    <SimpleLayout
      title="Things I’ve made trying to put my dent in the universe."
      intro="I’ve worked on dozens of projects over the years, from being early to Node.js, Express, React and React Native, to stablecoins, agentic commerce and physics-based artificial intelligence. I’ve always been curious about the new frontier. These are the ones I’m most proud of. Many of them are open source (or will be soon), so if you see something that piques your interest, dig into the code and tell me how it could be better."
    >
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </ul>

      <section className="mt-24 border-t border-zinc-100 pt-12 dark:border-zinc-700/40">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Recent client work
        </h2>
        <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Consulting engagements through Bullish Ventures, where I do product
          development and CTO-as-a-service for startups.
        </p>
        <ul role="list" className="mt-10 space-y-10">
          {engagements.map((engagement) => (
            <li key={engagement.name} className="max-w-2xl">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                  {engagement.name}
                </h3>
                <span className="shrink-0 text-sm text-zinc-400 dark:text-zinc-500">
                  {engagement.period}
                </span>
              </div>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                {engagement.description}
              </p>
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                {engagement.stack}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24 border-t border-zinc-100 pt-12 dark:border-zinc-700/40">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Coming soon
        </h2>
        <ul
          role="list"
          className="mt-10 grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {comingSoon.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </ul>
      </section>
    </SimpleLayout>
  )
}
