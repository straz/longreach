import { governableCapital } from './compute'
import { Screen2A } from './Screen2A'
import { Screen2B } from './Screen2B'
import { Screen2Edit } from './Screen2Edit'
import { Screen2Zero } from './Screen2Zero'
import { num, type BOUDState } from './state'

export function Screen2({
  state,
  setState,
  onEditCapital,
  onTryAnother,
  onContinueToScreen3,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
  onEditCapital: () => void
  onTryAnother: () => void
  onContinueToScreen3: () => void
}) {
  const governable = governableCapital(num(state.capitalAuthorized), num(state.capitalCommitted))

  if (governable <= 0) {
    return <Screen2Zero onEditCapital={onEditCapital} onTryAnother={onTryAnother} />
  }

  if (!state.screen2Checked) {
    return <Screen2Edit state={state} setState={setState} />
  }

  const onEditInputs = () => setState({ ...state, screen2Checked: false })

  if (state.reconsiderationConditionMet) {
    return (
      <Screen2A state={state} setState={setState} onEditInputs={onEditInputs} onContinue={onContinueToScreen3} />
    )
  }

  return <Screen2B state={state} onEditInputs={onEditInputs} onContinue={onContinueToScreen3} />
}
