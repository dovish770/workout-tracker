'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStoredValue } from './use-stored-value'

const TICK_MS = 250

export interface RestTimer {
  isRunning: boolean
  /** Counts down to zero, then stays there. */
  remainingSeconds: number
  /** Counts up once the duration has elapsed. */
  overdueSeconds: number
  isOverdue: boolean
  start: () => void
  /** Back to the full duration, still running. */
  restart: () => void
  stop: () => void
}

/**
 * Rest countdown that keeps time across a locked screen.
 *
 * Elapsed time is recomputed from a stored start timestamp on every tick,
 * never accumulated tick by tick: browsers throttle and then suspend timers in
 * a backgrounded tab, so a counter that adds up intervals falls behind the
 * moment the phone goes into a pocket. Persisting that timestamp is also what
 * lets a reload resume the rest instead of skipping to the next set.
 */
export function useRestTimer(
  durationSeconds: number | null,
  storageKey: string,
): RestTimer {
  const [storedStart, setStoredStart] = useStoredValue(storageKey)
  const [now, setNow] = useState(() => Date.now())

  const parsedStart = storedStart === null ? null : Number(storedStart)
  const startedAt =
    parsedStart !== null && Number.isFinite(parsedStart) ? parsedStart : null

  const isRunning = startedAt !== null && durationSeconds !== null

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => setNow(Date.now()), TICK_MS)

    // Returning from a locked screen should snap to the true time at once
    // rather than on the next tick.
    const resync = () => setNow(Date.now())
    document.addEventListener('visibilitychange', resync)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', resync)
    }
  }, [isRunning])

  const start = useCallback(() => {
    setStoredStart(String(Date.now()))
  }, [setStoredStart])

  const stop = useCallback(() => {
    setStoredStart(null)
  }, [setStoredStart])

  const elapsedSeconds =
    startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000))

  const remainingSeconds =
    durationSeconds === null ? 0 : Math.max(0, durationSeconds - elapsedSeconds)

  const overdueSeconds =
    durationSeconds === null ? 0 : Math.max(0, elapsedSeconds - durationSeconds)

  return {
    isRunning,
    remainingSeconds,
    overdueSeconds,
    isOverdue: isRunning && remainingSeconds === 0,
    start,
    restart: start,
    stop,
  }
}
