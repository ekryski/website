/**
 * Site-wide JSON-LD.
 *
 * Two nodes, linked by @id so search engines and language models read them as
 * one entity rather than two: the site, and the person who writes it. `sameAs`
 * is what ties this domain to the profiles that already rank for the same name.
 */

const SITE_URL = 'https://erickryski.com'

const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`

/** Profiles that corroborate the identity. Same set the home page links. */
const SAME_AS = [
  'https://github.com/ekryski',
  'https://x.com/ekryski',
  'https://www.linkedin.com/in/ekryski',
  'https://www.instagram.com/ekryski',
  'https://www.dribbble.com/ekryski',
]

export const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Eric Kryski',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  jobTitle: 'Co-founder and CEO',
  description:
    'Software designer and entrepreneur in Calgary, Canada. Co-founder and CEO of Bidali, researching AI inference, model architectures, and oscillator-based speech models.',
  worksFor: {
    '@type': 'Organization',
    name: 'Bidali',
    url: 'https://bidali.com',
  },
  homeLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Calgary',
      addressRegion: 'AB',
      addressCountry: 'CA',
    },
  },
  knowsAbout: [
    'Distributed systems',
    'Payments and programmable money',
    'Artificial intelligence',
    'AI inference',
    'Coupled oscillator networks',
    'Speech models',
    'Startups',
    'Economics',
    'Open source software',
  ],
  sameAs: SAME_AS,
}

const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE_URL,
  name: 'Eric Kryski',
  inLanguage: 'en',
  publisher: { '@id': PERSON_ID },
}

/** Rendered once, in the root layout. */
export function SiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [person, website],
        }),
      }}
    />
  )
}

/** The author reference articles point at, rather than restating the person. */
export const authorRef = { '@id': PERSON_ID }
export const siteUrl = SITE_URL
