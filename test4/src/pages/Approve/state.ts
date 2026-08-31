export type Screen = 1 | 2 | 3 | 4
export type Verdict = 'yes' | 'no' | 'check'

export type ApproveState = {
  screen: Screen

  // Screen 1 — the executive's own words
  utterance: string

  // Screen 2 — the mirror (editable, seeded by the Worker parse)
  name: string
  authorized: string // digits only, whole US dollars
  expectedOutcome: string
  completion: string // free text, e.g. "June 2027"

  // Screen 2 — the verdict
  verdict: Verdict | null

  // Screen 3 (NO / I'D NEED TO CHECK) — the three facts
  economicallyCommitted: string // digits only, whole US dollars
  nextReview: string // ISO date, yyyy-mm-dd
  authority: string

  // Screen 3 (YES) — the assumption the YES rests on
  yesAssumption: string
}

export const initialApproveState: ApproveState = {
  screen: 1,
  utterance: '',
  name: '',
  authorized: '',
  expectedOutcome: '',
  completion: '',
  verdict: null,
  economicallyCommitted: '',
  nextReview: '',
  authority: '',
  yesAssumption: '',
}

export const STORAGE_KEY = 'test4-state'

export function num(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}
