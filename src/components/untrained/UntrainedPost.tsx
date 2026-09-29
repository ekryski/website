'use client'

import { useEffect, useRef, useState } from 'react'

import { UntrainedArticle } from '@/components/untrained/UntrainedArticle'
import '@/components/resonant/resonant.css'
import '@/components/untrained/untrained.css'

/** The interactive figures, in page order: the engine loads when the first of them comes near. */
const FIGURES = ['ringCanvas', 'leakyCanvas', 'clipPicker', 'readTraces', 'recordExplorer', 'kernelGrid',
                 'm-root', 'pwSpectrogram', 'd-root']
/** How far ahead of the viewport the engine starts loading. */
const LOAD_AHEAD_PX = 700

/**
 * Client shell for the paper 02 post.
 *
 * React renders the article, prose and figure markup alike, into the static
 * page, so it reads (and indexes) without any JavaScript. The engine in
 * src/lib/untrained attaches to it by id, and is imported only when a reader
 * nears the first interactive figure: three.js and the models' data are never
 * fetched by visitors who stop at the introduction, and nothing competes with
 * the article's first paint. The wrapper reuses the first guide's instrument
 * styling (and its data-resonant-root, which the shared plotting code reads
 * its palette from).
 */
export function UntrainedPost() {
  const mounted = useRef(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    if (mounted.current) return // React dev double-invoke: mount once
    mounted.current = true
    let cleanup: (() => void) | undefined
    let cancelled = false

    const start = () => {
      if (cancelled) return
      setStatus('loading')
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
    }

    // any figure will do: a reader arriving by a link partway down starts there
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer.disconnect()
        // in the browser's idle time, so the import never lands in the page's own load
        if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 2000 })
        else setTimeout(start, 200)
      },
      { rootMargin: `${LOAD_AHEAD_PX}px 0px` },
    )
    FIGURES.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      cancelled = true
      observer.disconnect()
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
