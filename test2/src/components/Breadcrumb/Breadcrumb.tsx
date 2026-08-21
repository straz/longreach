import { Fragment } from 'react'
import { STEPS, goToScreen, startOver } from '../../pages/BOUD/navigation'
import type { BOUDState } from '../../pages/BOUD/state'
import styles from './Breadcrumb.module.css'

export function Breadcrumb({
  state,
  setState,
}: {
  state: BOUDState
  setState: (s: BOUDState) => void
}) {
  return (
    <div className={styles.bar}>
      <nav className={styles.trail} aria-label="Progress">
        {STEPS.map((step, i) => {
          const isCurrent = step.screen === state.screen
          const isVisited = step.screen < state.screen
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
