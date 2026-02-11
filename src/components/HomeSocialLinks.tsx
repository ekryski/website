'use client'

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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="m4 6 6.024 5.479a2.915 2.915 0 0 0 3.952 0L20 6"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  )
}

export function HomeSocialLinks() {
  return (
    <div className="mt-6 flex gap-6">
      <TrackedSocialLink
        href="https://x.com/ekryski"
        aria-label="Follow on X"
        icon={XIcon}
        trackLabel="X"
      />
      <TrackedSocialLink
        href="https://github.com/ekryski"
        aria-label="Follow on GitHub"
        icon={GitHubIcon}
        trackLabel="GitHub"
      />
      <TrackedSocialLink
        href="https://www.linkedin.com/in/ekryski"
        aria-label="Follow on LinkedIn"
        icon={LinkedInIcon}
        trackLabel="LinkedIn"
      />
      <TrackedSocialLink
        href="https://www.dribbble.com/ekryski"
        aria-label="Follow on Dribbble"
        icon={DribbbleIcon}
        trackLabel="Dribbble"
      />
      <TrackedSocialLink
        href="https://www.instagram.com/ekryski"
        aria-label="Follow on Instagram"
        icon={InstagramIcon}
        trackLabel="Instagram"
      />
      <TrackedSocialLink
        href="mailto:hello@erickryski.com"
        aria-label="Email"
        icon={MailIcon}
        trackLabel="Email"
      />
    </div>
  )
}
