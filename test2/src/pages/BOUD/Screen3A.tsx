import {
  Actions,
  Button,
  BodyText,
  Eyebrow,
  Milestone,
  MutedText,
  SectionHeading,
  SimulatedField,
  StepShell,
  Title,
  formatDollars,
} from '../../components/ui/ui'
import { daysBetween, formatMonthDay, isOnOrBefore } from '../../lib/dates'
import { governableAfterEvent, governableCapital } from './compute'
import { num, type BOUDState } from './state'

export function Screen3A({
  state,
  setState,
  onEditDates,
  onContinue,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
  onEditDates: () => void
  onContinue: () => void
}) {
  const governable = governableCapital(num(state.capitalAuthorized), num(state.capitalCommitted))
  const becoming = num(state.capitalBecomingCommitted)
  const afterEvent = governableAfterEvent(governable, becoming)
  const days = daysBetween(state.capitalCommitmentDate, state.nextAuthorizedReview)

  const simulatedRemainsGovernable = state.simulatedReviewDate
    ? isOnOrBefore(state.simulatedReviewDate, state.capitalCommitmentDate)
    : null

  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <Title>YOUR AUTHORIZED REVIEW IS {days} DAYS AFTER THE NEXT ECONOMIC COMMITMENT</Title>

      <Milestone label="Today">{formatDollars(governable)} governable</Milestone>
      <Milestone label={formatMonthDay(state.capitalCommitmentDate)}>
        <span>{formatDollars(becoming)} becomes economically committed</span>
        <span>{formatDollars(afterEvent)} remains governable</span>
      </Milestone>
      <Milestone label={formatMonthDay(state.nextAuthorizedReview)}>
        {state.decisionAuthority} scheduled review
      </Milestone>

      <BodyText>
        {formatDollars(becoming)} of today's governable capital becomes economically committed
        before the authorized review.
      </BodyText>
      <MutedText>
        Longreach calls this <strong>Optionality Burn</strong>.
      </MutedText>

      <div>
        <SectionHeading>SIMULATE A DIFFERENT REVIEW DATE</SectionHeading>
        <SimulatedField
          label="Simulated review date"
          help="This does not change the recorded review date."
          type="date"
          value={state.simulatedReviewDate}
          onChange={(e) => setState({ ...state, simulatedReviewDate: e.target.value })}
        />
        {state.simulatedReviewDate && (
          <>
            <BodyText>
              Recorded review: {formatMonthDay(state.nextAuthorizedReview)}
              <br />
              Simulated review: {formatMonthDay(state.simulatedReviewDate)}
            </BodyText>
            <BodyText>
              {simulatedRemainsGovernable
                ? `At the simulated review, the ${formatDollars(becoming)} remains governable.`
                : `At the simulated review, the ${formatDollars(becoming)} has already become economically committed.`}
            </BodyText>
          </>
        )}
        <Actions>
          <Button variant="secondary" onClick={() => setState({ ...state, simulatedReviewDate: '' })}>
            RESET SIMULATION
          </Button>
        </Actions>
      </div>

      <Actions>
        <Button variant="secondary" onClick={onEditDates}>
          EDIT DATES
        </Button>
        <Button onClick={onContinue}>VIEW COMMITMENT RECORD →</Button>
      </Actions>
    </StepShell>
  )
}
