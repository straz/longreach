import { Button } from '../components/Button.tsx'
import { clarityBandText, copy } from '../content.ts'
import type { CommitmentType, EvidenceShiftCategory } from '../types.ts'
import './ConfirmScenario.css'

/**
 * C3. Hands control back before continuing: this is the example we will use,
 * and here is how to change it (docs/README.md §C3).
 *
 * "Context recognized" is a pre-authored sentence chosen by the evidence-shift
 * category, never the visitor's own words played back as a finding. The
 * clarity score is not shown; it only selects the band sentence.
 */
export function ConfirmScenario({
  commitmentType,
  evidenceShiftCategory,
  contextSummary,
  clarityScore,
  onUseThis,
  onUseStandard,
  onEditInputs,
}: {
  commitmentType: CommitmentType
  evidenceShiftCategory: EvidenceShiftCategory
  contextSummary: string
  clarityScore: number
  onUseThis: () => void
  onUseStandard: () => void
  onEditInputs: () => void
}) {
  const text = copy.confirm

  const fields: [string, string][] = [
    [text.commitmentTypeLabel, copy.commitmentTypeLabels[commitmentType]],
    [text.contextRecognizedLabel, contextSummary],
    [text.focusLabel, copy.evidenceShiftCategoryLabels[evidenceShiftCategory]],
  ]

  return (
    <div className="lr-confirm">
      <h1 className="lr-confirm__headline">{text.headline}</h1>

      <dl className="lr-confirm__fields">
        {fields.map(([label, value]) => (
          <div key={label} className="lr-confirm__field">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <p className="lr-confirm__band">{clarityBandText(clarityScore)}</p>

      <div className="lr-actions">
        <Button onClick={onUseThis}>{text.primaryButton}</Button>
        <Button variant="secondary" onClick={onUseStandard}>
          {text.secondaryButton}
        </Button>
        <Button variant="quiet" onClick={onEditInputs}>
          {text.editLink}
        </Button>
      </div>
    </div>
  )
}
