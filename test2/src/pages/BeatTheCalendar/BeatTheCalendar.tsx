import { useSessionState } from '../../lib/sessionState'
import { InputStep } from './InputStep'
import { BaselineStep } from './BaselineStep'
import { RevealStep } from './RevealStep'
import { SESSION_KEY, initialBeatTheCalendarState } from './state'

export function BeatTheCalendar() {
  const [state, setState, clear] = useSessionState(SESSION_KEY, initialBeatTheCalendarState)

  const goTo = (step: number) => setState({ ...state, step })

  switch (state.step) {
    case 0:
      return <InputStep state={state} setState={setState} onContinue={() => goTo(1)} />
    case 1:
      return <BaselineStep state={state} onContinue={() => goTo(2)} />
    case 2:
    default:
      return <RevealStep state={state} setState={setState} onDoAnother={clear} />
  }
}
