import type { CohortState } from './state'

export const STEPS: { screen: CohortState['screen']; label: string }[] = [
  { screen: 1, label: 'Commitment' },
  { screen: 2, label: 'Reflection' },
  { screen: 3, label: 'Lessons' },
  { screen: 4, label: 'Record' },
]

// Screen 3 is only reachable if the user chose to apply the cohort lessons,
// so it can be skipped entirely (Screen 2 "NO" goes straight to Screen 4).
export function isStepVisited(state: CohortState, screen: CohortState['screen']): boolean {
  if (screen === 1) return state.screen > 1
  if (screen === 2) return state.screen > 2
  if (screen === 3) return state.screen3Visited && state.screen > 3
  return false
}

// Returns to Screen 1 and clears only navigation/outcome state — keeps every
// entered value, distinct from "Clear data" which wipes storage entirely.
export function startOver(state: CohortState): CohortState {
  return { ...state, screen: 1, screen3Visited: false, appliedLessons: null }
}

export function goToScreen(state: CohortState, screen: CohortState['screen']): CohortState {
  if (screen === 1) {
    return startOver(state)
  }
  return { ...state, screen }
}
