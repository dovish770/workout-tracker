/**
 * The return type of every server action.
 *
 * Expected failures — validation, a missing row — come back as values so the
 * caller can render them. Only genuinely unexpected faults throw and reach the
 * error boundary.
 */

/** Dotted field paths (`exercises.0.name`) mapped to their messages. */
export type FieldErrors = Record<string, string[]>

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string; fieldErrors?: FieldErrors }

export interface FailureDetails {
  /** A stable identifier for the failure, when the caller must react to it. */
  code?: string
  fieldErrors?: FieldErrors
}

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

export function fail(error: string, details: FailureDetails = {}): ActionResult<never> {
  return { ok: false, error, ...details }
}

/** Shape of a Zod issue, kept structural so this file stays validator-agnostic. */
interface ValidationIssue {
  path: PropertyKey[]
  message: string
}

/**
 * Flattens issues into dotted paths, the format `react-hook-form`'s `setError`
 * expects — so server-side validation lands on the same inputs as client-side.
 */
export function toFieldErrors(issues: readonly ValidationIssue[]): FieldErrors {
  const fieldErrors: FieldErrors = {}

  for (const issue of issues) {
    const path = issue.path.map(String).join('.')
    if (!path) continue

    fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message]
  }

  return fieldErrors
}
