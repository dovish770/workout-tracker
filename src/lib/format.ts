import { APP_INTL_LOCALE } from '@/i18n/config'

/**
 * Formatters are created once at module scope — constructing an `Intl`
 * formatter is expensive and these are called inside render loops.
 */
const numberFormatter = new Intl.NumberFormat(APP_INTL_LOCALE)

/** Every number shown to the user goes through here, never `String(n)`. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** Seconds as `m:ss`, for rest durations and the running timer. */
export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  return `${formatNumber(minutes)}:${String(seconds).padStart(2, '0')}`
}
