import {
  Actions,
  Button,
  Eyebrow,
  FactCard,
  FactRow,
  PresenterLine,
  StepShell,
  Title,
  formatDollars,
} from '../../components/ui/ui'
import { num, type InheritedAuthorityState } from './state'

export function ReadbackStep({
  state,
  onContinue,
}: {
  state: InheritedAuthorityState
  onContinue: () => void
}) {
  const remaining = num(state.capitalAuthorized) - num(state.capitalDeployed)

  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <Title>Here's what you told me.</Title>
      <FactCard>
        <FactRow label="Authorized" value={formatDollars(num(state.capitalAuthorized))} />
        <FactRow label="Deployed" value={formatDollars(num(state.capitalDeployed))} />
        <FactRow label="Remaining" value={formatDollars(remaining)} />
        <FactRow label="Original assumption" value={state.assumptionText} />
        <FactRow label="Current evidence" value={`${state.currentEvidencePct}%`} />
      </FactCard>
      <PresenterLine>"That's just what you told me. Nothing clever yet."</PresenterLine>
      <Actions>
        <Button onClick={onContinue}>Continue</Button>
      </Actions>
    </StepShell>
  )
}
