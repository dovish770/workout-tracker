import { Skeleton } from '@/components/ui/skeleton'

const PLACEHOLDER_EXERCISES = [0, 1, 2]

export default function WorkoutLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="mb-1 h-4 w-20" />
        {PLACEHOLDER_EXERCISES.map((exercise) => (
          <Skeleton key={exercise} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}
