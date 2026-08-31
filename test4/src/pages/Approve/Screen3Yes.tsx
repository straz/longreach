import { useState } from 'react'
import { Actions, BodyText, Button, Field, Question, StepShell, Title } from '../../components/ui/ui'
import type { ApproveState } from './state'

export function Screen3Yes({
  state,
  setState,
}: {
  state: ApproveState
  setState: (s: ApproveState) => void
}) {
  const [resolved, setResolved] = useState<null | 'not-sure' | 'continue'>(null)
  const assumption = state.yesAssumption

  if (resolved === 'not-sure') {
    return (
      <StepShell>
        <BodyText>
          You would recommit the capital today. But the condition supporting that recommitment
          isn't explicit.
        </BodyText>
      </StepShell>
    )
  }

  if (resolved === 'continue') {
    const echo = assumption.trim().replace(/[.\s]+$/, '')
    return (
      <StepShell>
        <BodyText>
          Your YES depends on this: {echo}. What evidence would make you reconsider that?
        </BodyText>
      </StepShell>
    )
  }

  return (
    <StepShell>
      <Title>Good. Has the evidence earned that confidence?</Title>
      <BodyText>You would make the same commitment today.</BodyText>
      <Question>
        What is the most important assumption that still has to be true for that YES to remain a YES?
      </Question>
      <Field
        label="Your assumption"
        placeholder="One sentence."
        value={assumption}
        onChange={(e) => setState({ ...state, yesAssumption: e.target.value })}
      />
      <Actions>
        <Button variant="secondary" onClick={() => setResolved('not-sure')}>
          I'M NOT SURE
        </Button>
        <Button disabled={assumption.trim() === ''} onClick={() => setResolved('continue')}>
          CONTINUE
        </Button>
      </Actions>
    </StepShell>
  )
}
