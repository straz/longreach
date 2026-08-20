import { useState } from 'react'
import {
  Actions,
  BigNumber,
  BodyText,
  Button,
  Eyebrow,
  FactCard,
  FactRow,
  Headline,
  PresenterLine,
  StepShell,
  WandField,
  formatDollars,
} from '../../components/ui/ui'
import { computeVerdict } from './compute'
import { num, type BeatTheCalendarState } from './state'

export function RevealStep({
  state,
  setState,
  onDoAnother,
}: {
  state: BeatTheCalendarState
  setState: (s: BeatTheCalendarState) => void
  onDoAnother: () => void
}) {
  const [revealed, setRevealed] = useState(false)

  const changeableCapital = num(state.changeableCapital)
  const irreversibleAmount = num(state.irreversibleAmount)
  const effectiveReviewDate = state.simulatedReviewDate || state.reviewDate
  const effectiveIrreversibleDate = state.simulatedIrreversibleDate || state.irreversibleDate

  const { burnBeforeReview, flexibilityAtReview, optionalityBurn, daysLate } = computeVerdict(
    changeableCapital,
    irreversibleAmount,
    effectiveIrreversibleDate,
    effectiveReviewDate,
  )

  const reviewSimulated = state.simulatedReviewDate !== ''
  const milestoneSimulated = state.simulatedIrreversibleDate !== ''

  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>

      {!revealed && (
        <Actions>
          <Button onClick={() => setRevealed(true)}>LET THE CALENDAR RUN</Button>
        </Actions>
      )}

      {revealed && (
        <>
          {burnBeforeReview ? (
            <>
              <Headline met>
                {reviewSimulated || milestoneSimulated
                  ? `YOUR NEXT REVIEW IS NOW ${daysLate} DAYS TOO LATE`
                  : `YOUR REVIEW IS ${daysLate} DAYS TOO LATE`}
              </Headline>
              <FactCard>
                <FactRow label="Today" value={formatDollars(changeableCapital)} />
                <FactRow label="At your next scheduled review" value={formatDollars(flexibilityAtReview)} />
              </FactCard>
              <BigNumber>{formatDollars(optionalityBurn)}</BigNumber>
              <BodyText>OF TODAY'S ECONOMIC FLEXIBILITY DISAPPEARS FIRST</BodyText>
              <BodyText>
                Nothing failed. No KPI breached. The commitment simply became harder to change
                before the people with authority were scheduled to look again.
              </BodyText>
            </>
          ) : (
            <>
              <Headline met={false}>REVIEW NOW PRECEDES IRREVERSIBLE EVENT</Headline>
              <BodyText>{formatDollars(irreversibleAmount)} of current flexibility remains available at review.</BodyText>
              {reviewSimulated && <BodyText>"You moved the meeting, not the money."</BodyText>}
            </>
          )}

          <WandField
            label="SIMULATE NEXT REVIEW DATE"
            type="date"
            value={effectiveReviewDate}
            onChange={(e) => setState({ ...state, simulatedReviewDate: e.target.value })}
            onReset={() => setState({ ...state, simulatedReviewDate: '' })}
          />

          <WandField
            label="SIMULATE TECHNICAL MILESTONE DATE"
            type="date"
            value={effectiveIrreversibleDate}
            onChange={(e) => setState({ ...state, simulatedIrreversibleDate: e.target.value })}
            onReset={() => setState({ ...state, simulatedIrreversibleDate: '' })}
          />

          <PresenterLine>"Want to try another one?"</PresenterLine>
          <Actions>
            <Button onClick={onDoAnother}>DO ANOTHER</Button>
          </Actions>
        </>
      )}
    </StepShell>
  )
}
