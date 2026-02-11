'use client'

import Image from 'next/image'
import { useState } from 'react'

const PLACEHOLDER_SVG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>'
  )

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
} as const

const sizePixels = {
  sm: 48,
  md: 64,
} as const

export function DesignToolLogo({
  src,
  alt = '',
  size = 'sm',
}: {
  src: string
  alt?: string
  size?: keyof typeof sizeClasses
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <img
        src={PLACEHOLDER_SVG}
        alt={alt}
        className={`${sizeClasses[size]} rounded-lg object-contain bg-zinc-100 dark:bg-zinc-800 p-1`}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={sizePixels[size]}
      height={sizePixels[size]}
      className={`${sizeClasses[size]} rounded-lg object-contain bg-zinc-100 dark:bg-zinc-800 p-1`}
      onError={() => setHasError(true)}
      unoptimized
    />
  )
}
