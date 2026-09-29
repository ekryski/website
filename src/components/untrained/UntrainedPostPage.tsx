import { ArticleStructuredData } from '@/components/ArticleStructuredData'
import { Container } from '@/components/Container'
import { UntrainedPost } from '@/components/untrained/UntrainedPost'
import { formatDate } from '@/lib/formatDate'

const SLUG = 'does-the-physics-do-the-work'

/**
 * Page shell for the paper 02 post. Like the first guide, not ArticleLayout:
 * the console is wide by nature. The header matches an article.
 */
export function UntrainedPostPage({
  date,
  title,
  description,
}: {
  date?: string
  title?: string
  description?: string
}) {
  return (
    <Container className="mt-16 sm:mt-32">
      {date && title && description && (
        <ArticleStructuredData
          title={title}
          description={description}
          date={date}
          path={`/articles/${SLUG}`}
          image="/untrained/og.png"
        />
      )}
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
          Project Resonant · paper 02, interactive
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
          Does the physics do the work?
        </h1>
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
          An untrained network of 1,024 coupled oscillators, a linear readout, and spoken digits. How the
          second paper tests what the oscillators actually contribute, with every model it compares running
          live in your browser on real recordings.
        </p>
        <p className="mt-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
          Twenty held-out clips from AudioMNIST · every model the paper compares · ~25 min read
        </p>
      </header>

      <div className="mt-16 sm:mt-20">
        <UntrainedPost />
      </div>
    </Container>
  )
}
