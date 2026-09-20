// The local recognizer. Deterministic, offline, and the only implementation
// in v1 (docs/PLAN.md §6.2).
//
// It routes; it does not understand. Everything it returns either names a
// category or comes from a pre-authored sentence in content/routing.yml, so it
// cannot assert a fact about the visitor's business — which the recognizer
// contract forbids and which is the demo's main reputational risk.

import { getScenario, routing } from '../content.ts'
import type { CommitmentType, EvidenceShiftCategory } from '../types.ts'
import type { JevRecognitionResult, JevRecognizer } from './types.ts'

/** How the mock should behave, for demonstrating and testing the fallback. */
export type Simulate = 'none' | 'slow' | 'error'

const CURRENCY =
  /(\$\s?[\d,.]+)|(\b\d[\d,.]*\s?(m|mm|bn|k|million|billion|thousand)\b)|\b(dollars?|usd|eur|gbp)\b/i

function mentions(text: string, word: string): boolean {
  // Whole words only. Substring matching would find "AI" inside "available".
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
}

function countHits(text: string, words: string[]): number {
  return words.filter((word) => mentions(text, word)).length
}

/**
 * Most matches wins. Ties go to `preferred` when it is among the leaders, and
 * otherwise to whichever is declared first in routing.yml. Returns undefined
 * when nothing matches at all.
 */
function bestMatch<T extends string>(
  text: string,
  groups: Record<string, string[]>,
  preferred?: string,
): T | undefined {
  let best: { key: string; hits: number } | undefined
  let preferredHits = 0
  for (const [key, words] of Object.entries(groups)) {
    const hits = countHits(text, words)
    if (key === preferred) preferredHits = hits
    if (hits > 0 && (best === undefined || hits > best.hits)) best = { key, hits }
  }
  if (best === undefined) return undefined
  // A tie is an absence of evidence, not a reason to overrule the visitor.
  // Several keywords sit in more than one list — "migration" is in both the
  // technology and acquisition sets — so without this, "churn has climbed
  // since we started the migration" pulls someone who chose "Acquisition or
  // integration" over to the technology example.
  if (preferred !== undefined && preferredHits === best.hits) return preferred as T
  return best.key as T
}

export function classifyCommitmentType(
  text: string,
  preferred?: CommitmentType,
): CommitmentType | undefined {
  return bestMatch<CommitmentType>(text, routing.commitmentKeywords, preferred)
}

export function classifyEvidenceShift(text: string): EvidenceShiftCategory {
  return bestMatch<EvidenceShiftCategory>(text, routing.evidenceShiftKeywords) ?? 'unclear'
}

/**
 * docs/README.md §"Clarity score approach", implemented exactly as written.
 *
 * The score is never shown to the visitor and is never a judgment of them: it
 * chooses one of the C3 band sentences, and decides whether the recognizer may
 * override the commitment type they selected.
 */
export function clarityScore(text: string): number {
  const weights = routing.clarityScore
  let score = weights.start

  if (classifyCommitmentType(text) !== undefined) score += weights.commitmentKeyword
  if (classifyEvidenceShift(text) !== 'unclear') score += weights.evidenceShiftKeyword
  if (CURRENCY.test(text)) score += weights.currencyAmount
  if (countHits(text, routing.timingWords) > 0) score += weights.timingWord

  const clauses = text.split(/[.;:]|,\s+(?:and|but|while|although)\b/i).filter(
    (clause) => clause.trim().length > 0,
  )
  if (text.length > weights.longMinChars && clauses.length > 1) score += weights.longWithClauses

  return Math.min(weights.max, Math.max(weights.min, score))
}

export function createMockRecognizer(simulate: Simulate = 'none'): JevRecognizer {
  return {
    async classify({ text, selectedCommitmentType }) {
      if (simulate === 'error') {
        throw new Error('simulated recognizer failure')
      }
      if (simulate === 'slow') {
        // Longer than the caller's budget, so the fallback path runs.
        await new Promise((resolve) => setTimeout(resolve, 10_000))
      }

      const evidenceShiftCategory = classifyEvidenceShift(text)
      const recognized = classifyCommitmentType(text, selectedCommitmentType)
      const primaryCommitmentCategory = recognized ?? selectedCommitmentType

      // Both summaries are derived, never generated. The commitment summary
      // names the illustrative template that was matched; the context summary
      // is a pre-authored sentence about the kind of condition that moved.
      const template = getScenario(routing.typeToScenario[primaryCommitmentCategory])

      const result: JevRecognitionResult = {
        primaryCommitmentCategory,
        evidenceShiftCategory,
        decisionConditionClarityScore: clarityScore(text),
        commitmentSummary: template?.title ?? '',
        contextSummary: routing.contextSummaries[evidenceShiftCategory],
      }
      return result
    },
  }
}
