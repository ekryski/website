import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { type ArticleWithSlug, getAllArticles } from '@/lib/articles'
import { formatDate } from '@/lib/formatDate'

function Article({ article }: { article: ArticleWithSlug }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/articles/${article.slug}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={article.date}
          className="md:hidden"
          decorate
        >
          {formatDate(article.date)}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Cta>Read article</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={article.date}
        className="mt-1 max-md:hidden"
      >
        {formatDate(article.date)}
      </Card.Eyebrow>
    </article>
  )
}

const title = 'Writing on distributed computing, payments, startups, economics and AI.'
const description =
  'Long-form thoughts from building at the intersection of money and intelligence — distributed systems, payments and programmable money, startups, economics, and AI. Collected in chronological order.'

export const metadata: Metadata = {
  title: 'Articles',
  description,
  openGraph: {
    title: 'Articles - Eric Kryski',
    description,
    url: '/articles',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articles - Eric Kryski',
    description,
  },
}

export default async function ArticlesIndex() {
  // Fetch all articles
  const articles = await getAllArticles()

  return (
    <SimpleLayout title={title} intro={description}>
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {articles.map((article) => (
            <Article key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
