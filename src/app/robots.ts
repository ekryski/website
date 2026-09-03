import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

/**
 * Assistant crawlers named explicitly.
 *
 * The wildcard rule below already allows them, but naming them makes the
 * intent legible — this site wants to be read, quoted and cited by AI
 * assistants, and a named group is the line to edit if that ever changes.
 */
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erickryski.com'

  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_AGENTS, allow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
