import Image, { type ImageProps } from 'next/image'

import { Button } from '@/components/Button'

import logoBidali from '@/images/companies/bidali.png'
import logoBullishVentures from '@/images/companies/bullish-ventures.png'
import logoCalgaryScientific from '@/images/companies/calgary-scientific.png'
import logoCanadianBlockchain from '@/images/companies/canadian-blockchain-consortium.png'
import logoKissmetrics from '@/images/companies/kissmetrics.png'
import logoMyMobileCoverage from '@/images/companies/my-mobile-coverage.png'
import logoPetroFeed from '@/images/companies/petro-feed.png'

function BriefcaseIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
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
        d="M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  )
}

function ArrowDownIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export interface Role {
  company: string
  title: string
  logo?: ImageProps['src']
  start: string | { label: string; dateTime: string }
  end: string | { label: string; dateTime: string }
}

function Role({ role }: { role: Role }) {
  const startLabel =
    typeof role.start === 'string' ? role.start : role.start.label
  const startDate =
    typeof role.start === 'string' ? role.start : role.start.dateTime

  const endLabel = typeof role.end === 'string' ? role.end : role.end.label
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dateTime for end not yet in use
  const endDate = typeof role.end === 'string' ? role.end : role.end.dateTime

  return (
    <li className="flex gap-4">
      <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full ring-1 shadow-md shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
        {role.logo ? (
          <Image
            src={role.logo}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 overflow-hidden rounded-full"
            unoptimized
          />
        ) : (
          <BriefcaseIcon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {role.company}
          </span>
          <time
            className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500"
            dateTime={startDate}
            aria-label={`${startLabel} until ${endLabel}`}
          >
            {startLabel} — {endLabel}
          </time>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {role.title}
        </span>
      </div>
    </li>
  )
}

export const RESUME_DATA: Array<Role> = [
  {
    company: 'Bidali',
    title: 'Co-Founder',
    logo: logoBidali,
    start: '2018',
    end: { label: 'Present', dateTime: new Date().getFullYear().toString() },
  },
  {
    company: 'Bullish Ventures',
    title: 'Managing Partner',
    logo: logoBullishVentures,
    start: '2015',
    end: { label: 'Present', dateTime: new Date().getFullYear().toString() },
  },
  {
    company: 'Canadian Blockchain Consortium',
    title: 'National FinTech Committee Member',
    logo: logoCanadianBlockchain,
    start: '2020',
    end: '2024',
  },
  {
    company: 'KISSmetrics',
    title: 'Engineering',
    logo: logoKissmetrics,
    start: '2014',
    end: '2015',
  },
  {
    company: 'PetroFeed',
    title: 'VP of Architecture',
    logo: logoPetroFeed,
    start: '2013',
    end: '2014',
  },
  {
    company: 'Calgary Scientific Inc',
    title: 'Software Developer',
    logo: logoCalgaryScientific,
    start: '2012',
    end: '2013',
  },
  {
    company: 'MyMobileCoverage',
    title: 'Senior Software Developer',
    logo: logoMyMobileCoverage,
    start: '2011',
    end: '2012',
  },
  {
    company: 'Krysco Contracting Corp.',
    title: 'President & Founder',
    start: '2004',
    end: '2012',
  },
]

export function Resume({
  showDownloadButton = true,
}: {
  showDownloadButton?: boolean
}) {
  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">My work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {RESUME_DATA.map((role, roleIndex) => (
          <Role key={roleIndex} role={role} />
        ))}
      </ol>
      {showDownloadButton && (
        <Button
          href="/Eric-Kryski-CV.pdf"
          download="Eric-Kryski-CV.pdf"
          variant="secondary"
          className="group mt-6 w-full"
        >
          Download CV
          <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
        </Button>
      )}
    </div>
  )
}
