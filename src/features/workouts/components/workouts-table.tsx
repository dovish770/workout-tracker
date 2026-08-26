import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/ui/data-table'
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
