import { readFileSync } from 'fs'
import { join } from 'path'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Container } from '@/components/Container'
import { Prose } from '@/components/Prose'

export const metadata = {
  title: 'CV',
  description: 'Eric Kryski - Curriculum Vitae',
}

export default function CVPage() {
  const cvPath = join(process.cwd(), 'public', 'cv.md')
  const cvContent = readFileSync(cvPath, 'utf-8')

  return (
    <Container className="mt-16 sm:mt-32">
      <div className="mx-auto max-w-2xl">
        <article className="print:prose-sm" id="cv-content">
          <Prose>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{cvContent}</ReactMarkdown>
          </Prose>
        </article>
      </div>
    </Container>
  )
}
