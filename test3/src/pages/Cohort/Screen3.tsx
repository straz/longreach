import {
  Actions,
  BodyText,
  Button,
  ChoiceGroup,
  Eyebrow,
  FactCard,
  FactRow,
  Field,
  Question,
  SectionHeading,
  StepShell,
  Title,
  formatDollars,
} from '../../components/ui/ui'
import { CANDIDATE_ALTERNATIVE, lostAlternativeFinding, reconsiderationLatencyFinding } from './data'
import { num, type CohortState } from './state'

const YES_NO = [
  { value: 'YES', label: 'YES' },
  { value: 'NO', label: 'NO' },
]

export function Screen3({
  state,
  setState,
  onCreate,
}: {
  state: CohortState
  setState: (s: CohortState) => void
  onCreate: () => void
}) {
  const latency = reconsiderationLatencyFinding()
  const lostAlt = lostAlternativeFinding()

  return (
    <StepShell>
      <Title>MAKE THIS COMMITMENT EASIER TO LEARN FROM</Title>

      <FactCard>
        <FactRow label="Commitment" value={state.commitment} />
        <FactRow label="Under consideration" value={formatDollars(num(state.capital))} />
        <FactRow label="Critical result" value={state.criticalResult} />
      </FactCard>

      <SectionHeading>MAKE THE CRITICAL ASSUMPTION EXPLICIT</SectionHeading>
      <BodyText>Your prior commitments suggest adoption is worth treating as a first-class assumption.</BodyText>
      <Eyebrow>Critical assumption</Eyebrow>
      <BodyText>{state.criticalResult}</BodyText>
      <Question>Record this as an explicit commitment assumption?</Question>
      <ChoiceGroup
        options={YES_NO}
        value={state.explicitAssumption ? 'YES' : 'NO'}
        onChange={(v) => setState({ ...state, explicitAssumption: v === 'YES' })}
      />

      <SectionHeading>DECIDE IN ADVANCE WHEN YOU WANT ANOTHER LOOK</SectionHeading>
      <BodyText>
        Your triggered commitments waited an average of <strong>{latency.averageDays} days</strong>{' '}
        after consequential evidence emerged before management reconsidered them.
      </BodyText>
      <Question>Add an explicit reconsideration condition now?</Question>
      <ChoiceGroup
        options={YES_NO}
        value={state.reconsiderationCondition ? 'YES' : 'NO'}
        onChange={(v) => setState({ ...state, reconsiderationCondition: v === 'YES' })}
      />
      {state.reconsiderationCondition && (
        <Field
          label="Bring this commitment back for review if adoption falls below"
          suffix="%"
          type="number"
          inputMode="decimal"
          value={state.reconsiderationThreshold}
          onChange={(e) => setState({ ...state, reconsiderationThreshold: e.target.value })}
        />
      )}

      <SectionHeading>PRESERVE THE ALTERNATIVE</SectionHeading>
      <BodyText>
        In {lostAlt.returned} of {lostAlt.eligible} prior cases, management later wanted an
        alternative it had not preserved.
      </BodyText>
      <Eyebrow>Alternative under consideration</Eyebrow>
      <BodyText>{CANDIDATE_ALTERNATIVE}</BodyText>
      <Question>Preserve this alternative with the commitment?</Question>
      <ChoiceGroup
        options={YES_NO}
        value={state.preserveAlternative ? 'YES' : 'NO'}
        onChange={(v) => setState({ ...state, preserveAlternative: v === 'YES' })}
      />

      <Actions>
        <Button onClick={onCreate}>CREATE THE COMMITMENT →</Button>
      </Actions>
    </StepShell>
  )
}
