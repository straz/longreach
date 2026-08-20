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
  MutedText,
  PresenterLine,
  StepShell,
  WandField,
  formatDollars,
} from '../../components/ui/ui'
import { num, type InheritedAuthorityState } from './state'

export function RevealStep({
  state,
  setState,
  onDoAnother,
}: {
  state: InheritedAuthorityState
  setState: (s: InheritedAuthorityState) => void
  onDoAnother: () => void
}) {
  const [revealed, setRevealed] = useState(false)

  const remaining = num(state.capitalAuthorized) - num(state.capitalDeployed)
  const reconsiderBelow = num(state.reconsiderBelowPct)
  const simulatedEvidence =
    state.simulatedEvidencePct === '' ? num(state.currentEvidencePct) : num(state.simulatedEvidencePct)
  const conditionMet = simulatedEvidence < reconsiderBelow

  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>

      {!revealed && (
        <Actions>
          <Button onClick={() => setRevealed(true)}>
            SHOW WHAT THE ORIGINAL DECISION STILL CONTROLS
          </Button>
        </Actions>
      )}

      {revealed && (
        <>
          <BigNumber>{formatDollars(remaining)}</BigNumber>
          <BodyText>STILL OPERATING UNDER THE ORIGINAL AUTHORIZATION</BodyText>

          <FactCard>
            <FactRow label="Original assumption" value={state.assumptionText} />
            <FactRow label="You said reconsider below" value={`${state.reconsiderBelowPct}%`} />
            <FactRow label="Current evidence" value={`${state.currentEvidencePct}%`} />
            <FactRow label="Authority" value={state.authorityHolder} />
          </FactCard>

          <Headline met={conditionMet}>
            {conditionMet
              ? 'YOUR OWN RECONSIDERATION CONDITION HAS BEEN MET'
              : 'RECONSIDERATION CONDITION NOT MET'}
          </Headline>
          {!conditionMet && (
            <BodyText>Original authorization continues without challenge from this covenant.</BodyText>
          )}

          <BodyText>
            Has the remaining {formatDollars(remaining)} been consciously reaffirmed under today's
            evidence — or is it simply continuing under yesterday's authorization?
          </BodyText>

          <WandField
            label="SIMULATE NEW EVIDENCE"
            suffix="%"
            type="number"
            inputMode="decimal"
            value={state.simulatedEvidencePct === '' ? state.currentEvidencePct : state.simulatedEvidencePct}
            onChange={(e) => setState({ ...state, simulatedEvidencePct: e.target.value })}
            onReset={() => setState({ ...state, simulatedEvidencePct: '' })}
          />
          <MutedText>
            In production, only evidence with recorded provenance updates the commitment.
          </MutedText>

          <PresenterLine>"Want to try another one?"</PresenterLine>
          <Actions>
            <Button onClick={onDoAnother}>DO ANOTHER</Button>
          </Actions>
        </>
      )}
    </StepShell>
  )
}
