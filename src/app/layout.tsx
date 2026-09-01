import { type Metadata } from 'next'

import { Providers } from '@/app/providers'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erickryski.com'
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s - Eric Kryski',
    default:
      'Eric Kryski - Building products at the intersection of money and AI',
  },
  description:
    'I\'m Eric, a software designer and entrepreneur based in Calgary, Canada. Co-founder and CEO of Bidali, and doing deep research into AI inference and performant model architectures.',
  keywords: [
    'Eric Kryski',
    'software designer',
    'entrepreneur',
    'Bidali',
    'Calgary',
    'FeathersJS',
    'blockchain',
    'fintech',
    'artificial intelligence',
    'AI inference',
    'agentic systems',
    'coupled oscillators',
  ],
  authors: [{ name: 'Eric Kryski', url: siteUrl }],
  creator: 'Eric Kryski',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: siteUrl,
    siteName: 'Eric Kryski',
    title: 'Eric Kryski - Building products at the intersection of money and AI',
    description:
      'I\'m Eric, a software designer and entrepreneur based in Calgary, Canada. Co-founder and CEO of Bidali, and doing deep research into AI inference and performant model architectures.',
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
    title: 'Eric Kryski - Building products at the intersection of money and AI',
    description:
      'I\'m Eric, a software designer and entrepreneur based in Calgary, Canada. Co-founder and CEO of Bidali, researching AI inference and model architectures.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: './',
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
      <head>
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
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
