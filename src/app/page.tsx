import Link from 'next/link'

import { Button } from '@/components/Button'
import { CalloutWithTracking } from '@/components/CalloutWithTracking'
import { Card } from '@/components/Card'
import { Container } from '@/components/Container'
import { HomePhotos } from '@/components/HomePhotos'
import { Newsletter } from '@/components/Newsletter'
import { Resume } from '@/components/Resume'
import { HomeSocialLinks } from '@/components/HomeSocialLinks'
import { type ArticleWithSlug, getFeaturedArticles } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'

function Article({ article }: { article: ArticleWithSlug }) {
  return (
    <Card as="article">
      <Card.Title href={`/articles/${article.slug}`}>
        {article.title}
      </Card.Title>
      <Card.Eyebrow as="time" dateTime={article.date} decorate>
        {formatDate(article.date)}
      </Card.Eyebrow>
      <Card.Description>{article.description}</Card.Description>
      <Card.Cta>Read article</Card.Cta>
    </Card>
  )
}

export default async function Home() {
  const articles = await getFeaturedArticles(4)

  return (
    <>
      <Container className="mt-9">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            Building systems at the intersection of money and intelligence.
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            Hi 👋
          </p>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I'm Eric, a software designer and entrepreneur based in Calgary,
            Canada 🇨🇦. I have been designing and coding software since 2003.
            I'm the co-founder and CEO of <Link href="https://bidali.com" className="text-zinc-800 dark:text-zinc-100">Bidali</Link>, where we have developed
            technologies that empower regular people across 154 countries to
            participate in the global economy on their own terms. More recently
            I've been doing deep research into AI inference and performant model
            architectures. I'm very interested in where those two transformative
            technologies meet, because together they could raise the GDP of the
            planet and equalize access to both intelligence and money.
          </p>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I have a passion for building beautiful products people love. A lot
            of my time recently has gone to AI: agentic systems and internal
            tooling, local inference on Apple Silicon, and{' '}
            <Link href="/projects/resonant" className="text-zinc-800 dark:text-zinc-100">a research project</Link>{' '}
            testing whether speech models can run on coupled-oscillator physics
            instead of attention. The rest goes to distributed systems, secure
            programmable money, and the history of money, banking and economics.
          </p>
          <HomeSocialLinks />
          <CalloutWithTracking />
        </div>
      </Container>
      <HomePhotos />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
              📔 From the Notebook
            </h2>
            {articles.map((article) => (
              <Article key={article.slug} article={article} />
            ))}
            <div>
              <Button href="/articles" variant="outline">
                Read more
              </Button>
            </div>
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Newsletter />
            <Resume />
          </div>
        </div>
      </Container>
    </>
  )
}
