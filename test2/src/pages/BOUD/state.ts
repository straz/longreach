export type ReaffirmationStatus =
  | 'Reaffirmed'
  | 'Not reaffirmed'
  | 'Not recorded'
  | 'Not required by this condition'
  | null

export type BOUDState = {
  screen: 1 | 2 | 3 | 4
  screen2Checked: boolean
  screen3Checked: boolean

  commitment: string
  capitalAuthorized: string
  capitalCommitted: string

  expectedResultLabel: string
  originalExpectation: string
  reconsiderBelow: string
  currentEstimate: string
  decisionAuthority: string

  reconsiderationConditionMet: boolean | null
  reaffirmationStatus: ReaffirmationStatus

  capitalBecomingCommitted: string
  capitalCommitmentDate: string
  nextAuthorizedReview: string

  simulatedReviewDate: string
}

export const initialBOUDState: BOUDState = {
  screen: 1,
  screen2Checked: false,
  screen3Checked: false,

  commitment: '',
  capitalAuthorized: '',
  capitalCommitted: '',

  expectedResultLabel: '',
  originalExpectation: '',
  reconsiderBelow: '',
  currentEstimate: '',
  decisionAuthority: '',

  reconsiderationConditionMet: null,
  reaffirmationStatus: null,

  capitalBecomingCommitted: '',
  capitalCommitmentDate: '',
  nextAuthorizedReview: '',

  simulatedReviewDate: '',
}

export const STORAGE_KEY = 'boud-state'

export function num(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}
