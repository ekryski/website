'use client'

import { useEffect, useRef, useState } from 'react'

import { ResonantArticle } from '@/components/resonant/ResonantArticle'
import '@/components/resonant/resonant.css'

/**
 * Client shell for the guide.
 *
 * React renders the article; the DSP, physics, and rendering code in
 * src/lib/resonant then attaches to it by id. The module is imported lazily so
 * that three.js and the model weights are only fetched by visitors who reach
 * this page.
 */
export function ResonantGuide() {
  const mounted = useRef(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (mounted.current) return // React 18 dev double-invoke: mount once
    mounted.current = true
    let cleanup: (() => void) | undefined
    let cancelled = false

    import('@/lib/resonant/guide.js')
      .then(({ mountGuide }) => mountGuide())
      .then((dispose: () => void) => {
        if (cancelled) dispose()
        else {
          cleanup = dispose
          setStatus('ready')
        }
      })
      .catch((err) => {
        console.error('resonant guide failed to start', err)
        setStatus('error')
      })

    return () => {
      cancelled = true
      cleanup?.()
      mounted.current = false
    }
  }, [])

  return (
    <div className="resonantGuide" data-resonant-root>
      {status === 'error' && (
        <p className="note warn" role="alert">
          The interactive figures could not start in this browser. The text below still
          reads on its own — everything visual is computed live from the audio, so it needs
          WebGL and the Web Audio API.
        </p>
      )}
      <ResonantArticle />
    </div>
  )
}
