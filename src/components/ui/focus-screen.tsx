import { cn } from '@/lib/cn'

const TONE_CLASSES = {
  default: 'text-text',
  accent: 'text-accent',
  danger: 'text-danger',
} as const

export type FocusTone = keyof typeof TONE_CLASSES

export interface FocusScreenProps {
  /** Persistent strip at the top — context that stays put between stages. */
  header?: React.ReactNode
  /** Small label above the title, naming what this screen is. */
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  tone?: FocusTone
  /** The one thing to do here. */
  action: React.ReactNode
  /** Anything else, deliberately smaller and further away. */
  secondary?: React.ReactNode
  footer?: React.ReactNode
}

/**
 * One thought per screen: a few very large words in the middle and a single
 * large action at the bottom, within thumb reach.
 *
 * Everything is a slot, so the component itself carries no copy and no domain.
 */
export function FocusScreen({
  header,
  eyebrow,
  title,
  subtitle,
  tone = 'default',
  action,
  secondary,
  footer,
}: FocusScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      {header ? <div className="border-line shrink-0 border-b">{header}</div> : null}

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        {eyebrow ? (
          <p className="text-muted text-sm font-medium tracking-wide">{eyebrow}</p>
        ) : null}

        <h1
          className={cn(
            'text-5xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl',
            TONE_CLASSES[tone],
          )}
        >
          {title}
        </h1>

        {subtitle ? <p className="text-muted text-xl">{subtitle}</p> : null}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-4 px-6 pb-8">
        <div className="w-full max-w-sm [&>*]:w-full">{action}</div>
        {secondary ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {secondary}
          </div>
        ) : null}
        {footer}
      </div>
    </div>
  )
}
