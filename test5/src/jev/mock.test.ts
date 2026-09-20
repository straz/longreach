import { describe, expect, test } from 'vitest'

import {
  clarityScore,
  classifyCommitmentType,
  classifyEvidenceShift,
  createMockRecognizer,
} from './mock.ts'
import { decideScenario } from '../routing.ts'
import { routing } from '../content.ts'

// The two worked examples from docs/JEV_RECOGNIZER_CONTRACT.md.
const CONTRACT_1 =
  'We approved an AI-enabled service automation rollout. Vendor cost is rising and implementation is two months late.'
const CONTRACT_2 = 'We need to reconsider an expansion plan.'

describe('contract example 1', () => {
  test('routes to the technology template on cost', () => {
    expect(classifyCommitmentType(CONTRACT_1)).toBe('technology_transformation')
    expect(classifyEvidenceShift(CONTRACT_1)).toBe('cost')
  })

  // The text matches cost, schedule and execution equally ("cost", "late",
  // "implementation"). The spec's expected output is cost, which is why the
  // order of evidenceShiftKeywords in routing.yml is load-bearing.
  test('breaks the three-way tie in the spec order', () => {
    expect(classifyEvidenceShift('cost late implementation')).toBe('cost')
  })

  // DISCREPANCY: the contract doc's illustrative output says 8. Applying
  // docs/README.md §"Clarity score approach" as written gives 7, because the
  // "+1 if the text exceeds 120 characters" rule does not fire — the example
  // is 114 characters. The normative rules win here; the two scores sit in the
  // same band either way under the active band set.
  test('scores 7 by the spec rules, not the 8 the example claims', () => {
    expect(CONTRACT_1.length).toBe(114)
    expect(clarityScore(CONTRACT_1)).toBe(7)
  })
})

describe('contract example 2', () => {
  test('scores 4 and reads the shift as unclear, exactly as documented', () => {
    expect(clarityScore(CONTRACT_2)).toBe(4)
    expect(classifyEvidenceShift(CONTRACT_2)).toBe('unclear')
  })

  // DISCREPANCY: the contract doc's expected output is market_expansion, but
  // "expansion" appears only in the capital_expansion keyword list in
  // docs/README.md, so the rules as written classify it that way.
  //
  // It reconciles at the routing layer: a score of 4 is below the override
  // threshold, so the visitor's own menu selection stands. Had they picked
  // "Market expansion or new product", they would get the market-expansion
  // template — which is the documented outcome.
  test('a weak reading does not override the menu selection', () => {
    expect(classifyCommitmentType(CONTRACT_2)).toBe('capital_expansion')
    expect(clarityScore(CONTRACT_2)).toBeLessThan(
      routing.commitmentCategoryOverrideMinScore,
    )

    const decision = decideScenario({
      selectedCommitmentType: 'market_expansion',
      recognition: {
        primaryCommitmentCategory: 'capital_expansion',
        evidenceShiftCategory: 'unclear',
        decisionConditionClarityScore: 4,
        commitmentSummary: '',
        contextSummary: '',
      },
    })
    expect(decision.commitmentType).toBe('market_expansion')
    expect(decision.recognizerOverrodeSelection).toBe(false)
  })

  test('a clear reading does override it', () => {
    const decision = decideScenario({
      selectedCommitmentType: 'market_expansion',
      recognition: {
        primaryCommitmentCategory: 'technology_transformation',
        evidenceShiftCategory: 'cost',
        decisionConditionClarityScore: 8,
        commitmentSummary: '',
        contextSummary: '',
      },
    })
    expect(decision.commitmentType).toBe('technology_transformation')
    expect(decision.scenario.id).toBe('technology_program_v1')
    expect(decision.recognizerOverrodeSelection).toBe(true)
  })
})

describe('keyword matching', () => {
  // Substring matching would route half the language to the technology
  // template, because "AI" is inside "available", "said" and "detail".
  test('matches whole words only', () => {
    expect(classifyCommitmentType('The details are available, as I said')).toBeUndefined()
    expect(classifyCommitmentType('Our AI rollout')).toBe('technology_transformation')
  })

  test('is case-insensitive', () => {
    expect(classifyCommitmentType('our erp migration')).toBe('technology_transformation')
  })

  test('the most-matched category wins', () => {
    expect(
      classifyCommitmentType('a plant and facility and capacity build, plus one customer'),
    ).toBe('capital_expansion')
  })

  test('nothing recognizable returns undefined rather than guessing', () => {
    expect(classifyCommitmentType('We should talk about this on Thursday.')).toBeUndefined()
    expect(classifyEvidenceShift('We should talk about this.')).toBe('unclear')
  })
})

describe('clarity score', () => {
  test('starts at the floor for an empty note', () => {
    expect(clarityScore('')).toBe(routing.clarityScore.start)
  })

  test('counts a currency amount', () => {
    const withoutAmount = clarityScore('Our platform rollout')
    expect(clarityScore('Our $20M platform rollout')).toBe(
      withoutAmount + routing.clarityScore.currencyAmount,
    )
  })

  test('never leaves the 1-10 range the contract defines', () => {
    const everything =
      'We approved a $60M ERP migration and platform automation programme in March; ' +
      'implementation cost is above budget, the timeline is late, adoption is below plan, ' +
      'and retention has moved, while the schedule slips by two quarters.'
    const score = clarityScore(everything)
    expect(score).toBeGreaterThanOrEqual(1)
    expect(score).toBeLessThanOrEqual(10)
  })
})

describe('what the recognizer returns', () => {
  test('summaries are pre-authored, never the visitor’s own words', async () => {
    const result = await createMockRecognizer().classify({
      text: 'Our secret project Orion is over budget',
      selectedCommitmentType: 'technology_transformation',
    })

    expect(result.contextSummary).toBe(routing.contextSummaries.cost)
    expect(result.commitmentSummary).not.toMatch(/Orion/)
    expect(result.contextSummary).not.toMatch(/Orion/)
  })

  test('falls back to the visitor’s selection when nothing is recognized', async () => {
    const result = await createMockRecognizer().classify({
      text: 'Thursday would suit us better.',
      selectedCommitmentType: 'acquisition_integration',
    })
    expect(result.primaryCommitmentCategory).toBe('acquisition_integration')
    expect(result.evidenceShiftCategory).toBe('unclear')
  })

  test('the error seam throws, so the fallback path can be exercised', async () => {
    await expect(
      createMockRecognizer('error').classify({
        text: 'anything',
        selectedCommitmentType: 'market_expansion',
      }),
    ).rejects.toThrow()
  })
})
