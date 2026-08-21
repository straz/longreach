import {
  Actions,
  Button,
  BodyText,
  ChoiceGroup,
  Eyebrow,
  FactCard,
  FactRow,
  MutedText,
  Question,
  StepShell,
  Title,
  formatDollars,
} from '../../components/ui/ui'
import { governableCapital } from './compute'
import { num, type BOUDState, type ReaffirmationStatus } from './state'

const OPTIONS = [
  { value: 'YES', label: 'YES' },
  { value: 'NO', label: 'NO' },
  { value: 'NOT_SURE', label: 'NOT SURE' },
]

const CHOICE_TO_STATUS: Record<string, ReaffirmationStatus> = {
  YES: 'Reaffirmed',
  NO: 'Not reaffirmed',
  NOT_SURE: 'Not recorded',
}

const STATUS_TO_CHOICE: Record<string, string> = {
  Reaffirmed: 'YES',
  'Not reaffirmed': 'NO',
  'Not recorded': 'NOT_SURE',
}

const RECORDED_STATE_TEXT: Record<string, string> = {
  Reaffirmed: 'Recorded state: Reaffirmed under changed evidence',
  'Not reaffirmed': 'Recorded state: Reconsideration outstanding',
  'Not recorded': 'Recorded state: Reaffirmation not recorded',
}

export function Screen2A({
  state,
  setState,
  onEditInputs,
  onContinue,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
  onEditInputs: () => void
  onContinue: () => void
}) {
  const governable = governableCapital(num(state.capitalAuthorized), num(state.capitalCommitted))
  const selectedChoice = state.reaffirmationStatus ? STATUS_TO_CHOICE[state.reaffirmationStatus] ?? null : null

  return (
    <StepShell>
      <Eyebrow>{state.commitment.toUpperCase()}</Eyebrow>
      <Title>RECONSIDERATION CONDITION MET</Title>

      <FactCard>
        <FactRow label="Original expectation" value={formatDollars(num(state.originalExpectation))} />
        <FactRow label="Reconsider below" value={formatDollars(num(state.reconsiderBelow))} />
        <FactRow label="Current estimate" value={formatDollars(num(state.currentEstimate))} />
        <FactRow label="Capital still governable" value={formatDollars(governable)} />
        <FactRow label="Decision authority" value={state.decisionAuthority} />
      </FactCard>

      <Question>Has this commitment been explicitly reaffirmed under the current evidence?</Question>
      <ChoiceGroup
        options={OPTIONS}
        value={selectedChoice}
        onChange={(choice) => setState({ ...state, reaffirmationStatus: CHOICE_TO_STATUS[choice] })}
      />
      {state.reaffirmationStatus && RECORDED_STATE_TEXT[state.reaffirmationStatus] && (
        <BodyText>{RECORDED_STATE_TEXT[state.reaffirmationStatus]}</BodyText>
      )}

      <MutedText>
        Longreach calls governable capital continuing after its reconsideration condition has been
        met <strong>Inherited Authority</strong>.
      </MutedText>

      <Actions>
        <Button variant="secondary" onClick={onEditInputs}>
          EDIT INPUTS
        </Button>
        <Button disabled={!state.reaffirmationStatus} onClick={onContinue}>
          CHECK WHAT HAPPENS NEXT →
        </Button>
      </Actions>
    </StepShell>
  )
}
