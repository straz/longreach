// Domain types for Longreach Decision Refresh.
//
// Transcribed from docs/README.md §"Scenario data and computation" and
// docs/ARCHITECTURE.md §"State suggestion". Keep them matching the spec: the
// YAML content files in content/ are authored against these shapes and
// scripts/check-content.ts validates against them.

export type CommitmentType =
  | 'market_expansion'
  | 'technology_transformation'
  | 'acquisition_integration'
  | 'capital_expansion'
  | 'investment_allocation'
  | 'strategic_other'

export type EvidenceShiftCategory =
  | 'economics'
  | 'demand'
  | 'cost'
  | 'schedule'
  | 'execution'
  | 'customer_retention'
  | 'regulatory'
  | 'unclear'

export interface DecisionCondition {
  id: string
  label: string
  watchedEvidence: string
  reconsiderationCondition: string
  status: 'within_range' | 'new_evidence'

  // Not in the spec's type. S1 shows the rationale and the conditions as one
  // table, so each condition carries the "why it was authorized" bullet that
  // belongs to it. The bullets themselves stay in `rationale`, which remains
  // the spec's canonical list; check-content.ts asserts the two hold exactly
  // the same sentences, so neither can drift from the other.
  why: string
}

export interface ComparableCommitment {
  year: string
  title: string
  relevantCondition: string
  evidenceShift: string
  whatHappenedNext: string
  changedBeforeScheduledReview: boolean
  reviewedAfterLockIn?: boolean
}

export interface ScenarioTemplate {
  id: string
  type: CommitmentType
  title: string
  amountLabel: string
  activeCommitmentText: string

  // Not in the spec's type. One or two sentences of plain business context,
  // shown under the commitment picker on S1 so the example reads as a real
  // plan rather than only an amount.
  description: string
  rationale: string[]
  conditions: DecisionCondition[]
  evidenceShiftConditionId: string
  evidenceShiftStatement: string
  evidenceShiftInterpretation: string
  plannedUncommittedCapital: number
  practicallyChangeableCapital: number
  irreversiblyCommittedCapital: number
  flexibilityWindowDays: number
  lockInDescription: string
  comparableCommitments: ComparableCommitment[]
  authority: string

  // Not in the spec's type. The individual accountable for the refresh, shown
  // on the receipt. Distinct from `authority`, which is the body the
  // commitment goes back to.
  owner: string

  // Not in the spec's type. The receipt's flexibility-window sentence cannot
  // be composed uniformly: four templates read "<n> days before <lock-in>
  // create a material lock-in", but the portfolio and fallback templates end
  // at the lock-in itself. Storing the whole sentence avoids branching on
  // template id. check-content.ts ties it back to the two structured fields —
  // it must start with "<flexibilityWindowDays> days before " and contain
  // lockInDescription — so the three cannot drift. See docs/PLAN.md §4.2.
  flexibilityWindowText: string

  // The receipt names the commitment without the leading verb phrase:
  // docs/README.md §S1 shows "Fund a $12M regional expansion program" on the
  // commitment card, §S3 shows "$12M regional expansion program" in the
  // receipt row. check-content.ts asserts one is a suffix of the other.
  receiptCommitmentText: string

  // Not in the spec's type and never rendered. Transcribed by hand from
  // docs/SCENARIO_CONTENT.md so check-content.ts can assert that the two
  // capital components actually format to the figure the content matrix
  // states. Deriving it from the components would make the check circular.
  // See docs/PLAN.md §4.2.
  expectedCapitalStillInPlayLabel: string
}

// docs/README.md §C1. `sourceText` is held in React state only: never
// persisted, never logged, never sent anywhere in v1 (docs/PLAN.md §5.1).
export interface CustomInput {
  commitmentType: CommitmentType
  briefContext?: string
  sourceText?: string
  focusOverride?: EvidenceShiftCategory
}

export type AppScreen =
  | 'landing'
  | 'customize'
  | 'recognizing'
  | 'confirm'
  | 'conditions'
  | 'comparables'
  | 'receipt'

export type AppMode = 'canned' | 'custom'

export type CustomizationStatus = 'recognized' | 'fallback'
