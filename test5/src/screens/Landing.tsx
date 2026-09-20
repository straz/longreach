import { Button } from '../components/Button.tsx'
import { copy } from '../content.ts'
import './Landing.css'

/**
 * S0. Establishes the proposition and points at the zero-input path. No
 * computation happens here (docs/README.md §S0).
 */
export function Landing({
  onSeeExample,
  onCustomize,
}: {
  onSeeExample: () => void
  onCustomize: () => void
}) {
  const text = copy.landing

  return (
    <div className="lr-landing">
      <p className="lr-eyebrow">{text.eyebrow}</p>
      <h1 className="lr-landing__headline">{text.headline}</h1>
      <p className="lr-landing__body">{text.body}</p>
      <div className="lr-landing__actions">
        <Button onClick={onSeeExample}>{text.primaryButton}</Button>
        <Button variant="quiet" onClick={onCustomize}>
          {text.secondaryButton}
        </Button>
      </div>
      <p className="lr-landing__microcopy">{text.microcopy}</p>
    </div>
  )
}
