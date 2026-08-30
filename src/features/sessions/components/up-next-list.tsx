import { Disclosure } from '@/components/ui/disclosure'
import { dict } from '@/i18n'
import type { SessionExercise } from '../types'

const text = dict.sessions.run

export interface UpNextListProps {
  exercises: SessionExercise[]
}

/**
 * What is still to come, folded away by default.
 *
 * The whole point of focus mode is one thought per screen, so the rest of the
 * workout is available but never competing with the set in front of you.
 */
export function UpNextList({ exercises }: UpNextListProps) {
  return (
    <Disclosure summary={text.upNext} className="max-w-sm">
      {exercises.length === 0 ? (
        <p className="text-muted text-center text-xs">{text.upNextEmpty}</p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {exercises.map((exercise) => (
            <li
              key={exercise.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-muted min-w-0 truncate">{exercise.name}</span>
              <span className="text-muted shrink-0 text-xs tabular-nums">
                {text.remainingSets(exercise.completedSets, exercise.targetSets)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Disclosure>
  )
}
