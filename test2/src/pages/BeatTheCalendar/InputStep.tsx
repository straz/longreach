import { Actions, Button, DollarField, Eyebrow, Field, StepShell, Title } from '../../components/ui/ui'
import type { BeatTheCalendarState } from './state'

export function InputStep({
  state,
  setState,
  onContinue,
}: {
  state: BeatTheCalendarState
  setState: (s: BeatTheCalendarState) => void
  onContinue: () => void
}) {
  const canContinue =
    state.commitment.trim() &&
    state.changeableCapital &&
    state.irreversibleAmount &&
    state.irreversibleDate &&
    state.reviewDate

  return (
    <StepShell>
      <Eyebrow>Beat the Calendar</Eyebrow>
      <Title>Give me a commitment you’re actively discussing.</Title>
      <Field
        label="Commitment"
        placeholder="e.g. Cloud Migration Program"
        value={state.commitment}
        onChange={(e) => setState({ ...state, commitment: e.target.value })}
      />
      <DollarField
        label="Capital currently changeable"
        placeholder="$18,000,000"
        value={state.changeableCapital}
        onChange={(digits) => setState({ ...state, changeableCapital: digits })}
      />
      <DollarField
        label="Next economically difficult-to-reverse commitment"
        placeholder="$6,000,000"
        value={state.irreversibleAmount}
        onChange={(digits) => setState({ ...state, irreversibleAmount: digits })}
      />
      <Field
        label="Date that happens"
        type="date"
        value={state.irreversibleDate}
        onChange={(e) => setState({ ...state, irreversibleDate: e.target.value })}
      />
      <Field
        label="Next scheduled executive review"
        type="date"
        value={state.reviewDate}
        onChange={(e) => setState({ ...state, reviewDate: e.target.value })}
      />
      <Actions>
        <Button disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      </Actions>
    </StepShell>
  )
}
