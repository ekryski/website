'use client'

import Link from 'next/link'
import { trackEvent } from '@/components/GoogleAnalytics'

export function CalloutWithTracking() {
  const handleEmailClick = () => {
    trackEvent('click', {
      event_category: 'contact',
      event_label: 'Send me an email',
      link_url: 'mailto:hello@erickryski.com',
    })
  }

  return (
    <div className="mt-10 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 shadow-md dark:border-zinc-700/40 dark:bg-zinc-800/50">
      <div className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:flex-nowrap sm:items-center sm:gap-8">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:flex-shrink-0">
          Need help with a project or a speaker for an event?
        </p>
        <Link
          href="mailto:hello@erickryski.com"
          onClick={handleEmailClick}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-600 sm:w-auto"
        >
          Send me an email
        </Link>
      </div>
    </div>
  )
}
