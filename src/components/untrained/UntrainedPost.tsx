'use client'

import { useEffect, useRef, useState } from 'react'

import { UntrainedArticle } from '@/components/untrained/UntrainedArticle'
import '@/components/resonant/resonant.css'
import '@/components/untrained/untrained.css'

/**
 * Client shell for the paper 02 post.
 *
 * React renders the article; the engine in src/lib/untrained attaches to it by
 * id. The module is imported lazily so three.js and the export's data are only
 * fetched by visitors who reach this page. The wrapper reuses the first
 * guide's instrument styling (and its data-resonant-root, which the shared
 * plotting code reads its palette from).
 */
export function UntrainedPost() {
  const mounted = useRef(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (mounted.current) return // React dev double-invoke: mount once
    mounted.current = true
    let cleanup: (() => void) | undefined
    let cancelled = false

    import('@/lib/untrained/post.js')
      .then(({ mountPost }) => mountPost())
      .then((dispose: () => void) => {
        if (cancelled) dispose()
        else {
          cleanup = dispose
          setStatus('ready')
        }
      })
      .catch((err) => {
        console.error('untrained post failed to start', err)
        setStatus('error')
      })

    return () => {
      cancelled = true
      cleanup?.()
      mounted.current = false
    }
  }, [])

  return (
    <div className="resonantGuide untrainedPost" data-resonant-root data-status={status}>
      {status === 'error' && (
        <p
          role="alert"
          className="mb-8 rounded-r-xl border-l-2 border-amber-500 bg-amber-500/5 px-5 py-4 text-[15px] text-zinc-600 dark:border-amber-300 dark:bg-amber-300/5 dark:text-zinc-400"
        >
          The interactive figures could not start in this browser. The text still reads on its own; the
          figures need WebGL and the Web Audio API.
        </p>
      )}
      <UntrainedArticle />
    </div>
  )
}
