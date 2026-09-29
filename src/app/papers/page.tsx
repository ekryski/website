import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'

/**
 * The research page's old address. The site is a static export, so there is no
 * server to send a 301: the page refreshes to /research at once, names it as
 * canonical, and keeps itself out of the index, which search engines treat as
 * a permanent move.
 */
export const metadata: Metadata = {
  title: 'Research',
  alternates: { canonical: '/research' },
  robots: { index: false, follow: true },
}

export default function PapersMoved() {
  return (
    <Container className="mt-16 sm:mt-32">
      <meta httpEquiv="refresh" content="0; url=/research" />
      <p className="text-base text-zinc-600 dark:text-zinc-400">
        Papers now live under{' '}
        <Link href="/research" className="font-medium text-violet-600 dark:text-violet-400">
          Research
        </Link>
        .
      </p>
    </Container>
  )
}
