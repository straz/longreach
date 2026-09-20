import { useEffect, useReducer, useRef } from 'react'

import { AppShell } from './components/AppShell.tsx'
import { PilotModal } from './components/PilotModal.tsx'
import { StepIndicator } from './components/StepIndicator.tsx'
import { Comparables } from './screens/Comparables.tsx'
import { Conditions } from './screens/Conditions.tsx'
import { ConfirmScenario } from './screens/ConfirmScenario.tsx'
import { Customize } from './screens/Customize.tsx'
import { Landing } from './screens/Landing.tsx'
import { Recognizing } from './screens/Recognizing.tsx'
import { Receipt } from './screens/Receipt.tsx'
import { copy, getScenario, getDefaultScenario, routing } from './content.ts'
import { scoreBand, track, type AnalyticsEvent } from './analytics.ts'
import { getRecognizer, simulateFromSearch } from './jev/index.ts'
import { decideScenario, recognizerText } from './routing.ts'
import type { AppScreen } from './types.ts'
import { FLOW_SCREENS, initialState, persist, reducer } from './state.ts'

/**
 * docs/specification-analysis.md §"Timeout and error handling": if the
 * recognizer takes longer than this, or throws, the menu-selected template is
 * used and nothing technical is shown.
 */
const RECOGNITION_TIMEOUT_MS = 2000

/** Screens that carry the 1-2-3 rail. */
function isFlowScreen(screen: string): boolean {
  return FLOW_SCREENS.includes(screen as (typeof FLOW_SCREENS)[number])
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState())

  const scenario = getScenario(state.selectedScenarioId) ?? getDefaultScenario(state.packId)

  useEffect(() => {
    persist(state)
  }, [state])

  // One analytics event per screen arrival, not per render. Screens with no
  // arrival event of their own are simply absent from the map.
  const lastTracked = useRef<string>('')
  useEffect(() => {
    const arrivalEvents: Partial<Record<AppScreen, AnalyticsEvent>> = {
      landing: 'landing_viewed',
      conditions: state.mode === 'custom' ? 'custom_scenario_confirmed' : 'canned_mode_started',
      comparables: 'comparables_viewed',
      receipt: 'receipt_viewed',
    }
    const event = arrivalEvents[state.screen]
    if (event === undefined) return

    const key = `${event}:${scenario.id}`
    if (lastTracked.current === key) return
    lastTracked.current = key
    track(event, {
      mode: state.mode,
      scenarioId: scenario.id,
      packId: state.packId,
    })
  }, [state.screen, state.mode, state.packId, scenario.id])

  // Moving between steps should start at the top of the new screen, the way
  // turning a page does.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [state.screen])

  /**
   * Runs the recognizer behind C2, then lands on C3 whatever happens.
   *
   * Three things are guaranteed here, and all three are acceptance criteria:
   * with no text the recognizer is never called at all; a timeout or a throw
   * falls back silently to the menu-selected template; and the visitor always
   * reaches C3 — there is no dead end and no technical error on screen.
   */
  useEffect(() => {
    if (state.screen !== 'recognizing') return
    const selected = state.selectedCommitmentType
    if (selected === undefined) return

    let settled = false
    const text = recognizerText(state.briefContext, state.sourceText)

    function settle(
      status: 'recognized' | 'fallback',
      recognition?: Parameters<typeof decideScenario>[0]['recognition'],
    ) {
      if (settled) return
      settled = true

      const decision = decideScenario({
        selectedCommitmentType: selected!,
        recognition,
        packId: state.packId,
      })

      if (status === 'fallback') {
        track('jev_fallback_used', { mode: 'custom', commitmentType: selected })
      } else if (recognition !== undefined) {
        track('jev_classification_completed', {
          mode: 'custom',
          commitmentType: decision.commitmentType,
          scenarioId: decision.scenario.id,
          scoreBand: scoreBand(recognition.decisionConditionClarityScore),
        })
      }

      dispatch({
        type: 'recognition_settled',
        scenarioId: decision.scenario.id,
        status,
        recognition,
      })
    }

    // C2 is held for its minimum duration even when the local recognizer
    // answers instantly, so the step does not flash past.
    const startedAt = Date.now()
    function settleAfterMinimum(
      status: 'recognized' | 'fallback',
      recognition?: Parameters<typeof decideScenario>[0]['recognition'],
    ) {
      const remaining = copy.recognizing.holdMs - (Date.now() - startedAt)
      if (remaining > 0) {
        setTimeout(() => settle(status, recognition), remaining)
      } else {
        settle(status, recognition)
      }
    }

    // No text means nothing to classify: the menu selection decides alone.
    if (text.length === 0) {
      settleAfterMinimum('recognized')
      return
    }

    const timeout = setTimeout(
      () => settleAfterMinimum('fallback'),
      RECOGNITION_TIMEOUT_MS,
    )

    getRecognizer(simulateFromSearch(window.location.search))
      .classify({ text, selectedCommitmentType: selected })
      .then((recognition) => {
        clearTimeout(timeout)
        settleAfterMinimum('recognized', recognition)
      })
      .catch(() => {
        clearTimeout(timeout)
        settleAfterMinimum('fallback')
      })

    return () => {
      clearTimeout(timeout)
    }
  }, [
    state.screen,
    state.selectedCommitmentType,
    state.briefContext,
    state.sourceText,
    state.packId,
  ])

  return (
    <AppShell
      footer={state.screen === 'receipt' ? copy.receipt.footer : copy.landing.footer}
      nav={
        isFlowScreen(state.screen) ? (
          <div className="lr-shell__steps">
            <StepIndicator
              labels={copy.stepIndicator}
              startLabel={copy.stepIndicatorStart}
              current={state.screen}
              furthestIndex={state.furthestFlowIndex}
              onGoTo={(screen) => dispatch({ type: 'go_to', screen })}
              onRestart={() => {
                track('example_restarted', { mode: state.mode, scenarioId: scenario.id })
                dispatch({ type: 'restart' })
              }}
            />
          </div>
        ) : undefined
      }
    >

      {state.screen === 'landing' ? (
        <Landing
          onSeeExample={() => dispatch({ type: 'start_canned' })}
          onCustomize={() => {
            track('custom_mode_started', { mode: 'custom', packId: state.packId })
            dispatch({ type: 'start_custom' })
          }}
        />
      ) : null}

      {state.screen === 'conditions' ? (
        <Conditions
          scenario={scenario}
          revealed={state.evidenceRevealed}
          onReveal={() => {
            track('decision_condition_revealed', {
              mode: state.mode,
              scenarioId: scenario.id,
            })
            dispatch({ type: 'reveal_evidence' })
          }}
          onNext={() => dispatch({ type: 'go_to', screen: 'comparables' })}
        />
      ) : null}

      {state.screen === 'comparables' ? (
        <Comparables
          scenario={scenario}
          onNext={() => dispatch({ type: 'go_to', screen: 'receipt' })}
        />
      ) : null}

      {state.screen === 'receipt' ? (
        <Receipt
          scenario={scenario}
          onPilot={() => {
            track('pilot_modal_opened', { mode: state.mode, scenarioId: scenario.id })
            dispatch({ type: 'open_pilot_modal' })
          }}
          onRestart={() => {
            track('example_restarted', { mode: state.mode, scenarioId: scenario.id })
            dispatch({ type: 'restart' })
          }}
        />
      ) : null}

      {state.screen === 'customize' ? (
        <Customize
          selectedCommitmentType={state.selectedCommitmentType}
          briefContext={state.briefContext}
          sourceText={state.sourceText}
          onSelectType={(commitmentType) =>
            dispatch({ type: 'select_commitment_type', commitmentType })
          }
          onBriefContextChange={(value) => dispatch({ type: 'set_brief_context', value })}
          onSourceTextChange={(value) => dispatch({ type: 'set_source_text', value })}
          onSubmit={() => {
            // Never the text itself — only whether any was supplied.
            track('custom_input_submitted', {
              mode: 'custom',
              commitmentType: state.selectedCommitmentType,
              packId: state.packId,
            })
            dispatch({ type: 'begin_recognition' })
          }}
          onUseStandard={() => dispatch({ type: 'use_standard_example' })}
        />
      ) : null}

      {state.screen === 'recognizing' ? <Recognizing /> : null}

      {state.screen === 'confirm' && state.selectedCommitmentType !== undefined ? (
        <ConfirmScenario
          commitmentType={scenario.type}
          evidenceShiftCategory={state.recognition?.evidenceShiftCategory ?? 'unclear'}
          contextSummary={
            state.recognition?.contextSummary ?? routing.contextSummaries.unclear
          }
          clarityScore={state.recognition?.decisionConditionClarityScore ?? 1}
          onUseThis={() => {
            track('custom_scenario_confirmed', {
              mode: 'custom',
              scenarioId: scenario.id,
              commitmentType: scenario.type,
            })
            dispatch({ type: 'confirm_custom_scenario' })
          }}
          onUseStandard={() => dispatch({ type: 'use_standard_example' })}
          onEditInputs={() => dispatch({ type: 'edit_inputs' })}
        />
      ) : null}

      {state.pilotModalOpen ? (
        <PilotModal
          mode={state.mode}
          scenarioId={scenario.id}
          onClose={() => dispatch({ type: 'close_pilot_modal' })}
        />
      ) : null}
    </AppShell>
  )
}
