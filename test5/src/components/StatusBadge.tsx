import type { DecisionCondition } from '../types.ts'
import './StatusBadge.css'

/**
 * Status never rests on colour alone (docs/README.md §"Accessibility
 * requirements"): each badge carries its own words and a distinct glyph, so it
 * survives greyscale, colour-blindness and a photocopier.
 */
export function StatusBadge({
  status,
  label,
}: {
  status: DecisionCondition['status']
  label: string
}) {
  return (
    <span className={`lr-status lr-status--${status}`}>
      <span className="lr-status__glyph" aria-hidden="true">
        {status === 'new_evidence' ? '◆' : '•'}
      </span>
      {label}
    </span>
  )
}
