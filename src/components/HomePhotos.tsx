'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

import image1 from '@/images/photos/image-1.jpg'
import image2 from '@/images/photos/image-2.jpg'
import image3 from '@/images/photos/image-3.jpg'
import image4 from '@/images/photos/image-4.jpg'
import image5 from '@/images/photos/image-5.jpg'

const PHOTOS = [image1, image2, image3, image4, image5]
const ROTATIONS = ['rotate-2', '-rotate-2', 'rotate-2', 'rotate-2', '-rotate-2']

// Layout effects are a client-only concern; using the layout variant on the
// server logs a warning, so fall back to the ordinary one there.
const useCentringEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * The home page photo row.
 *
 * CSS can centre an overflowing row or keep every item reachable, but not
 * both: justify-center pushes the leading photos past scrollLeft 0, where no
 * amount of swiping reaches them. So the track lays out from the left and the
 * scroll position is parked in the middle on mount — before paint, and again
 * on every return to the page.
 */
export function HomePhotos() {
  const scroller = useRef<HTMLDivElement>(null)

  useCentringEffect(() => {
    const el = scroller.current
    if (!el) return
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
  }, [])

  return (
    <div className="mt-16 sm:mt-20">
      <div
        ref={scroller}
        className="-my-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
      >
        <div className="mx-auto flex w-max gap-5 px-4 py-4 sm:gap-8">
          {PHOTOS.map((image, imageIndex) => (
            <div
              key={image.src}
              className={clsx(
                'relative aspect-9/10 w-44 flex-none shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-md shadow-black/20 sm:w-72 sm:rounded-2xl snap-center snap-always dark:bg-zinc-800 dark:shadow-black/20',
                ROTATIONS[imageIndex % ROTATIONS.length],
              )}
            >
              <Image
                src={image}
                alt=""
                sizes="(min-width: 640px) 18rem, 11rem"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
