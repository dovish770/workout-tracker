import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { dict } from '@/i18n'
import { formatNumber } from '@/lib/format'
import type { Workout } from '../schema'

const text = dict.workouts.detail

export interface WorkoutReadViewProps {
  workout: Workout
}

export function WorkoutReadView({ workout }: WorkoutReadViewProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{text.exercisesTitle}</h2>

      {workout.exercises.length === 0 ? (
        <EmptyState title={text.exercisesTitle} />
      ) : (
        <ol className="flex flex-col gap-2">
          {workout.exercises.map((exercise, index) => (
            <li key={exercise.id}>
              <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <span className="text-muted w-6 shrink-0 text-sm tabular-nums">
                  {formatNumber(index + 1)}
                </span>

                <span className="min-w-0 flex-1 font-medium">{exercise.name}</span>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{text.setsValue(exercise.sets)}</Badge>
                  {exercise.reps === null ? null : (
                    <Badge>{text.repsValue(exercise.reps)}</Badge>
                  )}
                  {exercise.maxWeight === null ? null : (
                    <Badge variant="accent">{text.weightValue(exercise.maxWeight)}</Badge>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
