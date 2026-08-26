import { notFound } from 'next/navigation'
import { DesignPlayground } from './playground'

/**
 * Development-only gallery of every `components/ui` primitive.
 *
 * Removed in the final polish stage. Because it never ships, it is the one
 * place exempt from the "no literal copy" rule — its labels are notes to us,
 * not product text.
 */
export default function DesignPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return <DesignPlayground />
}
