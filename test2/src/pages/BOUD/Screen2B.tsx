import { Actions, Button, BodyText, Eyebrow, FactCard, FactRow, StepShell, Title, formatDollars } from '../../components/ui/ui'
import { num, type BOUDState } from './state'

export function Screen2B({
  state,
  onEditInputs,
  onContinue,
}: {
  state: BOUDState
  onEditInputs: () => void
  onContinue: () => void
}) {
  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <Title>RECONSIDERATION CONDITION NOT MET</Title>

      <FactCard>
        <FactRow label="Original expectation" value={formatDollars(num(state.originalExpectation))} />
        <FactRow label="Reconsider below" value={formatDollars(num(state.reconsiderBelow))} />
        <FactRow label="Current estimate" value={formatDollars(num(state.currentEstimate))} />
      </FactCard>

      <BodyText>This reconsideration condition does not currently call for another decision.</BodyText>

      <Actions>
        <Button variant="secondary" onClick={onEditInputs}>
          EDIT INPUTS
        </Button>
        <Button onClick={onContinue}>CHECK WHAT HAPPENS NEXT →</Button>
      </Actions>
    </StepShell>
  )
}
