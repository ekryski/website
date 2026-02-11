import { type Metadata } from 'next'
import Image from 'next/image'
import clsx from 'clsx'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import logoBidali from '@/images/companies/bidali.png'
import logoCaress from '@/images/projects/caress.png'
import logoDeliciousDB from '@/images/projects/deliciousdb.png'
import logoFeathersJS from '@/images/projects/feathersjs.png'
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
    name: 'Sam',
    description:
      'Your personalized AI assistant on your Mac.',
    link: { href: '#', label: 'Coming soon' },
    logo: logoSam,
  },
  {
    name: 'FeathersJS',
    description:
      'Node.js web framework and service-oriented architecture pattern for real-time web applications.',
    link: { href: 'https://feathersjs.com', label: 'feathersjs.com' },
    logo: logoFeathersJS,
  },
  {
    name: 'DeliciousDB',
    description:
      'AI-powered DBMS that runs on your local device and enables you to manage multiple DBs such as Postgres, MySQL, Redis, MongoDB, and more. (Coming soon)',
    link: { href: '#', label: 'Coming soon' },
    logo: logoDeliciousDB,
  },
  {
    name: 'Caress',
    description:
      'Realtime gesture and touch recognition library for JavaScript.',
    link: { href: 'https://github.com/ekryski/caress-client', label: 'Archived' },
    logo: logoCaress,
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

export default function Projects() {
  return (
    <SimpleLayout
      title="Things I’ve made trying to put my dent in the universe."
      intro="I’ve worked on tons of little projects over the years but these are the ones that I’m most proud of. Many of them are open-source, so if you see something that piques your interest, check out the code and contribute if you have ideas for how it can be improved."
    >
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => {
          const fullBleedLogo =
            project.name === 'Sam' || project.name === 'DeliciousDB'
          return (
          <Card as="li" key={project.name}>
            <div
              className={clsx(
                'relative z-10 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full',
                fullBleedLogo
                  ? 'ring-0 dark:ring-0'
                  : 'bg-white ring-1 shadow-md shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0'
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
                    fullBleedLogo ? 'h-12 w-12 object-cover' : 'h-8 w-8'
                  )}
                  unoptimized
                />
              ) : (
                <ProjectIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
              )}
            </div>
            <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
              {project.link.href !== '#' ? (
                <Card.Link href={project.link.href}>{project.name}</Card.Link>
              ) : (
                project.name
              )}
            </h2>
            <Card.Description>{project.description}</Card.Description>
            <p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 dark:text-zinc-200">
              {project.link.href !== '#' ? (
                <a
                  href={project.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center transition group-hover:text-violet-500 dark:group-hover:text-violet-400"
                >
                  <LinkIcon className="h-6 w-6 flex-none" />
                  <span className="ml-2">{project.link.label}</span>
                </a>
              ) : (
                <>
                  <LinkIcon className="h-6 w-6 flex-none" />
                  <span className="ml-2">{project.link.label}</span>
                </>
              )}
            </p>
          </Card>
          )
        })}
      </ul>
    </SimpleLayout>
  )
}
