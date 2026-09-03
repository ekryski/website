import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import { Button } from '@/components/Button'
import { CalloutWithTracking } from '@/components/CalloutWithTracking'
import { Card } from '@/components/Card'
import { Container } from '@/components/Container'
import { Newsletter } from '@/components/Newsletter'
import { Resume } from '@/components/Resume'
import { HomeSocialLinks } from '@/components/HomeSocialLinks'
import image1 from '@/images/photos/image-1.jpg'
import image2 from '@/images/photos/image-2.jpg'
import image3 from '@/images/photos/image-3.jpg'
import image4 from '@/images/photos/image-4.jpg'
import image5 from '@/images/photos/image-5.jpg'
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

const PHOTO_SCROLLER_ID = 'home-photos'

function Photos() {
  const rotations = ['rotate-2', '-rotate-2', 'rotate-2', 'rotate-2', '-rotate-2']

  return (
    <div className="mt-16 sm:mt-20">
      {/* CSS can centre an overflowing row or keep it reachable, not both:
          justify-center pushes the first photos past scrollLeft 0 where no
          amount of swiping reaches them. So the track is laid out from the
          left, and the script below parks the scroll position in the middle
          during parse — centred on arrival, scrollable both ways after. */}
      <div
        id={PHOTO_SCROLLER_ID}
        className="-my-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
      >
        <div className="mx-auto flex w-max gap-5 px-4 py-4 sm:gap-8">
          {[image1, image2, image3, image4, image5].map((image, imageIndex) => (
            <div
              key={image.src}
              className={clsx(
                'relative aspect-9/10 w-44 flex-none shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-lg shadow-zinc-800/10 sm:w-72 sm:rounded-2xl snap-center snap-always dark:bg-zinc-800 dark:shadow-black/40',
                rotations[imageIndex % rotations.length],
              )}
            >
              <Image
                src={image}
                alt=""
                sizes="(min-width: 640px) 18rem, 11rem"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){function c(){var e=document.getElementById('${PHOTO_SCROLLER_ID}');if(e){e.scrollLeft=(e.scrollWidth-e.clientWidth)/2}}c();document.addEventListener('DOMContentLoaded',c)})();`,
        }}
      />
    </div>
  )
}

export default async function Home() {
  const articles = await getFeaturedArticles(4)

  return (
    <>
      <Container className="mt-9">
        <div className="max-w-2xl">
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
      <Photos />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
              From the Notebook
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
