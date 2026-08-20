import { Actions, Button, DollarField, Eyebrow, Field, StepShell, Title } from '../../components/ui/ui'
import type { InheritedAuthorityState } from './state'

export function InputStep({
  state,
  setState,
  onContinue,
}: {
  state: InheritedAuthorityState
  setState: (s: InheritedAuthorityState) => void
  onContinue: () => void
}) {
  const canContinue =
    state.commitment.trim() &&
    state.capitalAuthorized &&
    state.capitalDeployed &&
    state.assumptionText.trim() &&
    state.currentEvidencePct !== ''

  return (
    <StepShell>
      <Eyebrow>Inherited Authority</Eyebrow>
      <Title>Give me one consequential commitment you approved.</Title>
      <Field
        label="Commitment"
        placeholder="e.g. AI Customer Service Transformation"
        value={state.commitment}
        onChange={(e) => setState({ ...state, commitment: e.target.value })}
      />
      <DollarField
        label="Capital authorized"
        placeholder="$30,000,000"
        value={state.capitalAuthorized}
        onChange={(digits) => setState({ ...state, capitalAuthorized: digits })}
      />
      <DollarField
        label="Capital deployed"
        placeholder="$11,000,000"
        value={state.capitalDeployed}
        onChange={(digits) => setState({ ...state, capitalDeployed: digits })}
      />
      <Field
        label="One assumption important enough to the original decision that it had to remain reasonably true"
        placeholder="e.g. Expected cost reduction ≥15%"
        value={state.assumptionText}
        onChange={(e) => setState({ ...state, assumptionText: e.target.value })}
      />
      <Field
        label="Current evidence against that assumption"
        suffix="%"
        type="number"
        inputMode="decimal"
        placeholder="7"
        value={state.currentEvidencePct}
        onChange={(e) => setState({ ...state, currentEvidencePct: e.target.value })}
      />
      <Actions>
        <Button disabled={!canContinue} onClick={onContinue}>
          Continue
        </Button>
      </Actions>
    </StepShell>
  )
}
