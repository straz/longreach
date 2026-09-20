import { Button } from '../components/Button.tsx'
import { StatusBadge } from '../components/StatusBadge.tsx'
import { copy, getPackScenarios } from '../content.ts'
import { evidenceShiftCondition } from '../compute.ts'
import type { ScenarioTemplate } from '../types.ts'
import './Conditions.css'

/**
 * S1. Longreach preserves the conditions behind an active commitment, then
 * shows that one of them has moved — the first of the two aha moments.
 *
 * The rationale and the conditions are one table rather than two stacked
 * lists. They were saying the same thing twice: "Demand was expected to exceed
 * current capacity" and "Demand supports the planned expansion" are the same
 * sentence in two tenses, and reading both twice over three rows is what made
 * this screen long. Each row now runs why it was authorized → what Longreach
 * watches → what would warrant a refresh → where it stands.
 *
 * The reveal is additive: the table stays, and the moved row is emphasised in
 * amber rather than marked as a failure.
 */
export function Conditions({
  scenario,
  packId,
  revealed,
  onReveal,
  onNext,
  onSelectScenario,
}: {
  scenario: ScenarioTemplate
  packId: string
  revealed: boolean
  onReveal: () => void
  onNext: () => void
  onSelectScenario: (scenarioId: string) => void
}) {
  const text = copy.conditions
  const columns = text.conditionColumnLabels
  const shifted = evidenceShiftCondition(scenario)
  const choices = getPackScenarios(packId)

  return (
    <div className="lr-conditions">
      <h1 className="lr-conditions__headline">{text.headline}</h1>

      {/* The commitment bar is also how a different example is chosen. A real
          <select> sits transparently over the card, so the card keeps its own
          appearance while the browser supplies the menu, keyboard handling and
          the native picker on a phone. */}
      <section className="lr-commitment">
        <p className="lr-commitment__title">{text.commitmentCardLabel}</p>
        <p className="lr-commitment__value">
          {scenario.activeCommitmentText}
          <span className="lr-commitment__caret" aria-hidden="true" />
        </p>
        <select
          className="lr-commitment__select"
          aria-label={text.commitmentPickerLabel}
          value={scenario.id}
          onChange={(event) => onSelectScenario(event.target.value)}
        >
          {choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.title}
            </option>
          ))}
        </select>
      </section>

      <p className="lr-commitment__description">{scenario.description}</p>

      <section className="lr-section">
        <h2 className="lr-section__title">{text.conditionsSectionTitle}</h2>

        <table className="lr-datatable lr-conditions__table">
          <thead>
            <tr>
              <th scope="col">{columns.status}</th>
              <th scope="col">{columns.why}</th>
              <th scope="col">{columns.watchedEvidence}</th>
              <th scope="col">{columns.reconsiderationCondition}</th>
            </tr>
          </thead>
          <tbody>
            {scenario.conditions.map((condition) => {
              const isShifted = revealed && condition.id === scenario.evidenceShiftConditionId
              return (
                <tr
                  key={condition.id}
                  className={isShifted ? 'lr-conditions__row--shifted' : undefined}
                >
                  <td data-label={columns.status}>
                    <StatusBadge
                      status={condition.status}
                      label={text.statusLabels[condition.status]}
                    />
                  </td>
                  <th scope="row" data-label={columns.why}>
                    {condition.why}
                  </th>
                  <td data-label={columns.watchedEvidence}>{condition.watchedEvidence}</td>
                  <td data-label={columns.reconsiderationCondition}>
                    {condition.reconsiderationCondition}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {/* The reveal is announced, not just shown. */}
      <div aria-live="polite">
        {revealed && shifted !== undefined ? (
          <section className="lr-reveal">
            <h2 className="lr-reveal__headline">{text.revealHeadline}</h2>
            <p className="lr-reveal__statement">{scenario.evidenceShiftStatement}</p>
            <p className="lr-reveal__interpretation">{scenario.evidenceShiftInterpretation}</p>
          </section>
        ) : null}
      </div>

      <div className="lr-actions">
        {revealed ? (
          <Button onClick={onNext}>{text.nextButton}</Button>
        ) : (
          <Button onClick={onReveal}>{text.initialButton}</Button>
        )}
      </div>
    </div>
  )
}
