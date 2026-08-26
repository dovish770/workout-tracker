import { cn } from '@/lib/cn'
import { CONTROL_CLASSES } from './control-classes'

export type InputProps = React.ComponentProps<'input'>

export function Input({ className, ...props }: InputProps) {
  return <input {...props} className={cn(CONTROL_CLASSES, 'h-10', className)} />
}
