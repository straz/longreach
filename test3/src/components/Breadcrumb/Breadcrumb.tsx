import { Fragment } from 'react'
import { STEPS, goToScreen, isStepVisited, startOver } from '../../pages/Cohort/navigation'
import type { CohortState } from '../../pages/Cohort/state'
import styles from './Breadcrumb.module.css'

export function Breadcrumb({
  state,
  setState,
}: {
  state: CohortState
  setState: (s: CohortState) => void
}) {
  return (
    <div className={styles.bar}>
      <nav className={styles.trail} aria-label="Progress">
        {STEPS.map((step, i) => {
          const isCurrent = step.screen === state.screen
          const isVisited = isStepVisited(state, step.screen)
          return (
            <Fragment key={step.screen}>
              {i > 0 && <span className={styles.separator}>›</span>}
              <button
                type="button"
                className={
                  isCurrent ? styles.stepCurrent : isVisited ? `${styles.step} ${styles.stepVisited}` : styles.step
                }
                disabled={!isVisited}
                onClick={() => setState(goToScreen(state, step.screen))}
              >
                {step.screen}. {step.label}
              </button>
            </Fragment>
          )
        })}
      </nav>
      {state.screen > 1 && (
        <button type="button" className={styles.startOver} onClick={() => setState(startOver(state))}>
          Start over
        </button>
      )}
    </div>
  )
}
