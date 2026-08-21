import { reviewOnOrBeforeCommitment } from './compute'
import { Screen3A } from './Screen3A'
import { Screen3B } from './Screen3B'
import { Screen3Edit } from './Screen3Edit'
import type { BOUDState } from './state'

export function Screen3({
  state,
  setState,
  onContinueToScreen4,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
  onContinueToScreen4: () => void
}) {
  if (!state.screen3Checked) {
    return (
      <Screen3Edit
        state={state}
        setState={setState}
        onCheck={() => setState({ ...state, screen3Checked: true })}
      />
    )
  }

  const onEditDates = () => setState({ ...state, screen3Checked: false })
  const reviewFirst = reviewOnOrBeforeCommitment(state.nextAuthorizedReview, state.capitalCommitmentDate)

  if (reviewFirst) {
    return <Screen3B state={state} onEditDates={onEditDates} onContinue={onContinueToScreen4} />
  }

  return (
    <Screen3A state={state} setState={setState} onEditDates={onEditDates} onContinue={onContinueToScreen4} />
  )
}
