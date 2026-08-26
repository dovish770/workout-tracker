import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Card } from './card'

export interface Column<T> {
  key: string
  header: string
  align?: 'start' | 'end'
  headerClassName?: string
  cellClassName?: string
  render: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  /** When present the whole row becomes one link to this href. */
  getRowHref?: (row: T) => string
  /** Screen-reader description of the table as a whole. */
  caption: string
  emptyState?: React.ReactNode
  className?: string
}

/**
 * One table definition, two renderings: a real `<table>` from `md` up and a
 * card list below it. Both read the same `columns` array, so a column is only
 * ever described once. The first column is treated as the row's title on
 * mobile and carries the row link.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  getRowHref,
  caption,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (columns.length === 0) return null
  if (rows.length === 0) return emptyState ?? null

  const [primaryColumn, ...secondaryColumns] = columns

  return (
    <div className={className}>
      <table className="hidden w-full border-collapse md:table">
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr className="border-line border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'text-muted px-4 py-3 text-xs font-medium',
                  column.align === 'end' ? 'text-end' : 'text-start',
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const href = getRowHref?.(row)

            return (
              <tr
                key={getRowKey(row)}
                className={cn(
                  'border-line/60 relative border-b transition-colors duration-150 ease-out',
                  href && 'hover:bg-surface-hover',
                )}
              >
                {columns.map((column, columnIndex) => {
                  const content = column.render(row)

                  return (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-sm',
                        column.align === 'end' ? 'text-end' : 'text-start',
                        column.cellClassName,
                      )}
                    >
                      {href && columnIndex === 0 ? (
                        // Stretched link: keeps one focusable target per row
                        // while the row itself stays a valid <tr>.
                        <Link
                          href={href}
                          className="font-medium after:absolute after:inset-0"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => {
          const href = getRowHref?.(row)
          const title = primaryColumn.render(row)

          return (
            <li key={getRowKey(row)}>
              <Card
                className={cn(
                  'relative p-4 transition-colors duration-150 ease-out',
                  href && 'hover:bg-surface-hover',
                )}
              >
                <p className="font-medium">
                  {href ? (
                    <Link href={href} className="after:absolute after:inset-0">
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                </p>

                {secondaryColumns.length > 0 ? (
                  <dl className="mt-3 flex flex-col gap-1.5">
                    {secondaryColumns.map((column) => (
                      <div
                        key={column.key}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <dt className="text-muted text-xs">{column.header}</dt>
                        <dd className="min-w-0 truncate text-sm">{column.render(row)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
