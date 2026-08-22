import { Screen1 } from './Screen1'
import { Screen2 } from './Screen2'
import { Screen3 } from './Screen3'
import { Screen4 } from './Screen4'
import type { CohortState } from './state'

export function Cohort({
  state,
  setState,
  onTryAnother,
}: {
  state: CohortState
  setState: (s: CohortState) => void
  onTryAnother: () => void
}) {
  if (state.screen === 1) {
    return (
      <Screen1
        state={state}
        setState={setState}
        onContinue={() => setState({ ...state, screen: 2 })}
        onClearData={onTryAnother}
      />
    )
  }

  if (state.screen === 2) {
    return (
      <Screen2
        state={state}
        onApplyLessons={() => setState({ ...state, screen: 3, screen3Visited: true })}
        onShowAsIs={() => setState({ ...state, screen: 4, appliedLessons: false })}
      />
    )
  }

  if (state.screen === 3) {
    return (
      <Screen3
        state={state}
        setState={setState}
        onCreate={() => setState({ ...state, screen: 4, appliedLessons: true })}
      />
    )
  }

  return (
    <Screen4
      state={state}
      onApplyLessons={() => setState({ ...state, screen: 3, screen3Visited: true })}
      onTryAnother={onTryAnother}
    />
  )
}
