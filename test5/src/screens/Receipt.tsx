import { Button } from '../components/Button.tsx'
import { Disclosure } from '../components/Disclosure.tsx'
import { copy } from '../content.ts'
import {
  asCellText,
  capitalStillInPlay,
  flexibilityWindowBadge,
  flexibilityWindowBand,
  formatCapital,
  showsSuggestedDecision,
} from '../compute.ts'
import type { ScenarioTemplate } from '../types.ts'
import './Receipt.css'

/**
 * S3. The economic and governance close.
 *
 * It never tells the visitor to cancel, sell or stop. The suggested decision
 * names the whole set — reaffirm, stage, resize, redirect, renew — and leaves
 * the choice with the accountable authority (docs/README.md §S3).
 */
export function Receipt({
  scenario,
  onPilot,
  onRestart,
}: {
  scenario: ScenarioTemplate
  onPilot: () => void
  onRestart: () => void
}) {
  const text = copy.receipt
  const band = flexibilityWindowBand(scenario.flexibilityWindowDays)

  const rows: { label: string; value: string; badge?: string }[] = [
    { label: text.rowLabels.activeCommitment, value: scenario.receiptCommitmentText },
    { label: text.rowLabels.evidenceShift, value: asCellText(scenario.evidenceShiftStatement) },
    {
      label: text.rowLabels.capitalStillInPlay,
      value: formatCapital(capitalStillInPlay(scenario)),
    },
    {
      label: text.rowLabels.flexibilityWindow,
      value: scenario.flexibilityWindowText,
      badge: flexibilityWindowBadge(
        copy.flexibilityWindowBands[band],
        scenario.flexibilityWindowDays,
      ),
    },
    { label: text.rowLabels.comparableLearning, value: text.comparableLearningValue },
  ]

  if (showsSuggestedDecision(scenario)) {
    rows.push({
      label: text.rowLabels.suggestedDecision,
      value: text.suggestedDecisionValue,
    })
  }

  return (
    <div className="lr-receipt-screen">
      <h1 className="lr-receipt-screen__headline">{text.headline}</h1>

      <section className="lr-receipt" aria-labelledby="lr-receipt-title">
        <h2 className="lr-receipt__title" id="lr-receipt-title">
          {text.receiptTitle}
        </h2>
        <dl className="lr-receipt__rows">
          {rows.map((row) => (
            <div key={row.label} className="lr-receipt__row">
              <dt>{row.label}</dt>
              <dd>
                {row.badge === undefined ? null : (
                  <span className="lr-receipt__badge">{row.badge}</span>
                )}
                <span
                  className={
                    row.label === text.rowLabels.capitalStillInPlay
                      ? 'lr-receipt__figure'
                      : undefined
                  }
                >
                  {row.value}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <Disclosure label={text.disclosureLabel}>{text.disclosureBody}</Disclosure>
      </section>

      <section className="lr-callout">
        {text.calloutLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <section className="lr-section">
        <h2 className="lr-section__title">{text.possibleSectionTitle}</h2>
        <ul className="lr-possible">
          {text.possibleBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </section>

      <div className="lr-actions">
        <Button onClick={onPilot}>{text.primaryButton}</Button>
        <Button variant="quiet" onClick={onRestart}>
          {text.secondaryButton}
        </Button>
      </div>
      <p className="lr-receipt-screen__supporting">{text.primarySupportingText}</p>
    </div>
  )
}
