import {
  Actions,
  Button,
  DollarField,
  ErrorText,
  Eyebrow,
  Field,
  MutedText,
  Question,
  StepShell,
  Title,
  formatDollars,
} from '../../components/ui/ui'
import { governableCapital, reconsiderationConditionMet } from './compute'
import { num, type BOUDState } from './state'

export function Screen2Edit({
  state,
  setState,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
}) {
  const authorized = num(state.capitalAuthorized)
  const committed = num(state.capitalCommitted)
  const governable = governableCapital(authorized, committed)

  const originalExpectation = num(state.originalExpectation)
  const reconsiderBelow = num(state.reconsiderBelow)

  const bothThresholdsProvided = state.originalExpectation !== '' && state.reconsiderBelow !== ''
  const thresholdInvalid = bothThresholdsProvided && reconsiderBelow >= originalExpectation
  const canCheck =
    !thresholdInvalid &&
    state.expectedResultLabel.trim() !== '' &&
    bothThresholdsProvided &&
    state.currentEstimate !== '' &&
    state.decisionAuthority.trim() !== ''

  const handleCheck = () => {
    const met = reconsiderationConditionMet(num(state.currentEstimate), reconsiderBelow)
    // Every re-evaluation of the condition must invalidate a reaffirmation
    // answer that no longer matches: NOT MET always forces the "not required"
    // status, and a stale "not required" from a prior NOT MET result must not
    // survive into a newly MET condition.
    const reaffirmationStatus = met
      ? state.reaffirmationStatus === 'Not required by this condition'
        ? null
        : state.reaffirmationStatus
      : 'Not required by this condition'
    setState({
      ...state,
      screen2Checked: true,
      reconsiderationConditionMet: met,
      reaffirmationStatus,
    })
  }

  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <MutedText>
        {formatDollars(authorized)} authorized · {formatDollars(committed)} economically committed ·{' '}
        <strong>{formatDollars(governable)} governable</strong>
      </MutedText>

      <Title>WHAT DID THIS DECISION DEPEND ON?</Title>

      <Question>What measurable result mattered to the original authorization?</Question>
      <Field
        label="Expected result"
        value={state.expectedResultLabel}
        onChange={(e) => setState({ ...state, expectedResultLabel: e.target.value })}
      />

      <DollarField
        label="Original expectation"
        value={state.originalExpectation}
        onChange={(digits) => setState({ ...state, originalExpectation: digits })}
      />

      <Question>
        When you approved this commitment, below what result would you have wanted the decision
        brought back for another look?
      </Question>
      <DollarField
        label="Reconsider below"
        help="This is a reconsideration condition, not a failure threshold."
        value={state.reconsiderBelow}
        onChange={(digits) => setState({ ...state, reconsiderBelow: digits })}
      />

      <DollarField
        label="Best current estimate"
        value={state.currentEstimate}
        onChange={(digits) => setState({ ...state, currentEstimate: digits })}
      />

      <Question>Who has authority to reconsider this commitment?</Question>
      <Field
        label="Authority to reconsider"
        value={state.decisionAuthority}
        onChange={(e) => setState({ ...state, decisionAuthority: e.target.value })}
      />

      {thresholdInvalid && (
        <ErrorText>&ldquo;Reconsider below&rdquo; must be lower than the original expectation.</ErrorText>
      )}

      <Actions>
        <Button disabled={!canCheck} onClick={handleCheck}>
          CHECK THE COMMITMENT →
        </Button>
      </Actions>
    </StepShell>
  )
}
