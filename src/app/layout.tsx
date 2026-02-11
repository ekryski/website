import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erickryski.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s - Eric Kryski',
    default:
      'Eric Kryski - Software designer, founder, and amateur economist',
  },
  description:
    'I\'m Eric, a software designer and entrepreneur based in Calgary, Canada. I\'m the co-founder and CEO of Bidali, where we develop technologies that empower regular people to participate in the global economy on their own terms.',
  keywords: [
    'Eric Kryski',
    'software designer',
    'entrepreneur',
    'Bidali',
    'Calgary',
    'FeathersJS',
    'blockchain',
    'fintech',
  ],
  authors: [{ name: 'Eric Kryski', url: siteUrl }],
  creator: 'Eric Kryski',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: siteUrl,
    siteName: 'Eric Kryski',
    title: 'Eric Kryski - Software designer, founder, and amateur economist',
    description:
      'I\'m Eric, a software designer and entrepreneur based in Calgary, Canada. I\'m the co-founder and CEO of Bidali, where we develop technologies that empower regular people to participate in the global economy on their own terms.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Eric Kryski',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eric Kryski - Software designer, founder, and amateur economist',
    description:
      'I\'m Eric, a software designer and entrepreneur based in Calgary, Canada. I\'m the co-founder and CEO of Bidali.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
    types: {
      'application/rss+xml': `${siteUrl}/feed.xml`,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex h-full bg-zinc-50 dark:bg-black">
        <GoogleAnalytics />
        <Providers>
          <div className="flex w-full">
            <Layout>{children}</Layout>
          </div>
        </Providers>
      </body>
    </html>
  )
}
