import {
  Actions,
  Button,
  DateField,
  DollarField,
  Field,
  PresenterLine,
  StepShell,
  Title,
} from '../../components/ui/ui'
import { num, type ApproveState } from './state'

export function Screen3({
  state,
  setState,
  onShow,
}: {
  state: ApproveState
  setState: (s: ApproveState) => void
  onShow: () => void
}) {
  const ready =
    num(state.economicallyCommitted) > 0 && state.nextReview !== '' && state.authority.trim() !== ''

  return (
    <StepShell>
      <Title>Your judgment has changed. Has the commitment?</Title>
      <PresenterLine>Three facts.</PresenterLine>

      <DollarField
        label="How much is already economically committed?"
        value={state.economicallyCommitted}
        onChange={(digits) => setState({ ...state, economicallyCommitted: digits })}
      />
      <DateField
        label="When is its next formal review?"
        value={state.nextReview}
        onChange={(e) => setState({ ...state, nextReview: e.target.value })}
      />
      <Field
        label="Who can materially change it?"
        placeholder="CFO + BU President"
        value={state.authority}
        onChange={(e) => setState({ ...state, authority: e.target.value })}
      />

      <Actions>
        <Button disabled={!ready} onClick={onShow}>
          Show me
        </Button>
      </Actions>
    </StepShell>
  )
}
