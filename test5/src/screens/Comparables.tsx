import { Button } from '../components/Button.tsx'
import { RichText } from '../richtext.tsx'
import { copy } from '../content.ts'
import { comparablePattern, formatComparablePattern } from '../compute.ts'
import type { ScenarioTemplate } from '../types.ts'
import './Comparables.css'

/**
 * S2. "You have encountered this pattern before" — the second aha moment.
 *
 * A real <table> so the relationships survive a screen reader. Below 700px the
 * same rows render as cards, with each cell's column name drawn from its
 * data-label. Shared styling lives in styles/datatable.css.
 */
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
      <RichText className="lr-comparables__body">{text.body}</RichText>

      <section className="lr-section">
        <h2 className="lr-section__title">{text.sectionTitle}</h2>

        <table className="lr-datatable">
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
                  <th scope="row" data-label={text.tableHeaders[0]}>
                    {comparable.title} · {comparable.year}
                  </th>
                  {cells.map((cell, index) => (
                    <td key={text.tableHeaders[index + 1]} data-label={text.tableHeaders[index + 1]}>
                      {cell}
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
