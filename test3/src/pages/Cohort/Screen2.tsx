import {
  Actions,
  BigNumber,
  BodyText,
  Button,
  MutedText,
  Question,
  SectionHeading,
  StepShell,
  Title,
} from '../../components/ui/ui'
import { lostAlternativeFinding, reconsiderationLatencyFinding, recurringAssumptionFinding } from './data'
import type { CohortState } from './state'

export function Screen2({
  state,
  onApplyLessons,
  onShowAsIs,
}: {
  state: CohortState
  onApplyLessons: () => void
  onShowAsIs: () => void
}) {
  const recurring = recurringAssumptionFinding()
  const latency = reconsiderationLatencyFinding()
  const lostAlt = lostAlternativeFinding()

  return (
    <StepShell>
      <Title>BEFORE YOU AUTHORIZE THIS ONE...</Title>
      <MutedText>We looked at six prior technology commitments.</MutedText>

      <SectionHeading>WHAT KEPT MATTERING</SectionHeading>
      <BodyText>
        In <strong>{recurring.count} of {recurring.total}</strong> prior commitments, adoption or
        utilization was one of the assumptions that mattered most to the original case.
      </BodyText>
      <BodyText>
        Your current commitment also depends on: <strong>{state.criticalResult}</strong>
      </BodyText>

      <SectionHeading>WHAT HAPPENED WHEN EVIDENCE CHANGED</SectionHeading>
      <BodyText>
        For commitments that later triggered reconsideration, consequential evidence arrived an
        average of:
      </BodyText>
      <BigNumber>{latency.averageDays} DAYS</BigNumber>
      <BodyText>before formal management reconsideration.</BodyText>

      <SectionHeading>WHAT YOU LATER WISHED YOU HAD KEPT</SectionHeading>
      <BodyText>
        In <strong>{lostAlt.returned} of {lostAlt.eligible}</strong> triggered commitments where the
        rejected alternative had not been preserved, management later returned to a version of that
        alternative.
      </BodyText>

      <Question>Do you want those lessons to change how you structure this commitment before you authorize it?</Question>
      <Actions>
        <Button onClick={onApplyLessons}>YES — APPLY THEM →</Button>
        <Button variant="secondary" onClick={onShowAsIs}>
          NO — SHOW ME THE RECORD AS-IS
        </Button>
      </Actions>
    </StepShell>
  )
}
