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
