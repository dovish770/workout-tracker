import Link from 'next/link'
import { buttonClasses, type ButtonStyleProps } from './button'

export type ButtonLinkProps = React.ComponentProps<typeof Link> & ButtonStyleProps

/**
 * A navigation control that looks like a button.
 *
 * Anything that changes the URL must be an anchor — middle-click, "open in new
 * tab" and prefetching all depend on it — so this exists instead of a button
 * with an `onClick` that pushes a route.
 */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link {...props} className={buttonClasses({ variant, size, className })} />
}
