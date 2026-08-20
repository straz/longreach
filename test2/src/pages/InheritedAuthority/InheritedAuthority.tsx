import { useSessionState } from '../../lib/sessionState'
import { InputStep } from './InputStep'
import { ReadbackStep } from './ReadbackStep'
import { ElicitationStep } from './ElicitationStep'
import { RevealStep } from './RevealStep'
import { SESSION_KEY, initialInheritedAuthorityState } from './state'

export function InheritedAuthority() {
  const [state, setState, clear] = useSessionState(SESSION_KEY, initialInheritedAuthorityState)

  const goTo = (step: number) => setState({ ...state, step })

  switch (state.step) {
    case 0:
      return <InputStep state={state} setState={setState} onContinue={() => goTo(1)} />
    case 1:
      return <ReadbackStep state={state} onContinue={() => goTo(2)} />
    case 2:
      return (
        <ElicitationStep
          eyebrow="The crucial elicitation"
          question="When you approved this, what evidence would have made you want the decision back on your desk — not evidence that proved it had failed, just evidence that meant it deserved another look?"
          label="Reconsider below"
          suffix="%"
          type="number"
          value={state.reconsiderBelowPct}
          onChange={(v) => setState({ ...state, reconsiderBelowPct: v })}
          onContinue={() => goTo(3)}
        />
      )
    case 3:
      return (
        <ElicitationStep
          eyebrow="The crucial elicitation"
          question="Who has the authority to make that call?"
          label="Authority"
          value={state.authorityHolder}
          onChange={(v) => setState({ ...state, authorityHolder: v })}
          onContinue={() => goTo(4)}
        />
      )
    case 4:
    default:
      return <RevealStep state={state} setState={setState} onDoAnother={clear} />
  }
}
