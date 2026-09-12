'use client'

import { GoogleScholarIcon, OrcidIcon } from '@/components/SocialIcons'
import { TrackedSocialLink } from '@/components/TrackedSocialLink'

export function PapersProfileLinks() {
  return (
    <div className="mt-16 flex flex-col gap-4 border-t border-zinc-100 pt-10 sm:flex-row sm:gap-8 dark:border-zinc-700/40">
      <TrackedSocialLink
        href="https://scholar.google.ca/citations?user=cq-gq5MAAAAJ&hl=en"
        icon={GoogleScholarIcon}
        trackLabel="Google Scholar"
      >
        Google Scholar
      </TrackedSocialLink>
      <TrackedSocialLink
        href="https://orcid.org/0009-0005-7751-9059"
        icon={OrcidIcon}
        trackLabel="ORCID"
      >
        ORCID
      </TrackedSocialLink>
    </div>
  )
}
