// Turns "what the visitor picked" plus "what the recognizer read" into one
// scenario template.
//
// The menu selection is the fallback source of truth (docs/ARCHITECTURE.md
// §"Template routing"): with no text, it decides alone. The recognizer may
// override the category only when there was text and the reading was clear
// enough, because a weak reading of a short note is a worse guide than what
// the visitor actually chose.
//
// Nothing here varies the flow. Only the copy and the illustrative data
// change; every visitor sees the same three screens.

import { routing, scenarioForCommitmentType } from './content.ts'
import type {
  CommitmentType,
  EvidenceShiftCategory,
  ScenarioTemplate,
} from './types.ts'
import type { JevRecognitionResult } from './jev/types.ts'

export interface RoutingDecision {
  scenario: ScenarioTemplate
  commitmentType: CommitmentType
  evidenceShiftCategory: EvidenceShiftCategory
  /** Whether the recognizer's category was used instead of the selection. */
  recognizerOverrodeSelection: boolean
}

export function decideScenario({
  selectedCommitmentType,
  recognition,
  focusOverride,
  packId,
}: {
  selectedCommitmentType: CommitmentType
  recognition?: JevRecognitionResult
  focusOverride?: EvidenceShiftCategory
  packId?: string
}): RoutingDecision {
  const clearEnough =
    recognition !== undefined &&
    recognition.decisionConditionClarityScore >= routing.commitmentCategoryOverrideMinScore

  const commitmentType =
    clearEnough && recognition !== undefined
      ? recognition.primaryCommitmentCategory
      : selectedCommitmentType

  // An explicit focus supersedes the recognizer's reading (docs/ARCHITECTURE.md).
  const evidenceShiftCategory =
    focusOverride ?? recognition?.evidenceShiftCategory ?? 'unclear'

  return {
    scenario: scenarioForCommitmentType(commitmentType, packId),
    commitmentType,
    evidenceShiftCategory,
    recognizerOverrodeSelection:
      clearEnough && commitmentType !== selectedCommitmentType,
  }
}

/** docs/README.md §C1: the exact over-length message, or nothing. */
export function sourceTextError(sourceText: string, message: string): string | undefined {
  return sourceText.length > routing.limits.sourceTextMaxChars ? message : undefined
}

/** What the recognizer is given: brief context and pasted note together. */
export function recognizerText(briefContext: string, sourceText: string): string {
  return [briefContext.trim(), sourceText.trim()].filter(Boolean).join('\n\n')
}
