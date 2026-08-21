import { Screen1 } from './Screen1'
import { Screen2 } from './Screen2'
import { Screen3 } from './Screen3'
import { Screen4 } from './Screen4'
import type { BOUDState } from './state'

export function BOUD({
  state,
  setState,
  onTryAnother,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
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
        setState={setState}
        onEditCapital={() => setState({ ...state, screen: 1 })}
        onTryAnother={onTryAnother}
        onContinueToScreen3={() => setState({ ...state, screen: 3 })}
      />
    )
  }

  if (state.screen === 3) {
    return <Screen3 state={state} setState={setState} onContinueToScreen4={() => setState({ ...state, screen: 4 })} />
  }

  return (
    <Screen4
      state={state}
      onEditCommitment={() => setState({ ...state, screen: 1 })}
      onTryAnother={onTryAnother}
    />
  )
}
