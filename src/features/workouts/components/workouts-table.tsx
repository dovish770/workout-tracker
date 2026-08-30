'use client'

import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/ui/data-table'
import { StartWorkoutButton } from '@/features/sessions/components/start-workout-button'
import { dict } from '@/i18n'
import { formatNumber } from '@/lib/format'
import { ROUTES } from '@/lib/routes'
import type { WorkoutSummary } from '../schema'
import { WorkoutsEmptyState } from './workouts-empty-state'

const text = dict.workouts.list

/**
 * Only the column definitions are written here — `DataTable` turns them into
 * both the desktop table and the mobile card list.
 */
const COLUMNS: Column<WorkoutSummary>[] = [
  {
    key: 'name',
    header: text.columns.name,
    render: (workout) => workout.name,
  },
  {
    key: 'description',
    header: text.columns.description,
    cellClassName: 'max-w-md truncate text-muted',
    render: (workout) => workout.description || dict.common.emptyValue,
  },
  {
    key: 'exerciseCount',
    header: text.columns.exerciseCount,
    align: 'end',
    render: (workout) => (
      <Badge variant="accent">{formatNumber(workout.exerciseCount)}</Badge>
    ),
  },
  {
    key: 'start',
    header: text.columns.start,
    align: 'end',
    cellClassName: 'w-px whitespace-nowrap',
    // The row is one stretched link. The stacking sits on the rendered content
    // rather than on the cell, because the mobile card layout has no cell —
    // put it there and the button would be unreachable on a phone.
    render: (workout) => (
      <div className="relative z-10 inline-flex">
        <StartWorkoutButton workoutId={workout.id} size="sm" />
      </div>
    ),
  },
]

export interface WorkoutsTableProps {
  workouts: WorkoutSummary[]
}

export function WorkoutsTable({ workouts }: WorkoutsTableProps) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={workouts}
      getRowKey={(workout) => workout.id}
      getRowHref={(workout) => ROUTES.workouts.detail(workout.id)}
      caption={text.caption}
      emptyState={<WorkoutsEmptyState />}
    />
  )
}
