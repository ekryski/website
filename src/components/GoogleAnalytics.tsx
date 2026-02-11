'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, params)
  }
}

function PageViewTracker() {
  const pathname = usePathname()
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !pathname) return

    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', { page_path: pathname })
      }
    }
    previousPathname.current = pathname
  }, [pathname])

  return null
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return <PageViewTracker />
}
