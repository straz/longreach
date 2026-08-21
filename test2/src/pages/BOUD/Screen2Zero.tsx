import { Actions, Button, BodyText, StepShell, Title } from '../../components/ui/ui'

export function Screen2Zero({
  onEditCapital,
  onTryAnother,
}: {
  onEditCapital: () => void
  onTryAnother: () => void
}) {
  return (
    <StepShell>
      <Title>$0 REMAINS GOVERNABLE</Title>
      <BodyText>
        Based on the amounts entered, all authorized capital is already economically committed.
      </BodyText>
      <Actions>
        <Button variant="secondary" onClick={onEditCapital}>
          EDIT CAPITAL
        </Button>
        <Button onClick={onTryAnother}>TRY ANOTHER COMMITMENT</Button>
      </Actions>
    </StepShell>
  )
}
