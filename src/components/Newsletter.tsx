'use client'

import { trackEvent } from '@/components/GoogleAnalytics'
import { Button } from '@/components/Button'

function MailIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
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
        d="M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="m4 6 6.024 5.479a2.915 2.915 0 0 0 3.952 0L20 6"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  )
}

function RssIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  )
}

export function Newsletter() {
  const handleFormSubmit = () => {
    trackEvent('newsletter_signup', { transport_type: 'beacon' })
  }

  const handleRssClick = () => {
    trackEvent('click', {
      event_category: 'subscribe',
      event_label: 'rss',
      link_url: '/feed.xml',
    })
  }

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <MailIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <form
        action="https://app.kit.com/forms/9075566/subscriptions"
        method="post"
        className="mt-6 flex"
        onSubmit={handleFormSubmit}
      >
        <input
          type="email"
          name="email_address"
          placeholder="Email address"
          aria-label="Email address"
          required
          className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(--spacing(2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-hidden sm:text-sm dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-400/10"
        />
        <Button type="submit" className="ml-4 flex-none">
          Join
        </Button>
      </form>
      <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-700/40">
        <Button
          href="/feed.xml"
          variant="primary"
          className="w-full py-2.5 px-4 shadow-sm"
          onClick={handleRssClick}
        >
          <RssIcon className="h-5 w-5 shrink-0" />
          Subscribe via RSS
        </Button>
      </div>
    </div>
  )
}
