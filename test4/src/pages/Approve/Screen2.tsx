import {
  BigChoiceGroup,
  DollarField,
  Eyebrow,
  Field,
  MutedText,
  Question,
  Quote,
  StepShell,
  Title,
} from '../../components/ui/ui'
import type { ApproveState, Verdict } from './state'

export function Screen2({
  state,
  setState,
  onVerdict,
}: {
  state: ApproveState
  setState: (s: ApproveState) => void
  onVerdict: (v: Verdict) => void
}) {
  return (
    <StepShell>
      {state.utterance.trim() !== '' && (
        <>
          <Eyebrow>What you told us</Eyebrow>
          <Quote>{state.utterance}</Quote>
        </>
      )}

      <Title>Here's what we heard.</Title>
      <MutedText>Correct anything that's off before you answer.</MutedText>

      <Field
        label="Commitment"
        value={state.name}
        onChange={(e) => setState({ ...state, name: e.target.value })}
      />
      <DollarField
        label="Authorized"
        value={state.authorized}
        onChange={(digits) => setState({ ...state, authorized: digits })}
      />
      <Field
        label="Expected outcome"
        value={state.expectedOutcome}
        onChange={(e) => setState({ ...state, expectedOutcome: e.target.value })}
      />
      <Field
        label="Completion"
        value={state.completion}
        onChange={(e) => setState({ ...state, completion: e.target.value })}
      />

      <Question>Would you make this commitment today, knowing what you know today?</Question>
      <BigChoiceGroup
        options={[
          { label: 'YES', onClick: () => onVerdict('yes') },
          { label: 'NO', onClick: () => onVerdict('no') },
          { label: "I'D NEED TO CHECK", onClick: () => onVerdict('check') },
        ]}
      />
    </StepShell>
  )
}
