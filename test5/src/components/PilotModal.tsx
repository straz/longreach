import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Button } from './Button.tsx'
import { copy } from '../content.ts'
import { track } from '../analytics.ts'
import { appendPilotRequest } from '../storage.ts'
import './PilotModal.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

/**
 * The pilot ask. Opens over the receipt rather than navigating away
 * (docs/README.md §"Pilot modal").
 *
 * There is no backend in v1, so the success state says the request was
 * captured for this demonstration and never claims an email was sent. The row
 * is kept in localStorage so a demo-day lead is not thrown away
 * (docs/PLAN.md §5.1, R13).
 */
export function PilotModal({
  onClose,
  mode,
  scenarioId,
}: {
  onClose: () => void
  mode: 'canned' | 'custom' | null
  scenarioId: string
}) {
  const text = copy.pilotModal
  const dialogRef = useRef<HTMLDivElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const titleId = useId()
  const bodyId = useId()

  // Escape closes, and Tab cycles inside the dialog rather than escaping to
  // the page behind it.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusable === undefined || focusable.length === 0) return

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    // The receipt is a long page. Without this it keeps scrolling behind the
    // dialog, which reads as the modal sliding around.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [onClose])

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    appendPilotRequest({
      name: String(form.get('name') ?? ''),
      workEmail: String(form.get('workEmail') ?? ''),
      organization: String(form.get('organization') ?? ''),
      startingCommitment: String(form.get('startingCommitment') ?? ''),
      submittedAt: new Date().toISOString(),
    })
    // The event carries no field values: what was typed here stays in this
    // browser (docs/README.md §"Analytics events", docs/PLAN.md §5.1).
    track('pilot_request_submitted', { mode, scenarioId })
    setSubmitted(true)
  }

  return (
    <div className="lr-modal__scrim" onMouseDown={onClose}>
      <div
        className="lr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="lr-modal__head">
          <h2 className="lr-modal__headline" id={titleId}>
            {text.headline}
          </h2>
          <button
            type="button"
            className="lr-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="lr-modal__body" id={bodyId}>
          {text.body}
        </p>

        <ul className="lr-modal__deliverables">
          {text.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {submitted ? (
          <p className="lr-modal__success" role="status">
            {text.successMessage}
          </p>
        ) : (
          <form className="lr-modal__form" onSubmit={onSubmit}>
            <Field name="name" label={text.fieldLabels.name} autoComplete="name" required />
            <Field
              name="workEmail"
              label={text.fieldLabels.workEmail}
              type="email"
              autoComplete="email"
              required
            />
            <Field
              name="organization"
              label={text.fieldLabels.organization}
              autoComplete="organization"
              required
            />
            <Field
              name="startingCommitment"
              label={text.fieldLabels.startingCommitment}
              helper={text.startingCommitmentHelper}
            />
            {/* Button defaults to type="button"; the spread lets this one submit. */}
            <Button type="submit">{text.submitButton}</Button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  name,
  label,
  helper,
  type = 'text',
  autoComplete,
  required,
}: {
  name: string
  label: string
  helper?: string
  type?: string
  autoComplete?: string
  required?: boolean
}) {
  const id = useId()
  const helperId = `${id}-helper`

  return (
    <div className="lr-field">
      <label className="lr-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="lr-field__input"
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-describedby={helper === undefined ? undefined : helperId}
      />
      {helper === undefined ? null : (
        <p className="lr-field__helper" id={helperId}>
          {helper}
        </p>
      )}
    </div>
  )
}
