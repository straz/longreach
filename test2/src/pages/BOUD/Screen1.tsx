import styles from '../../components/ui/Step.module.css'
import {
  Actions,
  Button,
  DollarField,
  ErrorText,
  FactCard,
  FactRow,
  Field,
  PresenterLine,
  StepShell,
  Title,
  formatDollarsFull,
} from '../../components/ui/ui'
import { governableCapital } from './compute'
import { num, type BOUDState } from './state'

export function Screen1({
  state,
  setState,
  onContinue,
  onClearData,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
  onContinue: () => void
  onClearData: () => void
}) {
  const authorized = num(state.capitalAuthorized)
  const committed = num(state.capitalCommitted)
  const governable = governableCapital(authorized, committed)

  const exceedsAuthorized = committed > authorized
  const canContinue = state.commitment.trim() !== '' && authorized > 0 && committed >= 0 && !exceedsAuthorized

  return (
    <StepShell>
      <Title>WHAT IS YOUR BUDGET STILL ASSUMING?</Title>
      <PresenterLine>Start with one material commitment.</PresenterLine>

      <Field
        label="Commitment"
        value={state.commitment}
        onChange={(e) => setState({ ...state, commitment: e.target.value })}
      />

      <DollarField
        label="Capital authorized"
        help="Total capital authorized for this commitment."
        value={state.capitalAuthorized}
        onChange={(digits) => setState({ ...state, capitalAuthorized: digits })}
      />

      <DollarField
        label="Capital already economically committed"
        help="Capital you could not now redirect without reversing an existing commitment or incurring its economic consequences."
        value={state.capitalCommitted}
        onChange={(digits) => setState({ ...state, capitalCommitted: digits })}
      />

      <FactCard>
        <FactRow label="Capital still governable" value={formatDollarsFull(governable)} />
      </FactCard>

      {exceedsAuthorized && (
        <ErrorText>Economically committed capital cannot exceed authorized capital.</ErrorText>
      )}

      <Actions>
        <Button disabled={!canContinue} onClick={onContinue}>
          CONTINUE →
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
