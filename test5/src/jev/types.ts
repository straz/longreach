// The recognizer boundary, transcribed from docs/JEV_RECOGNIZER_CONTRACT.md.
//
// v1 ships the mock implementation only. This interface exists from day one so
// that swapping in a real Jev call — through a Worker proxy that holds the API
// key server-side — touches one file. See docs/PLAN.md §6.

import type { CommitmentType, EvidenceShiftCategory } from '../types.ts'

export interface JevRecognitionResult {
  primaryCommitmentCategory: CommitmentType
  evidenceShiftCategory: EvidenceShiftCategory
  decisionConditionClarityScore: number // integer 1-10
  commitmentSummary: string // <= 20 words
  contextSummary: string // <= 20 words
}

export interface JevRecognizer {
  classify(input: {
    text: string
    selectedCommitmentType: CommitmentType
    focusOverride?: EvidenceShiftCategory
  }): Promise<JevRecognitionResult>
}
