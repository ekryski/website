import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { AboutSocialLinks } from '@/components/AboutSocialLinks'
import { Container } from '@/components/Container'
import { Resume } from '@/components/Resume'
import { TrackedLink } from '@/components/TrackedLink'
import portraitImage from '@/images/portrait.png'

export const metadata: Metadata = {
  title: 'About',
  description:
    'I\'m Eric Kryski. I live in Calgary, where I design, build and invest in the future.',
  openGraph: {
    title: 'About - Eric Kryski',
    description:
      'I\'m Eric Kryski. I live in Calgary, where I design, build and invest in the future.',
    url: '/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About - Eric Kryski',
    description:
      'I\'m Eric Kryski. I live in Calgary, where I design, build and invest in the future.',
  },
}

export default function About() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100 mb-2">
            I'm Eric Kryski. 👋
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-500 sm:text-3xl dark:text-zinc-200">
            I live in <span className="text-red-600 dark:text-red-500">Calgary, Canada</span> 🇨🇦 where I design, build and invest in the future.
          </h2>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              I've loved making things for as long as I can remember, and I was
              always interested in understanding how things work.
            </p>
            <p>
              I am a full-stack developer, designer, and entrepreneur with a
              Bachelor of Computer Science from the University of Calgary. As
              an undergrad, I published papers in human-computer
              interaction, with an emphasis on AI, robotics, and the emotional
              impact of robots and vehicles on humans—including my{' '}
              <Link
                href="https://link.springer.com/chapter/10.1007/978-3-642-23765-2_7"
                className="text-zinc-800 dark:text-zinc-100 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
              >
                paper on emotive expression through the movement of interactive
                robotic vehicles
              </Link>
              .
            </p>
            <p>
              When I'm not building things, you'll find me hiking, gardening, or
              brewing beer in the garage. I'm into cars, love traveling and
              golfing, and hit the slopes when the snow's good—or the boxing gym
              when it isn't.
            </p>
            <p>
              At the age of seven, I started to become classically trained in
              violin, and throughout my younger years performed with the Mount
              Royal Junior Orchestra. I love music (especially EDM, jazz, and
              blues) and have been working to teach myself how to play guitar.
            </p>
            <p>
              I was a competitive soccer player until a knee injury pushed me to
              switch to speed skating, where I competed at the national and
              international level. Those experiences taught me how to overcome adversity, work well as
              an individual and push myself, and how to work well within a complex
              team dynamic. I've now come back to my soccer roots and am enjoying
              playing in the CUSA Men's League in Calgary.
            </p>
            <p>
              Today I'm the co-founder and CEO of <Link href="https://bidali.com" className="text-zinc-800 dark:text-zinc-100 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300">Bidali</Link>, where we're building technologies that empower regular people to participate in the global economy on their own terms. I'm also managing partner at Bullish Ventures, a boutique venture development firm that helps startups get quality products to market quickly.
            </p>
            <p>
              I've been building software since 2003 and have a passion for creating beautiful products people love. I co-created the <Link href="https://feathersjs.com" className="text-zinc-800 dark:text-zinc-100 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300">Feathers.js</Link> framework, created DeliciousDB, and founded the YYC.js meetup group in Calgary. I'm fascinated by the intersection of programmable money, the history of banking, and macroeconomics.
            </p>
            <p>
              I served on the National FinTech Committee of the{' '}
              <Link
                href="https://www.canadablockchain.ca"
                className="text-zinc-800 dark:text-zinc-100 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
              >
                Canadian Blockchain Consortium
              </Link>
              {' '}and have advised various governments on crypto, blockchain, and emerging finance technologies.
            </p>
            <p>
              If you are looking for a speaker in my areas of expertise, need some
              help with something you're working on, or you just want to reach
              out to say hi, send me an email at{' '}
              <TrackedLink
                href="mailto:hello@erickryski.com"
                trackLabel="hello@erickryski.com"
                className="text-zinc-800 dark:text-zinc-100 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
              >
                hello@erickryski.com
              </TrackedLink>
              , or hit me up on my social channels.
            </p>
          </div>
        </div>
        <div className="lg:pl-20">
          <AboutSocialLinks />
          <div className="mt-12">
            <Resume showDownloadButton={false} />
          </div>
        </div>
      </div>
    </Container>
  )
}
