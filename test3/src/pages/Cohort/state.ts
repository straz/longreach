export type CohortState = {
  screen: 1 | 2 | 3 | 4
  screen3Visited: boolean
  // null until Screen 4 is reached; true = arrived via "CREATE THE COMMITMENT"
  // (Screen 3A), false = arrived via "NO — SHOW ME THE RECORD AS-IS" (Screen 2).
  appliedLessons: boolean | null

  commitment: string
  capital: string
  criticalResult: string

  explicitAssumption: boolean
  reconsiderationCondition: boolean
  reconsiderationThreshold: string
  preserveAlternative: boolean
}

export const initialCohortState: CohortState = {
  screen: 1,
  screen3Visited: false,
  appliedLessons: null,

  commitment: '',
  capital: '',
  criticalResult: '',

  explicitAssumption: true,
  reconsiderationCondition: true,
  reconsiderationThreshold: '40',
  preserveAlternative: true,
}

export const STORAGE_KEY = 'cohort-state'

export function num(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}
