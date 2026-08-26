/**
 * Lifecycle of a session.
 *
 * `abandoned` exists so a run that was walked away from is distinguishable
 * from one that was finished — both are over, only one counts.
 */
export const SESSION_STATUSES = ['active', 'completed', 'abandoned'] as const

export type SessionStatus = (typeof SESSION_STATUSES)[number]
