import { useId, useState } from 'react'
import './Disclosure.css'

/**
 * Keeps low-priority detail collapsed so the receipt stays inside the
 * 30-second budget (docs/PLAN.md R8). A native details/summary would do the
 * job, but its default marker styling varies enough between browsers to be
 * worth the twelve lines.
 */
export function Disclosure({ label, children }: { label: string; children: string }) {
  const [open, setOpen] = useState(false)
  const bodyId = useId()

  return (
    <div className="lr-disclosure">
      <button
        type="button"
        className="lr-disclosure__toggle"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="lr-disclosure__marker" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
        {label}
      </button>
      <div id={bodyId} className="lr-disclosure__body" hidden={!open}>
        <p>{children}</p>
      </div>
    </div>
  )
}
