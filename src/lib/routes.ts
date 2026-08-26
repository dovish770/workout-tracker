/**
 * Every URL in the app is built here, so a route rename is a one-file change
 * and no component ever holds a path literal.
 */
export const ROUTES = {
  workouts: {
    list: '/workouts',
    new: '/workouts/new',
    detail: (id: string) => `/workouts/${id}`,
  },
  sessions: {
    detail: (id: string) => `/sessions/${id}`,
  },
} as const
