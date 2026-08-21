import { Actions, Button, BodyText, Eyebrow, Milestone, StepShell, Title, formatDollars } from '../../components/ui/ui'
import { formatMonthDay } from '../../lib/dates'
import { governableAfterEvent, governableCapital } from './compute'
import { num, type BOUDState } from './state'

export function Screen3B({
  state,
  onEditDates,
  onContinue,
}: {
  state: BOUDState
  onEditDates: () => void
  onContinue: () => void
}) {
  const governable = governableCapital(num(state.capitalAuthorized), num(state.capitalCommitted))
  const becoming = num(state.capitalBecomingCommitted)
  const afterEvent = governableAfterEvent(governable, becoming)

  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <Title>AUTHORIZED REVIEW PRECEDES THE NEXT ECONOMIC COMMITMENT</Title>

      <Milestone label="Today">{formatDollars(governable)} governable</Milestone>
      <Milestone label={formatMonthDay(state.nextAuthorizedReview)}>
        <span>{state.decisionAuthority} scheduled review</span>
        <span>{formatDollars(governable)} remains governable</span>
      </Milestone>
      <Milestone label={formatMonthDay(state.capitalCommitmentDate)}>
        <span>{formatDollars(becoming)} becomes economically committed</span>
        <span>{formatDollars(afterEvent)} remains governable</span>
      </Milestone>

      <BodyText>The {formatDollars(becoming)} remains governable when the authorized review occurs.</BodyText>

      <Actions>
        <Button variant="secondary" onClick={onEditDates}>
          EDIT DATES
        </Button>
        <Button onClick={onContinue}>VIEW COMMITMENT RECORD →</Button>
      </Actions>
    </StepShell>
  )
}
