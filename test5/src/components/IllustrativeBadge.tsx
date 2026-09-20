import './IllustrativeBadge.css'

/**
 * Marks sample records as sample records. The spec is emphatic that the demo
 * must never appear to have found the visitor's own history
 * (docs/README.md §S2, acceptance criterion 4).
 */
export function IllustrativeBadge({ label }: { label: string }) {
  return <span className="lr-illustrative">{label}</span>
}
