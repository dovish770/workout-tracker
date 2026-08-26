import { cn } from '@/lib/cn'
import { CONTROL_CLASSES } from './control-classes'

export type TextareaProps = React.ComponentProps<'textarea'>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(CONTROL_CLASSES, 'min-h-20 resize-y py-2', className)}
    />
  )
}
