import { Screen1 } from './Screen1'
import { Screen2 } from './Screen2'
import { Screen3 } from './Screen3'
import { Screen3Yes } from './Screen3Yes'
import { Screen4 } from './Screen4'
import type { ApproveState } from './state'

export function Approve({
  state,
  setState,
}: {
  state: ApproveState
  setState: (s: ApproveState) => void
}) {
  if (state.screen === 1) {
    return <Screen1 state={state} setState={setState} />
  }

  if (state.screen === 2) {
    return (
      <Screen2
        state={state}
        setState={setState}
        onVerdict={(verdict) => setState({ ...state, verdict, screen: 3 })}
      />
    )
  }

  if (state.screen === 3) {
    if (state.verdict === 'yes') {
      return <Screen3Yes state={state} setState={setState} />
    }
    return <Screen3 state={state} setState={setState} onShow={() => setState({ ...state, screen: 4 })} />
  }

  return <Screen4 state={state} />
}
