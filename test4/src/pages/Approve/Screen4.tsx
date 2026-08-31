import { useState } from 'react'
import {
  Actions,
  BodyText,
  Button,
  FactCard,
  FactRow,
  Headline,
  MutedText,
  Question,
  StepShell,
  formatDollars,
} from '../../components/ui/ui'
import { reveal } from './compute'
import type { ApproveState } from './state'

export function Screen4({ state }: { state: ApproveState }) {
  const r = reveal(state)
  const [revealed, setRevealed] = useState(false)

  return (
    <StepShell>
      {r.fullyLockedIn ? (
        <Headline met>
          Nothing remains economically governable — this decision is fully locked in.
        </Headline>
      ) : (
        <Headline met>
          {formatDollars(r.governable)} is still governed by a decision you would not make today.
        </Headline>
      )}

      <FactCard>
        <FactRow label="Authorized" value={formatDollars(r.authorized)} />
        <FactRow label="Economically committed" value={formatDollars(r.committed)} />
        <FactRow label="Still governable" value={formatDollars(r.governable)} />
      </FactCard>

      <BodyText>
        {r.reviewOverdue
          ? `Next scheduled reconsideration: overdue by ${Math.abs(r.daysToReview)} days`
          : `Next scheduled reconsideration: ${r.daysToReview} days`}
      </BodyText>
      <BodyText>Authority: {r.authority}</BodyText>

      <Question>Your mind changed before your governance did.</Question>

      {revealed ? (
        <MutedText>That's where Test 5 begins.</MutedText>
      ) : (
        <Actions>
          <Button onClick={() => setRevealed(true)}>WHAT CHANGED?</Button>
        </Actions>
      )}
    </StepShell>
  )
}
