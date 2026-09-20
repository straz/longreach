import { describe, expect, test } from 'vitest'

import {
  clarityBandText,
  copy,
  getDefaultScenario,
  getPack,
  manifest,
  resolveScenario,
  routing,
  scenarioForCommitmentType,
  scenariosById,
} from './content.ts'
import { capitalStillInPlay, comparablePattern, formatCapital } from './compute.ts'
import type { CommitmentType } from './types.ts'

const COMMITMENT_TYPES: CommitmentType[] = [
  'market_expansion',
  'technology_transformation',
  'acquisition_integration',
  'capital_expansion',
  'investment_allocation',
  'strategic_other',
]

describe('loading', () => {
  test('every template listed in the default pack is loaded', () => {
    const pack = getPack()
    expect(pack.templates.length).toBeGreaterThan(0)
    for (const id of pack.templates) {
      expect(scenariosById[id], `${id} is listed in manifest.yml but did not load`).toBeDefined()
    }
  })

  test('the canned path opens on the regional expansion program', () => {
    expect(getDefaultScenario().id).toBe('regional_expansion_v1')
    expect(manifest.defaultPack).toBe('standard')
  })
})

describe('scenario lookup', () => {
  // An unrecognized ?pack= or ?scenario= is a typo mid-demo. It must never
  // produce a broken screen (docs/PLAN.md §4.4).
  test('an unknown scenario id falls back to the pack default', () => {
    expect(resolveScenario('no_such_scenario').id).toBe('regional_expansion_v1')
  })

  test('an unknown pack falls back to the default pack', () => {
    expect(getPack('no_such_pack').defaultScenario).toBe('regional_expansion_v1')
  })

  test('an explicit scenario id is honoured', () => {
    expect(resolveScenario('integration_v1').id).toBe('integration_v1')
  })

  test('every commitment type reaches a template on the menu selection alone', () => {
    for (const type of COMMITMENT_TYPES) {
      const scenario = scenarioForCommitmentType(type)
      expect(scenario, `${type} did not route`).toBeDefined()
      expect(scenario.type).toBe(type)
    }
  })

  test('the recognizer fallback template exists', () => {
    expect(scenariosById[routing.fallbackScenario]).toBeDefined()
  })
})

describe('clarity bands', () => {
  // The score itself is never shown; it selects wording only. Which band set
  // is active is unresolved (docs/PLAN.md R5), so assert the boundaries of the
  // active one rather than its exact text.
  const bands = copy.confirm.bandSets[copy.confirm.activeBandSet]!

  test('the active set covers the whole 1-10 range', () => {
    expect(bands.at(-1)!.maxScore).toBe(10)
    for (let score = 1; score <= 10; score += 1) {
      expect(clarityBandText(score).length).toBeGreaterThan(0)
    }
  })

  test('a low score reads as a broad example, not a judgment of the visitor', () => {
    const low = clarityBandText(1)
    expect(low).toBe(clarityBandText(3))
    expect(low).not.toBe(clarityBandText(10))
    expect(low.toLowerCase()).not.toMatch(/you (did|failed|should)/)
  })

  test('an out-of-range score still returns copy', () => {
    expect(clarityBandText(99).length).toBeGreaterThan(0)
  })
})

describe('every template, not just the default', () => {
  const templates = Object.values(scenariosById)

  test('there are at least the five the spec names, plus the fallback', () => {
    expect(templates.length).toBeGreaterThanOrEqual(6)
  })

  test.each(templates.map((template) => [template.id, template] as const))(
    '%s is internally consistent',
    (_id, template) => {
      // The figure on the receipt matches the one the content matrix states.
      expect(formatCapital(capitalStillInPlay(template))).toBe(
        template.expectedCapitalStillInPlayLabel,
      )

      // Exactly one condition has moved, and the template points at it.
      const shifted = template.conditions.filter((c) => c.status === 'new_evidence')
      expect(shifted).toHaveLength(1)
      expect(shifted[0]!.id).toBe(template.evidenceShiftConditionId)

      // The pattern has to be demonstrable: some comparables moved early, but
      // not all of them, or there is no pattern to notice.
      const pattern = comparablePattern(template)
      expect(pattern.total).toBeGreaterThanOrEqual(3)
      expect(pattern.early).toBeGreaterThan(0)
      expect(pattern.early).toBeLessThan(pattern.total)
    },
  )
})
