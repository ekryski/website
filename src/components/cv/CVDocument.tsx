import Image, { type StaticImageData } from 'next/image'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Button } from '@/components/Button'
import logoBidali from '@/images/companies/bidali.png'
import logoBullishVentures from '@/images/companies/bullish-ventures.png'
import logoCalgaryScientific from '@/images/companies/calgary-scientific.png'
import logoCanadianBlockchain from '@/images/companies/canadian-blockchain-consortium.png'
import logoKissmetrics from '@/images/companies/kissmetrics.png'
import logoMyMobileCoverage from '@/images/companies/my-mobile-coverage.png'
import logoPetroFeed from '@/images/companies/petro-feed.png'
import portraitImage from '@/images/portrait.png'

/**
 * The CV page, laid out as a CV rather than an article.
 *
 * public/cv.md stays the single source: the PDF is built from it by md-to-pdf
 * (single column on purpose, for applicant tracking systems), and this page
 * parses the same file into a header, a sidebar and a work timeline. The
 * parser leans only on the file's own conventions: `# name`, a bold tagline, a
 * line of links, `---` between sections, `## section`, `### role, company`
 * with a bold date line under it, and `**label** · items` for skills.
 */

const LOGOS: Array<[RegExp, StaticImageData]> = [
  [/bidali/i, logoBidali],
  [/bullish/i, logoBullishVentures],
  [/blockchain consortium/i, logoCanadianBlockchain],
  [/kissmetrics/i, logoKissmetrics],
  [/petrofeed/i, logoPetroFeed],
  [/calgary scientific/i, logoCalgaryScientific],
  [/mymobilecoverage/i, logoMyMobileCoverage],
]

interface Role {
  title: string
  org: string
  dates: string
  place: string
  body: string
}

interface Parsed {
  name: string
  tagline: string
  location: string
  links: Array<{ label: string; href: string }>
  sections: Record<string, string>
}

function parse(markdown: string): Parsed {
  const [head, ...blocks] = markdown.split(/\n---\n/)
  const lines = head.split('\n').map((l) => l.trim()).filter(Boolean)
  const name = lines.find((l) => l.startsWith('# '))?.slice(2) ?? ''
  const tagline = lines.find((l) => /^\*\*.+\*\*$/.test(l))?.replace(/\*\*/g, '') ?? ''
  const linkLine = lines.find((l) => l.includes(']('))
  const location = lines.find((l) => !l.startsWith('# ') && !/^\*\*.+\*\*$/.test(l) && l !== linkLine) ?? ''
  const links = [...(linkLine ?? '').matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => ({ label: m[1], href: m[2] }))
  const sections: Record<string, string> = {}
  for (const block of blocks) {
    const m = block.trim().match(/^## (.+)\n([\s\S]*)$/)
    if (m) sections[m[1].trim()] = m[2].trim()
  }
  return { name, tagline, location, links, sections }
}

function roles(body: string): Role[] {
  return body
    .split(/^### /m)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [heading, meta = '', ...rest] = chunk.split('\n')
      const comma = heading.lastIndexOf(', ')
      const [dates, place = ''] = meta.split(' · ')
      return {
        title: comma > 0 ? heading.slice(0, comma) : heading,
        org: comma > 0 ? heading.slice(comma + 2) : '',
        dates: dates.replace(/\*\*/g, '').trim(),
        place: place.trim(),
        body: rest.join('\n').trim(),
      }
    })
}

function skills(body: string) {
  return body
    .split('\n')
    .map((l) => l.trim().match(/^\*\*(.+?)\*\* · (.+)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => ({ label: m[1], items: m[2] }))
}

const compact: Components = {
  p: ({ children }) => <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-6 text-zinc-600 marker:text-violet-400 dark:text-zinc-400 dark:marker:text-violet-500">
      {children}
    </ul>
  ),
  strong: ({ children }) => <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-violet-600 underline decoration-violet-300 underline-offset-2 hover:decoration-violet-500 dark:text-violet-400 dark:decoration-violet-700"
    >
      {children}
    </a>
  ),
}

function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={compact}>
      {children}
    </ReactMarkdown>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xs font-bold tracking-[0.16em] text-zinc-900 uppercase dark:text-zinc-100">
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700/60" />
    </h2>
  )
}

function Timeline({ items }: { items: Role[] }) {
  return (
    <ol className="mt-5 space-y-7">
      {items.map((role, i) => {
        const logo = LOGOS.find(([re]) => re.test(role.org))?.[1]
        return (
          <li key={i} className="relative pl-11">
            {i < items.length - 1 && (
              <span aria-hidden="true" className="absolute top-9 -bottom-7 left-[15px] w-px bg-zinc-200 dark:bg-zinc-700/60" />
            )}
            <span className="absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:bg-zinc-800 dark:ring-zinc-700/50">
              {logo ? (
                <Image src={logo} alt="" className="h-6 w-6 rounded-full" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-violet-500" />
              )}
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {role.title}
                {role.org && <span className="font-normal text-zinc-500 dark:text-zinc-400"> · {role.org}</span>}
              </h3>
              <p className="text-xs font-semibold tracking-wide text-violet-600 tabular-nums dark:text-violet-400">
                {role.dates}
              </p>
            </div>
            {role.place && <p className="text-xs text-zinc-500 dark:text-zinc-500">{role.place}</p>}
            <Markdown>{role.body}</Markdown>
          </li>
        )
      })}
    </ol>
  )
}

export function CVDocument({ markdown }: { markdown: string }) {
  const cv = parse(markdown)
  const { Summary, 'Technical Skills': skillsBody, Experience, ...rest } = cv.sections
  const education = Object.entries(rest).filter(([title]) => /education/i.test(title))
  const main = Object.entries(rest).filter(([title]) => !/education/i.test(title))

  return (
    <article className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-6 border-b border-zinc-100 pb-8 sm:flex-row sm:items-center dark:border-zinc-700/40">
        <Image
          src={portraitImage}
          alt="Portrait of Eric Kryski"
          sizes="7rem"
          priority
          className="h-28 w-28 flex-none rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
        />
        <div className="sm:border-l-2 sm:border-violet-500 sm:pl-6">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">{cv.name}</h1>
          <p className="mt-2 text-sm font-semibold tracking-[0.12em] text-violet-600 uppercase dark:text-violet-400">
            {cv.tagline}
          </p>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{cv.location}</p>
        </div>
        <div className="sm:ml-auto print:hidden">
          <Button href="/Eric-Kryski-CV.pdf" download="Eric-Kryski-CV.pdf" variant="secondary">
            Download PDF
          </Button>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <aside className="order-last space-y-9 lg:order-first lg:border-r lg:border-zinc-100 lg:pr-8 dark:lg:border-zinc-700/40">
          <section>
            <SectionTitle>Contact</SectionTitle>
            <ul className="mt-4 space-y-2 text-sm">
              {cv.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="break-all text-zinc-600 transition hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          {skillsBody && (
            <section>
              <SectionTitle>Skills</SectionTitle>
              <dl className="mt-4 space-y-4">
                {skills(skillsBody).map((group) => (
                  <div key={group.label}>
                    <dt className="text-[11px] font-semibold tracking-[0.12em] text-zinc-800 uppercase dark:text-zinc-200">
                      {group.label}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{group.items}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {education.map(([title, body]) => (
            <section key={title}>
              <SectionTitle>{title}</SectionTitle>
              <div className="mt-2">
                <Markdown>{body}</Markdown>
              </div>
            </section>
          ))}
        </aside>

        <div className="space-y-10">
          {Summary && (
            <section>
              <SectionTitle>Summary</SectionTitle>
              <div className="mt-2 [&>p]:text-[15px] [&>p]:leading-7">
                <Markdown>{Summary}</Markdown>
              </div>
            </section>
          )}
          {Experience && (
            <section>
              <SectionTitle>Experience</SectionTitle>
              <Timeline items={roles(Experience)} />
            </section>
          )}
          {main.map(([title, body]) => (
            <section key={title}>
              <SectionTitle>{title}</SectionTitle>
              <div className="mt-2 space-y-1">
                <Markdown>{body}</Markdown>
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
