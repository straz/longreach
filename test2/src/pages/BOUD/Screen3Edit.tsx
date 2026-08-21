import {
  Actions,
  Button,
  DollarField,
  ErrorText,
  Eyebrow,
  FactCard,
  FactRow,
  Field,
  MutedText,
  Question,
  StepShell,
  Title,
  formatDollars,
} from '../../components/ui/ui'
import { formatMonthDay } from '../../lib/dates'
import { governableAfterEvent, governableCapital } from './compute'
import { num, type BOUDState } from './state'

export function Screen3Edit({
  state,
  setState,
  onCheck,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
  onCheck: () => void
}) {
  const governable = governableCapital(num(state.capitalAuthorized), num(state.capitalCommitted))
  const becoming = num(state.capitalBecomingCommitted)
  const afterEvent = governableAfterEvent(governable, becoming)

  const exceedsGovernable = becoming > governable
  const canCheck =
    becoming > 0 && !exceedsGovernable && !!state.capitalCommitmentDate && !!state.nextAuthorizedReview

  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <MutedText>
        <strong>{formatDollars(governable)} governable today</strong>
      </MutedText>

      <Title>WHAT BECOMES HARDER TO CHANGE NEXT?</Title>
      <Question>
        What is the next technical, contractual, or operating commitment that materially reduces
        your ability to redirect this capital?
      </Question>

      <DollarField
        label="Capital becoming economically committed"
        value={state.capitalBecomingCommitted}
        onChange={(digits) => setState({ ...state, capitalBecomingCommitted: digits })}
      />
      <Field
        label="Date this becomes economically committed"
        type="date"
        value={state.capitalCommitmentDate}
        onChange={(e) => setState({ ...state, capitalCommitmentDate: e.target.value })}
      />

      <FactCard>
        <FactRow label="Governable capital today" value={formatDollars(governable)} />
        <FactRow
          label={`After ${formatMonthDay(state.capitalCommitmentDate) || 'event'}`}
          value={formatDollars(afterEvent)}
        />
      </FactCard>

      {exceedsGovernable && (
        <ErrorText>
          Amount becoming economically committed cannot exceed the {formatDollars(governable)}{' '}
          currently governable.
        </ErrorText>
      )}

      <Question>When are the people with authority next scheduled to reconsider this commitment?</Question>
      <Field
        label="Next authorized review"
        type="date"
        value={state.nextAuthorizedReview}
        onChange={(e) => setState({ ...state, nextAuthorizedReview: e.target.value })}
      />
      <MutedText>Decision authority: {state.decisionAuthority}</MutedText>

      <Actions>
        <Button disabled={!canCheck} onClick={onCheck}>
          CHECK THE CALENDAR →
        </Button>
      </Actions>
    </StepShell>
  )
}
