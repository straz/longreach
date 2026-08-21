import type { BOUDState } from './state'

export const STEPS: { screen: BOUDState['screen']; label: string }[] = [
  { screen: 1, label: 'Budget' },
  { screen: 2, label: 'Judgment' },
  { screen: 3, label: 'Calendar' },
  { screen: 4, label: 'Record' },
]

// Returns to Screen 1 and re-opens Screens 2/3 as editable, but keeps every
// entered value — distinct from "Clear data", which wipes storage entirely.
export function startOver(state: BOUDState): BOUDState {
  return { ...state, screen: 1, screen2Checked: false, screen3Checked: false }
}

// Jumps to an already-visited screen (breadcrumb navigation). Screen 1 is a
// full startOver (keeps data, re-opens everything downstream as editable);
// jumping to 2 or 3 re-opens just that screen as editable so its result gets
// explicitly re-checked rather than showing a possibly stale verdict.
export function goToScreen(state: BOUDState, screen: BOUDState['screen']): BOUDState {
  if (screen === 1) {
    return startOver(state)
  }
  if (screen === 2) {
    return { ...state, screen, screen2Checked: false }
  }
  if (screen === 3) {
    return { ...state, screen, screen3Checked: false }
  }
  return { ...state, screen }
}
