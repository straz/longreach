import { Screen1 } from './Screen1'
import { Screen2 } from './Screen2'
import { Screen2Matches } from './Screen2Matches'
import { Screen3 } from './Screen3'
import { Screen4 } from './Screen4'
import type { ApproveState, Verdict } from './state'

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
    if (state.verdict === 'yes') {
      return <Screen2Matches />
    }
    return (
      <Screen2
        state={state}
        setState={setState}
        onVerdict={(verdict: Verdict) =>
          setState({ ...state, verdict, screen: verdict === 'yes' ? 2 : 3 })
        }
      />
    )
  }

  if (state.screen === 3) {
    return <Screen3 state={state} setState={setState} onShow={() => setState({ ...state, screen: 4 })} />
  }

  return <Screen4 state={state} />
}
