import { Container } from '@/components/Container'
import { ResonantGuide } from '@/components/resonant/ResonantGuide'
import { formatDate } from '@/lib/formatDate'

/**
 * Page shell for the guide.
 *
 * Deliberately not ArticleLayout: that constrains content to max-w-2xl, and
 * this piece needs room — the live console and the architecture diagrams are
 * wide by nature. The header treatment matches an article (date, title,
 * standfirst) so it still reads as one.
 */
export function ResonantGuidePage({ date }: { date?: string }) {
  return (
    <Container className="mt-16 sm:mt-32">
      <header className="max-w-2xl">
        {date && (
          <time
            dateTime={date}
            className="order-first flex items-center text-base text-zinc-400 dark:text-zinc-500"
          >
            <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
            <span className="ml-3">{formatDate(date)}</span>
          </time>
        )}
        <p className="mt-6 font-mono text-xs font-semibold tracking-[0.18em] text-violet-500 uppercase dark:text-violet-400">
          Project Resonant · a field guide
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          How a machine hears a number.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
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
