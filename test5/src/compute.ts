// The four computations the spec defines, and nothing else.
//
// Every one is pure and takes a ScenarioTemplate, so the screens stay free of
// arithmetic and the numbers can be asserted directly in tests. Copy strings
// are passed in rather than imported: this module knows how to count, not what
// to say. See docs/README.md §"Computations".

import type { ScenarioTemplate, DecisionCondition } from './types.ts'

export type FlexibilityWindowBand =
  | 'immediate'
  | 'open'
  | 'developing'
  | 'longerDated'

/**
 * Planned capital that can still be delayed, resized, redirected or
 * renegotiated before the next material lock-in. Excludes spend already
 * incurred. docs/README.md §"Capital still in play".
 */
export function capitalStillInPlay(scenario: ScenarioTemplate): number {
  return (
    scenario.plannedUncommittedCapital + scenario.practicallyChangeableCapital
  )
}

/**
 * Whole millions with one decimal, always: the spec writes the default as
 * "$7.6M" and the capacity template as "$28.0M", so the trailing zero stays.
 */
export function formatCapital(amount: number): string {
  return `$${(amount / 1_000_000).toFixed(1)}M`
}

/** docs/README.md §"Flexibility window band". */
export function flexibilityWindowBand(days: number): FlexibilityWindowBand {
  if (days <= 14) return 'immediate'
  if (days <= 45) return 'open'
  if (days <= 90) return 'developing'
  return 'longerDated'
}

/**
 * The badge on the receipt, e.g. "OPEN · 45 DAYS". `label` is the band's
 * display string from content/copy.yml.
 */
export function flexibilityWindowBadge(label: string, days: number): string {
  const unit = days === 1 ? 'DAY' : 'DAYS'
  return `${label.toUpperCase()} · ${days} ${unit}`
}

/**
 * Drops a single trailing full stop. The evidence shift is a sentence on S1
 * and a table cell on S3, and docs/README.md §S3 shows the receipt row without
 * terminal punctuation, like every other row.
 */
export function asCellText(text: string): string {
  return text.endsWith('.') ? text.slice(0, -1) : text
}

/** The one condition the evidence shift is tied to, per the template. */
export function evidenceShiftCondition(
  scenario: ScenarioTemplate,
): DecisionCondition | undefined {
  return scenario.conditions.find(
    (condition) => condition.id === scenario.evidenceShiftConditionId,
  )
}

/**
 * How many comparable commitments saw their relevant condition move before the
 * next scheduled review. docs/README.md §"Comparable pattern" is explicit that
 * this reads as a count, never a percentage.
 */
export function comparablePattern(scenario: ScenarioTemplate): {
  early: number
  total: number
} {
  const comparables = scenario.comparableCommitments
  return {
    early: comparables.filter((item) => item.changedBeforeScheduledReview)
      .length,
    total: comparables.length,
  }
}

/** Fills {early} and {total} in the pattern sentence from content/copy.yml. */
export function formatComparablePattern(
  template: string,
  pattern: { early: number; total: number },
): string {
  return template
    .replace('{early}', String(pattern.early))
    .replace('{total}', String(pattern.total))
}

/**
 * Whether the receipt shows its suggested-decision row. The spec gates it on
 * all three conditions holding; it never selects one of the five actions, and
 * the accountable executive retains authority. docs/README.md §"Suggested
 * action".
 */
export function showsSuggestedDecision(scenario: ScenarioTemplate): boolean {
  return (
    evidenceShiftCondition(scenario) !== undefined &&
    capitalStillInPlay(scenario) > 0 &&
    scenario.flexibilityWindowDays > 0
  )
}
