'use client'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useId, useMemo } from 'react'
import { cn } from '@/lib/cn'

/** Props the caller must spread onto whatever element should start a drag. */
export interface DragHandleProps {
  ref: (element: HTMLElement | null) => void
  [key: string]: unknown
}

export interface SortableItemRenderProps {
  isDragging: boolean
  dragHandleProps: DragHandleProps
}

/**
 * Screen-reader copy, supplied by the caller — this component holds no text
 * of its own. Positions are 1-based.
 */
export interface SortableListMessages {
  instructions: string
  onDragStart: (position: number) => string
  onDragOver: (position: number) => string
  onDragEnd: (position: number) => string
  onDragCancel: (position: number) => string
}

export interface SortableListProps<T> {
  items: T[]
  getItemId: (item: T) => string
  onReorder: (fromIndex: number, toIndex: number) => void
  renderItem: (item: T, index: number, props: SortableItemRenderProps) => React.ReactNode
  messages: SortableListMessages
  className?: string
}

/**
 * Vertical drag-and-drop reordering for any list, mouse or keyboard.
 *
 * Knows nothing about what it is sorting: it reports index moves and lets the
 * caller own the data (`useFieldArray.move`, a setState, a server call).
 */
export function SortableList<T>({
  items,
  getItemId,
  onReorder,
  renderItem,
  messages,
  className,
}: SortableListProps<T>) {
  const ids = useMemo(() => items.map(getItemId), [items, getItemId])

  // dnd-kit derives its ARIA ids from a module-level counter, which drifts
  // between the server and client render. A React id keeps them identical.
  const contextId = useId()

  const sensors = useSensors(
    // A small threshold keeps a click on the handle from registering as a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const positionOf = (id: UniqueIdentifier | undefined) =>
    id === undefined ? 0 : ids.indexOf(String(id)) + 1

  const announcements: Announcements = {
    onDragStart: ({ active }) => messages.onDragStart(positionOf(active.id)),
    onDragOver: ({ over }) => messages.onDragOver(positionOf(over?.id)),
    onDragEnd: ({ over }) => messages.onDragEnd(positionOf(over?.id)),
    onDragCancel: ({ active }) => messages.onDragCancel(positionOf(active.id)),
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return

    const fromIndex = ids.indexOf(String(active.id))
    const toIndex = ids.indexOf(String(over.id))
    if (fromIndex === -1 || toIndex === -1) return

    onReorder(fromIndex, toIndex)
  }

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: messages.instructions },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={cn('flex flex-col gap-3', className)}>
          {items.map((item, index) => (
            <SortableItem key={ids[index]} id={ids[index]}>
              {(props) => renderItem(item, index, props)}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

interface SortableItemProps {
  id: string
  children: (props: SortableItemRenderProps) => React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      // dnd-kit owns these two properties frame by frame; Tailwind cannot.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10 opacity-80')}
    >
      {children({
        isDragging,
        dragHandleProps: { ref: setActivatorNodeRef, ...attributes, ...listeners },
      })}
    </li>
  )
}
