'use client'

import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTable, type Column } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Field } from '@/components/ui/field'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { SortableList } from '@/components/ui/sortable-list'
import { Textarea } from '@/components/ui/textarea'

interface DemoRow {
  id: string
  name: string
  description: string
  exercises: number
}

const DEMO_ROWS: DemoRow[] = [
  { id: '1', name: 'פלג גוף עליון', description: 'חזה, כתפיים וטרייספס', exercises: 6 },
  { id: '2', name: 'רגליים', description: 'סקוואט ודדליפט', exercises: 4 },
]

const DEMO_COLUMNS: Column<DemoRow>[] = [
  { key: 'name', header: 'שם', render: (row) => row.name },
  { key: 'description', header: 'תיאור', render: (row) => row.description },
  {
    key: 'exercises',
    header: 'תרגילים',
    align: 'end',
    render: (row) => <Badge variant="accent">{row.exercises}</Badge>,
  },
]

const DEMO_MESSAGES = {
  instructions: 'הקש רווח כדי להתחיל לגרור, חיצים כדי להזיז, רווח כדי לשחרר.',
  onDragStart: (position: number) => `התחלת גרירה ממיקום ${position}`,
  onDragOver: (position: number) => `מיקום נוכחי ${position}`,
  onDragEnd: (position: number) => `שוחרר במיקום ${position}`,
  onDragCancel: (position: number) => `בוטל, חזרה למיקום ${position}`,
}

export function DesignPlayground() {
  const [items, setItems] = useState(['לחיצת חזה', 'פרפר', 'מקבילים'])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        title="Design system"
        description="כל ה־primitives הגנריים במקום אחד. הדף הזה לא נשלח לפרודקשן."
        actions={<Button>פעולה ראשית</Button>}
      />

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="IconButton / Badge">
        <div className="flex flex-wrap items-center gap-3">
          <IconButton label="הוספה" icon={<Plus className="size-4" />} />
          <IconButton
            label="מחיקה"
            variant="danger"
            icon={<Trash2 className="size-4" />}
          />
          <IconButton label="גרירה" icon={<GripVertical className="size-4" />} />
          <Badge>ניטרלי</Badge>
          <Badge variant="accent">6</Badge>
        </div>
      </Section>

      <Section title="Field / Input / Textarea">
        <Card className="flex flex-col gap-4 p-4">
          <Field label="שם האימון" isRequired>
            {(control) => <Input {...control} placeholder="לדוגמה: פלג גוף עליון" />}
          </Field>

          <Field label="מספר סטים" hint="בין 1 ל־50">
            {(control) => <Input {...control} type="number" inputMode="numeric" />}
          </Field>

          <Field label="שדה עם שגיאה" error="חובה להזין ערך">
            {(control) => <Input {...control} defaultValue="" />}
          </Field>

          <Field label="תיאור קצר">
            {(control) => <Textarea {...control} placeholder="שתי מילים על האימון" />}
          </Field>

          <Field label="מושבת">
            {(control) => <Input {...control} disabled defaultValue="לא ניתן לעריכה" />}
          </Field>
        </Card>
      </Section>

      <Section title="DataTable">
        <DataTable
          columns={DEMO_COLUMNS}
          rows={DEMO_ROWS}
          getRowKey={(row) => row.id}
          getRowHref={(row) => `/design#${row.id}`}
          caption="טבלת דוגמה"
        />
      </Section>

      <Section title="EmptyState">
        <EmptyState
          title="עדיין אין כלום כאן"
          description="זה המצב הריק, תמיד עם דרך יציאה אחת."
          action={<Button size="sm">יצירה</Button>}
        />
      </Section>

      <Section title="SortableList">
        <SortableList
          items={items}
          getItemId={(item) => item}
          onReorder={(from, to) =>
            setItems((current) => {
              const next = [...current]
              const [moved] = next.splice(from, 1)
              next.splice(to, 0, moved)
              return next
            })
          }
          messages={DEMO_MESSAGES}
          renderItem={(item, index, { dragHandleProps, isDragging }) => (
            <Card
              className={`flex items-center gap-2 p-3 ${isDragging ? 'border-accent' : ''}`}
            >
              <button
                type="button"
                {...dragHandleProps}
                aria-label="גרירה לשינוי הסדר"
                className="text-muted hover:text-text cursor-grab"
              >
                <GripVertical className="size-4" />
              </button>
              <span className="text-sm">
                {index + 1}. {item}
              </span>
            </Card>
          )}
        />
      </Section>

      <Section title="ConfirmDialog">
        <Button variant="danger" onClick={() => setIsDialogOpen(true)}>
          פתיחת דיאלוג
        </Button>
        <ConfirmDialog
          isOpen={isDialogOpen}
          title="למחוק את הפריט?"
          description="הפעולה אינה הפיכה."
          confirmLabel="מחיקה"
          cancelLabel="ביטול"
          onConfirm={() => setIsDialogOpen(false)}
          onCancel={() => setIsDialogOpen(false)}
        />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-muted text-xs font-medium tracking-wide">{title}</h2>
      {children}
    </section>
  )
}
