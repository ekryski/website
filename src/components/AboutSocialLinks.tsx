'use client'

import Link from 'next/link'
import {
  DribbbleIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from '@/components/SocialIcons'
import { TrackedSocialLink } from '@/components/TrackedSocialLink'

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

export function AboutSocialLinks() {
  return (
    <ul role="list">
      <li className="flex">
        <TrackedSocialLink href="https://x.com/ekryski" icon={XIcon} trackLabel="X">
          Follow on X
        </TrackedSocialLink>
      </li>
      <li className="mt-4 flex">
        <TrackedSocialLink href="https://github.com/ekryski" icon={GitHubIcon} trackLabel="GitHub">
          Follow on GitHub
        </TrackedSocialLink>
      </li>
      <li className="mt-4 flex">
        <TrackedSocialLink href="https://www.linkedin.com/in/ekryski" icon={LinkedInIcon} trackLabel="LinkedIn">
          Follow on LinkedIn
        </TrackedSocialLink>
      </li>
      <li className="mt-4 flex">
        <TrackedSocialLink href="https://dribbble.com/ekryski" icon={DribbbleIcon} trackLabel="Dribbble">
          Follow on Dribbble
        </TrackedSocialLink>
      </li>
      <li className="mt-4 flex">
        <TrackedSocialLink href="https://www.instagram.com/ekryski" icon={InstagramIcon} trackLabel="Instagram">
          Follow on Instagram
        </TrackedSocialLink>
      </li>
      <li className="mt-8 flex border-t border-zinc-100 pt-8 dark:border-zinc-700/40">
        <TrackedSocialLink
          href="mailto:hello@erickryski.com"
          icon={MailIcon}
          trackLabel="Email"
        >
          hello@erickryski.com
        </TrackedSocialLink>
      </li>
      <li className="mt-4 flex">
        <Link
          href="/Eric-Kryski-CV.pdf"
          className="group flex text-sm font-medium text-zinc-800 transition hover:text-violet-500 dark:text-zinc-200 dark:hover:text-violet-500"
        >
          <DownloadIcon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-violet-500" />
          <span className="ml-4">Download CV</span>
        </Link>
      </li>
    </ul>
  )
}
