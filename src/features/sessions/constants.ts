/**
 * Lifecycle of a session.
 *
 * `abandoned` exists so a run that was walked away from is distinguishable
 * from one that was finished — both are over, only one counts. `expired` is
 * distinct again: it ran out of time rather than being ended by anyone.
 */
export const SESSION_STATUSES = ['active', 'completed', 'abandoned', 'expired'] as const

export type SessionStatus = (typeof SESSION_STATUSES)[number]

/**
 * Refusals the interface reacts to rather than merely reports. Starting a
 * workout while one is running is offered a way out, so it needs an identity
 * that does not change when the wording does.
 */
export const SESSION_ERROR_CODE = {
  activeSessionExists: 'active-session-exists',
} as const

/**
 * How long a session may stay open. A workout left running overnight is not a
 * workout, and without a cap it would hold the one-active-session slot forever.
 */
export const SESSION_MAX_HOURS = 3
