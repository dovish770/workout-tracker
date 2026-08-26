import { he } from './locales/he'

/**
 * The active dictionary.
 *
 * Everything user-facing reads from here. When a second language is added,
 * this export is replaced by a per-request `getDictionary(locale)` and the
 * call sites (`dict.workouts.list.title`) stay identical.
 */
export const dict = he

/**
 * The contract every locale file must satisfy. Declaring `en.ts` as
 * `satisfies Dictionary` is what guarantees no key was left untranslated.
 */
export type Dictionary = typeof he
