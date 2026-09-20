import { useId, useState } from 'react'
import { Button } from '../components/Button.tsx'
import { copy, routing } from '../content.ts'
import { sourceTextError } from '../routing.ts'
import type { CommitmentType } from '../types.ts'
import './Customize.css'

const TYPE_ORDER: CommitmentType[] = [
  'market_expansion',
  'technology_transformation',
  'acquisition_integration',
  'capital_expansion',
  'investment_allocation',
  'strategic_other',
]

/**
 * C1. Low-friction intake: a commitment type is the only thing required, and
 * the visitor can reach the example on that alone (docs/README.md §C1,
 * acceptance criterion 5).
 *
 * The paste box is offered, never demanded. Nothing typed here is persisted,
 * logged or sent anywhere.
 */
export function Customize({
  selectedCommitmentType,
  briefContext,
  sourceText,
  onSelectType,
  onBriefContextChange,
  onSourceTextChange,
  onSubmit,
  onUseStandard,
}: {
  selectedCommitmentType?: CommitmentType
  briefContext: string
  sourceText: string
  onSelectType: (type: CommitmentType) => void
  onBriefContextChange: (value: string) => void
  onSourceTextChange: (value: string) => void
  onSubmit: () => void
  onUseStandard: () => void
}) {
  const text = copy.customize
  const [showTypeError, setShowTypeError] = useState(false)
  const briefId = useId()
  const sourceId = useId()
  const typeErrorId = useId()
  const sourceErrorId = useId()

  const tooLong = sourceTextError(sourceText, text.sourceTextTooLong)

  function submit() {
    if (selectedCommitmentType === undefined) {
      setShowTypeError(true)
      return
    }
    if (tooLong !== undefined) return
    onSubmit()
  }

  return (
    <div className="lr-customize">
      <h1 className="lr-customize__headline">{text.headline}</h1>
      <p className="lr-customize__body">{text.body}</p>

      <fieldset className="lr-fieldset">
        <legend className="lr-fieldset__legend">{text.commitmentTypeLabel}</legend>
        <div className="lr-pills">
          {TYPE_ORDER.map((type) => {
            const selected = type === selectedCommitmentType
            return (
              <button
                key={type}
                type="button"
                className={`lr-pill${selected ? ' lr-pill--selected' : ''}`}
                aria-pressed={selected}
                onClick={() => {
                  setShowTypeError(false)
                  onSelectType(type)
                }}
              >
                {copy.commitmentTypeLabels[type]}
              </button>
            )
          })}
        </div>
        <div aria-live="polite">
          {showTypeError ? (
            <p className="lr-error" id={typeErrorId}>
              {text.commitmentTypeRequired}
            </p>
          ) : null}
        </div>
      </fieldset>

      <div className="lr-field">
        <label className="lr-field__label" htmlFor={briefId}>
          {text.briefContextLabel}
        </label>
        <p className="lr-field__helper">{text.briefContextHelper}</p>
        <textarea
          className="lr-textarea"
          id={briefId}
          rows={3}
          maxLength={routing.limits.briefContextMaxChars}
          placeholder={text.briefContextPlaceholder}
          value={briefContext}
          onChange={(event) => onBriefContextChange(event.target.value)}
        />
        <p className="lr-field__helper">{text.briefContextGuidance}</p>
      </div>

      <details className="lr-advanced">
        <summary className="lr-advanced__summary">{text.advancedTitle}</summary>
        <p className="lr-field__helper">{text.advancedHelper}</p>
        <textarea
          className="lr-textarea"
          id={sourceId}
          rows={6}
          placeholder={text.advancedPlaceholder}
          value={sourceText}
          aria-invalid={tooLong !== undefined}
          aria-describedby={tooLong === undefined ? undefined : sourceErrorId}
          onChange={(event) => onSourceTextChange(event.target.value)}
        />
        {/* Announced rather than only shown, and it never says what is wrong
            with the visitor's note — only that it is longer than the
            demonstration can process. */}
        <div aria-live="polite">
          {tooLong === undefined ? null : (
            <p className="lr-error" id={sourceErrorId}>
              {tooLong}
            </p>
          )}
        </div>
      </details>

      <div className="lr-actions">
        <Button onClick={submit}>{text.primaryButton}</Button>
        <Button variant="quiet" onClick={onUseStandard}>
          {text.secondaryButton}
        </Button>
      </div>
      <p className="lr-customize__privacy">{text.privacy}</p>
    </div>
  )
}
