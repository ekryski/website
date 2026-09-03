import Link from 'next/link'
import clsx from 'clsx'

const variantStyles = {
  // the site's accent, matching the contact callout's email button
  primary:
    'bg-violet-500 font-semibold text-white hover:bg-violet-600 active:bg-violet-700 active:text-white/80 dark:bg-violet-500 dark:hover:bg-violet-600 dark:active:bg-violet-700 dark:active:text-white/80',
  secondary:
    'bg-zinc-100 font-medium text-zinc-900 hover:bg-zinc-200 active:bg-zinc-200 active:text-zinc-900/60 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:active:bg-zinc-800/50 dark:active:text-zinc-50/70',
  // no fill: a border and the text colour, inverted in dark mode
  outline:
    'border border-zinc-300 font-medium text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100/70 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-800',
}

type ButtonProps = {
  variant?: keyof typeof variantStyles
} & (
  | (React.ComponentPropsWithoutRef<'button'> & { href?: undefined })
  | React.ComponentPropsWithoutRef<typeof Link>
)

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm outline-offset-2 transition active:transition-none',
    variantStyles[variant],
    className,
  )

  return typeof props.href === 'undefined' ? (
    <button className={className} {...props} />
  ) : (
    <Link className={className} {...props} />
  )
}
