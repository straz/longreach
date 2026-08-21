import {
  Actions,
  Button,
  BodyText,
  Eyebrow,
  FactCard,
  FactRow,
  SectionHeading,
  StepShell,
  Title,
  formatDollars,
} from '../../components/ui/ui'
import { formatDateLong } from '../../lib/dates'
import {
  governableAfterEvent,
  governableCapital,
  optionalityBurn,
  reviewOnOrBeforeCommitment,
  timingDifferenceDays,
} from './compute'
import { num, type BOUDState } from './state'

export function Screen4({
  state,
  onEditCommitment,
  onTryAnother,
}: {
  state: BOUDState
  onEditCommitment: () => void
  onTryAnother: () => void
}) {
  const authorized = num(state.capitalAuthorized)
  const committed = num(state.capitalCommitted)
  const governable = governableCapital(authorized, committed)

  const becoming = num(state.capitalBecomingCommitted)
  const afterEvent = governableAfterEvent(governable, becoming)

  const reviewFirst = reviewOnOrBeforeCommitment(state.nextAuthorizedReview, state.capitalCommitmentDate)
  const burn = optionalityBurn(becoming, !reviewFirst)
  const days = timingDifferenceDays(state.capitalCommitmentDate, state.nextAuthorizedReview)

  const conditionMet = state.reconsiderationConditionMet === true

  const reaffirmationLabel: Record<string, string> = {
    Reaffirmed: 'REAFFIRMED',
    'Not reaffirmed': 'NOT REAFFIRMED',
    'Not recorded': 'NOT RECORDED',
    'Not required by this condition': 'NOT REQUIRED BY THIS CONDITION',
  }

  return (
    <StepShell>
      <Title>COMMITMENT RECORD</Title>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>

      <SectionHeading>Capital</SectionHeading>
      <FactCard>
        <FactRow label="Authorized" value={formatDollars(authorized)} />
        <FactRow label="Economically committed today" value={formatDollars(committed)} />
        <FactRow label="Governable today" value={formatDollars(governable)} />
      </FactCard>

      <SectionHeading>Original judgment</SectionHeading>
      <FactCard>
        <FactRow
          label="Expected result"
          value={`${formatDollars(num(state.originalExpectation))} ${state.expectedResultLabel}`}
        />
        <FactRow label="Reconsider below" value={formatDollars(num(state.reconsiderBelow))} />
        <FactRow label="Current estimate" value={formatDollars(num(state.currentEstimate))} />
        <FactRow label="Reconsideration condition" value={conditionMet ? 'MET' : 'NOT MET'} />
      </FactCard>

      <SectionHeading>Authorized response</SectionHeading>
      <FactCard>
        <FactRow label="Decision authority" value={state.decisionAuthority} />
        <FactRow
          label="Reaffirmation under current evidence"
          value={state.reaffirmationStatus ? reaffirmationLabel[state.reaffirmationStatus] : 'NOT REQUIRED BY THIS CONDITION'}
        />
      </FactCard>

      <SectionHeading>Next capital state change</SectionHeading>
      <FactCard>
        <FactRow label="Capital becoming economically committed" value={formatDollars(becoming)} />
        <FactRow label="Date" value={formatDateLong(state.capitalCommitmentDate)} />
        <FactRow label="Governable before event" value={formatDollars(governable)} />
        <FactRow label="Governable after event" value={formatDollars(afterEvent)} />
        <FactRow label="Next authorized review" value={formatDateLong(state.nextAuthorizedReview)} />
        <FactRow
          label="Timing difference"
          value={`Review occurs ${days} days ${reviewFirst ? 'before' : 'after'} the economic commitment.`}
        />
        <FactRow label="Capital becoming committed before review" value={formatDollars(burn)} />
      </FactCard>

      <SectionHeading>Computed relationships</SectionHeading>
      {conditionMet && (
        <FactCard>
          <FactRow label="Inherited Authority" value={`${formatDollars(governable)} was still governable when the specified reconsideration condition was met.`} />
          <FactRow
            label="Subsequent judgment"
            value={state.reaffirmationStatus ? reaffirmationLabel[state.reaffirmationStatus] : 'NOT RECORDED'}
          />
        </FactCard>
      )}
      {!reviewFirst && (
        <FactCard>
          <FactRow
            label="Optionality Burn"
            value={`${formatDollars(becoming)} becomes economically committed before the next authorized review.`}
          />
        </FactCard>
      )}

      <BodyText>
        You supplied the facts. Longreach connected the commitment, the evidence, the authority,
        and what remains changeable.
      </BodyText>

      <Actions>
        <Button onClick={onTryAnother}>TRY ANOTHER COMMITMENT →</Button>
        <Button variant="secondary" onClick={onEditCommitment}>
          EDIT THIS COMMITMENT
        </Button>
      </Actions>
    </StepShell>
  )
}
