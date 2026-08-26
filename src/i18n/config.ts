/**
 * Locale configuration for the app.
 *
 * These are the only places the active language is declared. Adding a second
 * locale later means resolving these per-request instead of importing them —
 * no component ever hardcodes a language or a direction.
 */

export const APP_LOCALE = 'he' as const

export const APP_DIRECTION = 'rtl' as const

/** BCP 47 tag used by every `Intl.*` formatter. See `lib/format.ts`. */
export const APP_INTL_LOCALE = 'he-IL' as const
