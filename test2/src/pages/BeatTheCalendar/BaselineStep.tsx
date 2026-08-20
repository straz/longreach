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
import { formatDate } from '../../lib/dates'
import { num, type BeatTheCalendarState } from './state'

export function BaselineStep({
  state,
  onContinue,
}: {
  state: BeatTheCalendarState
  onContinue: () => void
}) {
  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <Title>Today</Title>
      <FactCard>
        <FactRow label="Economically changeable" value={formatDollars(num(state.changeableCapital))} />
        <FactRow
          label="Next irreversible commitment"
          value={`${formatDollars(num(state.irreversibleAmount))} — ${formatDate(state.irreversibleDate)}`}
        />
        <FactRow label="Next executive review" value={formatDate(state.reviewDate)} />
      </FactCard>
      <PresenterLine>"Again: just your numbers."</PresenterLine>
      <Actions>
        <Button onClick={onContinue}>Continue</Button>
      </Actions>
    </StepShell>
  )
}
