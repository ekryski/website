'use client'

import Link from 'next/link'
import { trackEvent } from '@/components/GoogleAnalytics'

type TrackedLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  trackLabel: string
  trackCategory?: 'outbound' | 'contact'
}

export function TrackedLink({
  trackLabel,
  trackCategory = 'outbound',
  href,
  ...props
}: TrackedLinkProps) {
  const hrefStr = typeof href === 'string' ? href : href?.toString() ?? ''
  const category = hrefStr.startsWith('mailto:') ? 'contact' : trackCategory

  const handleClick = () => {
    trackEvent('click', {
      event_category: category,
      event_label: trackLabel,
      link_url: hrefStr,
    })
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
