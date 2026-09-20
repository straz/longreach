import { Button } from '../components/Button.tsx'
import { copy } from '../content.ts'
import { comparablePattern, formatComparablePattern } from '../compute.ts'
import type { ScenarioTemplate } from '../types.ts'
import './Comparables.css'

/**
 * S2. "You have encountered this pattern before" — the second aha moment.
 *
 * A real <table> so the relationships survive a screen reader. Below 860px the
 * same rows render as cards with their column names as labels, which is why
 * the headers appear twice in the markup: once in <thead> for the table, once
 * per card, hidden from assistive technology to avoid reading them six times.
 */
/**
 * The column name, shown only in the stacked card layout. Hidden from
 * assistive technology because the <thead> already names each column, and a
 * screen reader would otherwise hear every heading twice.
 */
function CellLabel({ children }: { children: string }) {
  return (
    <span className="lr-table__label" aria-hidden="true">
      {children}
    </span>
  )
}

export function Comparables({
  scenario,
  onNext,
}: {
  scenario: ScenarioTemplate
  onNext: () => void
}) {
  const text = copy.comparables
  const pattern = comparablePattern(scenario)

  return (
    <div className="lr-comparables">
      <h1 className="lr-comparables__headline">{text.headline}</h1>
      <p className="lr-comparables__body">{text.body}</p>

      <section className="lr-section">
        <h2 className="lr-section__title">{text.sectionTitle}</h2>

        <table className="lr-table">
          <thead>
            <tr>
              {text.tableHeaders.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenario.comparableCommitments.map((comparable) => {
              // Column order matches text.tableHeaders.
              const cells = [
                comparable.relevantCondition,
                comparable.evidenceShift,
                comparable.whatHappenedNext,
              ]
              return (
                <tr key={`${comparable.title}-${comparable.year}`}>
                  <th scope="row">
                    <CellLabel>{text.tableHeaders[0]!}</CellLabel>
                    <span className="lr-table__value">
                      {comparable.title} · {comparable.year}
                    </span>
                  </th>
                  {cells.map((cell, index) => (
                    <td key={text.tableHeaders[index + 1]}>
                      <CellLabel>{text.tableHeaders[index + 1]!}</CellLabel>
                      <span className="lr-table__value">{cell}</span>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="lr-pattern">
        <h2 className="lr-pattern__heading">{text.patternHeading}</h2>
        <p className="lr-pattern__statement">
          {formatComparablePattern(text.patternStatement, pattern)}
        </p>
        <p className="lr-pattern__implication">{text.patternImplication}</p>
      </section>

      <div className="lr-actions">
        <Button onClick={onNext}>{text.button}</Button>
      </div>
    </div>
  )
}
