import { readFileSync } from 'fs'
import { join } from 'path'

import { Container } from '@/components/Container'
import { CVDocument } from '@/components/cv/CVDocument'
import { pageMetadata } from '@/lib/metadata'

export const metadata = pageMetadata({
  title: 'CV',
  description:
    "Eric Kryski's CV: full-stack engineer and founder, eight years as technical co-founder of a payments company, now building AI systems and models.",
  url: '/cv',
})

export default function CVPage() {
  const cvContent = readFileSync(join(process.cwd(), 'public', 'cv.md'), 'utf-8')

  return (
    <Container className="mt-16 sm:mt-24">
      <CVDocument markdown={cvContent} />
    </Container>
  )
}
