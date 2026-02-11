import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { Resume } from '@/components/Resume'
import {
  DribbbleIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.png'

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
}: {
  className?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-violet-500 dark:text-zinc-200 dark:hover:text-violet-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-violet-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

function MailIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

function DownloadIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
      />
    </svg>
  )
}

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
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            I'm Eric Kryski. I live in Calgary, Canada 🇨🇦 where I design, build and invest in the future.
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              I've loved making things for as long as I can remember, and wrote
              my first program when I was 6 years old, just two weeks after my
              mom brought home the brand new Macintosh LC 550 that I taught
              myself to type on.
            </p>
            <p>
              Today I'm the co-founder and CEO of <Link href="https://bidali.com" className="text-zinc-800 dark:text-zinc-100 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300">Bidali</Link>, where we're building technologies that empower regular people to participate in the global economy on their own terms. I'm also managing partner at <strong>Bullish Ventures</strong>, a boutique venture development firm that helps startups get quality products to market quickly.
            </p>
            <p>
              I've been building software since 2003 and have a passion for creating beautiful products people love. I maintain the <Link href="https://feathersjs.com" className="text-zinc-800 dark:text-zinc-100 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-600 dark:decoration-zinc-500 dark:hover:decoration-zinc-300">Feathers.js</Link> framework, created DeliciousDB, and founded the YYC.js meetup group in Calgary. I serve on the national FinTech committee of the Canadian Blockchain Consortium, and I'm fascinated by the intersection of programmable money, the history of banking, and macroeconomics.
            </p>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            <SocialLink href="https://x.com/ekryski" icon={XIcon}>
              Follow on X
            </SocialLink>
            <SocialLink href="https://github.com/ekryski" icon={GitHubIcon} className="mt-4">
              Follow on GitHub
            </SocialLink>
            <SocialLink href="https://www.linkedin.com/in/ekryski" icon={LinkedInIcon} className="mt-4">
              Follow on LinkedIn
            </SocialLink>
            <SocialLink href="https://dribbble.com/ekryski" icon={DribbbleIcon} className="mt-4">
              Follow on Dribbble
            </SocialLink>
            <SocialLink href="https://www.instagram.com/ekryski" icon={InstagramIcon} className="mt-4">
              Follow on Instagram
            </SocialLink>
            <SocialLink
              href="mailto:hello@erickryski.com"
              icon={MailIcon}
              className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
            >
              hello@erickryski.com
            </SocialLink>
            <SocialLink
              href="/Eric-Kryski-CV.pdf"
              icon={DownloadIcon}
              className="mt-4"
            >
              Download CV
            </SocialLink>
          </ul>
          <div className="mt-12">
            <Resume showDownloadButton={false} />
          </div>
        </div>
      </div>
    </Container>
  )
}
