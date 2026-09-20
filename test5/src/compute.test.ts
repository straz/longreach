import { describe, expect, test } from 'vitest'

import {
  capitalStillInPlay,
  comparablePattern,
  evidenceShiftCondition,
  flexibilityWindowBadge,
  flexibilityWindowBand,
  formatCapital,
  formatComparablePattern,
  showsSuggestedDecision,
} from './compute.ts'
import { copy, getScenario } from './content.ts'
import type { ScenarioTemplate } from './types.ts'

// The canned default. Its figures are the ones docs/README.md states verbatim,
// so asserting against the real template — rather than a fixture — means a bad
// content edit fails here too.
const regional = getScenario('regional_expansion_v1')!

describe('capital still in play', () => {
  test('the default template displays $7.6M', () => {
    expect(formatCapital(capitalStillInPlay(regional))).toBe('$7.6M')
  })

  test('excludes capital that is no longer practical to change', () => {
    expect(capitalStillInPlay(regional)).toBe(7_600_000)
    expect(regional.irreversiblyCommittedCapital).toBe(4_400_000)
  })

  test('keeps a trailing zero, as the capacity template requires', () => {
    expect(formatCapital(28_000_000)).toBe('$28.0M')
    expect(formatCapital(15_000_000)).toBe('$15.0M')
  })
})

describe('flexibility window band', () => {
  // Boundaries from docs/README.md §"Flexibility window band". Each pair is
  // the last day inside a band and the first day outside it.
  test.each([
    [1, 'immediate'],
    [14, 'immediate'],
    [15, 'open'],
    [45, 'open'],
    [46, 'developing'],
    [90, 'developing'],
    [91, 'longerDated'],
    [365, 'longerDated'],
  ])('%i days is %s', (days, band) => {
    expect(flexibilityWindowBand(days)).toBe(band)
  })

  test('the default template badges as OPEN · 45 DAYS', () => {
    const band = flexibilityWindowBand(regional.flexibilityWindowDays)
    expect(band).toBe('open')
    expect(
      flexibilityWindowBadge(copy.flexibilityWindowBands[band], regional.flexibilityWindowDays),
    ).toBe('OPEN · 45 DAYS')
  })

  test('a one-day window reads as DAY, not DAYS', () => {
    expect(flexibilityWindowBadge('Immediate', 1)).toBe('IMMEDIATE · 1 DAY')
  })
})

describe('comparable pattern', () => {
  test('the default template is 2 of 3', () => {
    expect(comparablePattern(regional)).toEqual({ early: 2, total: 3 })
  })

  test('renders as a count, with no percentage', () => {
    const sentence = formatComparablePattern(
      copy.comparables.patternStatement,
      comparablePattern(regional),
    )
    expect(sentence).toBe(
      'In 2 of 3 comparable commitments, the relevant operating condition changed before the next scheduled review.',
    )
    expect(sentence).not.toMatch(/%/)
  })
})

describe('evidence shift', () => {
  test('resolves to the condition the template names', () => {
    const condition = evidenceShiftCondition(regional)
    expect(condition?.id).toBe('cac')
    expect(condition?.status).toBe('new_evidence')
  })
})

describe('suggested decision', () => {
  test('shows for the default template', () => {
    expect(showsSuggestedDecision(regional)).toBe(true)
  })

  // docs/README.md §"Suggested action" gates the row on all three holding.
  test('hidden when no capital is still in play', () => {
    const spent: ScenarioTemplate = {
      ...regional,
      plannedUncommittedCapital: 0,
      practicallyChangeableCapital: 0,
    }
    expect(showsSuggestedDecision(spent)).toBe(false)
  })

  test('hidden when the flexibility window has closed', () => {
    const lockedIn: ScenarioTemplate = { ...regional, flexibilityWindowDays: 0 }
    expect(showsSuggestedDecision(lockedIn)).toBe(false)
  })

  test('hidden when no condition has moved', () => {
    const steady: ScenarioTemplate = {
      ...regional,
      evidenceShiftConditionId: 'none-of-them',
    }
    expect(showsSuggestedDecision(steady)).toBe(false)
  })
})
