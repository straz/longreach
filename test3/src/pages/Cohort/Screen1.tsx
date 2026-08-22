import styles from '../../components/ui/Step.module.css'
import { Actions, Button, DollarField, Field, PresenterLine, Question, StepShell, Title } from '../../components/ui/ui'
import { num, type CohortState } from './state'

export function Screen1({
  state,
  setState,
  onContinue,
  onClearData,
}: {
  state: CohortState
  setState: (s: CohortState) => void
  onContinue: () => void
  onClearData: () => void
}) {
  const canContinue = state.commitment.trim() !== '' && num(state.capital) > 0 && state.criticalResult.trim() !== ''

  return (
    <StepShell>
      <Title>WHAT ARE YOU CONSIDERING NOW?</Title>
      <PresenterLine>Start with one material technology commitment.</PresenterLine>

      <Field
        label="Commitment"
        value={state.commitment}
        onChange={(e) => setState({ ...state, commitment: e.target.value })}
      />

      <DollarField
        label="Capital under consideration"
        value={state.capital}
        onChange={(digits) => setState({ ...state, capital: digits })}
      />

      <Question>What result matters most to the case for approving it?</Question>
      <Field
        label="Critical result"
        value={state.criticalResult}
        onChange={(e) => setState({ ...state, criticalResult: e.target.value })}
      />

      <Actions>
        <Button disabled={!canContinue} onClick={onContinue}>
          SEE WHAT YOUR LAST DECISIONS CAN TEACH THIS ONE →
        </Button>
      </Actions>

      <div className={styles.footer}>
        <button type="button" className={styles.clearDataButton} onClick={onClearData}>
          Clear data
        </button>
      </div>
    </StepShell>
  )
}
