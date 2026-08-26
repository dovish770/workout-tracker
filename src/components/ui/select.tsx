import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CONTROL_CLASSES } from './control-classes'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<React.ComponentProps<'select'>, 'children'> {
  options: SelectOption[]
}

/**
 * A real `<select>`, not a custom listbox: on a phone it opens the platform
 * picker, and keyboard support, typeahead and screen-reader semantics come
 * for free. The chevron is decorative, drawn over the native arrow we hide.
 */
export function Select({ options, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(CONTROL_CLASSES, 'h-10 appearance-none pe-8', className)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden
        className="text-muted pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2"
      />
    </div>
  )
}
