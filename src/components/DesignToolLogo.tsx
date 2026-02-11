'use client'

const PLACEHOLDER_SVG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>'
  )

const sizeClasses = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
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
  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-lg object-contain bg-zinc-100 dark:bg-zinc-800 p-1`}
      onError={(e) => {
        e.currentTarget.src = PLACEHOLDER_SVG
      }}
    />
  )
}
