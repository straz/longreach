import {
  Actions,
  BodyText,
  Button,
  Eyebrow,
  FactCard,
  FactRow,
  SectionHeading,
  StepShell,
  Title,
  formatDollars,
} from '../../components/ui/ui'
import { CANDIDATE_ALTERNATIVE, lostAlternativeFinding, reconsiderationLatencyFinding } from './data'
import { num, type CohortState } from './state'

export function Screen4({
  state,
  onApplyLessons,
  onTryAnother,
}: {
  state: CohortState
  onApplyLessons: () => void
  onTryAnother: () => void
}) {
  const capital = formatDollars(num(state.capital))

  if (state.appliedLessons === false) {
    return (
      <StepShell>
        <Title>YOUR CURRENT COMMITMENT</Title>
        <FactCard>
          <FactRow label="Commitment" value={state.commitment} />
          <FactRow label="Under consideration" value={capital} />
          <FactRow label="Critical result" value={state.criticalResult} />
          <FactRow label="Explicit reconsideration condition" value="Not recorded" />
          <FactRow label="Preserved alternative" value="Not recorded" />
        </FactCard>
        <BodyText>Your historical cohort contains evidence that could have informed both fields.</BodyText>
        <Actions>
          <Button onClick={onApplyLessons}>APPLY THE COHORT LESSONS</Button>
          <Button variant="secondary" onClick={onTryAnother}>
            TRY ANOTHER CURRENT DECISION
          </Button>
        </Actions>
      </StepShell>
    )
  }

  const latency = reconsiderationLatencyFinding()
  const lostAlt = lostAlternativeFinding()

  const explicitAssumptionText = state.explicitAssumption
    ? `${state.criticalResult} is material to the authorization case.`
    : 'Not recorded.'
  const reconsiderationText = state.reconsiderationCondition
    ? `Bring the commitment back for review if adoption falls below ${state.reconsiderationThreshold}%.`
    : 'Not recorded.'
  const preservedAlternativeText = state.preserveAlternative ? CANDIDATE_ALTERNATIVE : 'Not recorded.'

  return (
    <StepShell>
      <Title>YOUR LAST DECISIONS JUST CHANGED THIS ONE</Title>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <BodyText>{capital} under consideration</BodyText>

      <SectionHeading>Current judgment</SectionHeading>
      <FactCard>
        <FactRow label="Critical result" value={state.criticalResult} />
        <FactRow label="Explicit assumption" value={explicitAssumptionText} />
      </FactCard>

      <SectionHeading>Reconsideration</SectionHeading>
      <FactCard>
        <FactRow label="Reconsideration condition" value={reconsiderationText} />
      </FactCard>

      <SectionHeading>Preserved alternative</SectionHeading>
      <FactCard>
        <FactRow label="Alternative preserved" value={preservedAlternativeText} />
      </FactCard>

      <SectionHeading>What came from the cohort</SectionHeading>
      <BodyText>Your prior commitments contributed three lessons to this decision:</BodyText>
      <FactCard>
        <FactRow label="1" value="Adoption repeatedly mattered." />
        <FactRow
          label="2"
          value={`Reconsideration historically lagged consequential evidence by ${latency.averageDays} days.`}
        />
        <FactRow
          label="3"
          value={`Rejected alternatives later became useful in ${lostAlt.returned} of ${lostAlt.eligible} comparable cases where they had not been preserved.`}
        />
      </FactCard>

      <SectionHeading>Before / after</SectionHeading>
      <FactCard>
        <FactRow label="BEFORE — Commitment" value={state.commitment} />
        <FactRow label="BEFORE — Under consideration" value={capital} />
        <FactRow label="BEFORE — Critical result" value={state.criticalResult} />
        <FactRow label="BEFORE — Reconsideration condition" value="Not recorded" />
        <FactRow label="BEFORE — Preserved alternative" value="Not recorded" />
      </FactCard>
      <FactCard>
        <FactRow label="AFTER — Commitment" value={state.commitment} />
        <FactRow label="AFTER — Under consideration" value={capital} />
        <FactRow label="AFTER — Critical assumption" value={state.criticalResult} />
        <FactRow
          label="AFTER — Reconsideration condition"
          value={
            state.reconsiderationCondition ? `Review below ${state.reconsiderationThreshold}% adoption` : 'Not recorded'
          }
        />
        <FactRow
          label="AFTER — Preserved alternative"
          value={state.preserveAlternative ? CANDIDATE_ALTERNATIVE : 'Not recorded'}
        />
      </FactCard>

      <BodyText>
        The current commitment now contains something the original proposal did not: explicit
        lessons from prior decisions.
      </BodyText>

      <Actions>
        <Button onClick={onTryAnother}>TRY ANOTHER CURRENT DECISION →</Button>
      </Actions>
    </StepShell>
  )
}
