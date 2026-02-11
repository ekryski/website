'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { trackEvent } from '@/components/GoogleAnalytics'

type TrackedSocialLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  icon: React.ComponentType<{ className?: string }>
  trackLabel: string
  trackCategory?: 'outbound' | 'contact'
  children?: React.ReactNode
}

export function TrackedSocialLink({
  icon: Icon,
  trackLabel,
  trackCategory = 'outbound',
  className,
  children,
  ...props
}: TrackedSocialLinkProps) {
  const href = typeof props.href === 'string' ? props.href : props.href?.toString() ?? ''
  const isContact = href.startsWith('mailto:')
  const category = isContact ? 'contact' : trackCategory

  const handleClick = () => {
    trackEvent('click', {
      event_category: category,
      event_label: trackLabel,
      link_url: href,
    })
  }

  const linkProps = { ...props, onClick: handleClick }

  if (children) {
    return (
      <Link
        className={clsx('group flex text-sm font-medium text-zinc-800 transition hover:text-violet-500 dark:text-zinc-200 dark:hover:text-violet-500', className)}
        {...linkProps}
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-violet-500" />
        <span className="ml-4">{children}</span>
      </Link>
    )
  }

  return (
    <Link
      className={clsx('group -m-1 p-1', className)}
      {...linkProps}
    >
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
    </Link>
  )
}
