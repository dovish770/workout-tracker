/**
 * Shared visual language for form controls, so `Input` and `Textarea` cannot
 * drift apart. Error styling keys off `aria-invalid`, which `Field` already
 * sets — no separate `hasError` prop to keep in sync.
 */
export const CONTROL_CLASSES =
  'w-full rounded-md border border-line bg-bg px-3 text-sm text-text transition-colors duration-150 ease-out placeholder:text-muted hover:border-line-strong focus:border-accent aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-50'
