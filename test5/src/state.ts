// One reducer for the whole flow. No router: seven screens, all linear
// (docs/PLAN.md §1).
//

import { getDefaultScenario, manifest, resolveScenario } from './content.ts'
import { readFlow, readPrefs, writeFlow, writePrefs } from './storage.ts'
import type {
  AppMode,
  AppScreen,
  CommitmentType,
  CustomizationStatus,
} from './types.ts'
import type { JevRecognitionResult } from './jev/types.ts'

export interface AppState {
  screen: AppScreen
  mode: AppMode | null
  packId: string
  selectedScenarioId: string
  evidenceRevealed: boolean
  pilotModalOpen: boolean

  /**
   * Furthest step of the three-step example reached this run. The chevron rail
   * uses it so that stepping back does not erase the way forward: every step
   * already seen stays reachable, in both directions.
   */
  furthestFlowIndex: number

  // Custom path. briefContext and sourceText are held here and nowhere else:
  // never persisted to storage, never logged, never sent anywhere in v1
  // (docs/PLAN.md §5.1).
  selectedCommitmentType?: CommitmentType
  briefContext: string
  sourceText: string
  recognition?: JevRecognitionResult
  customizationStatus?: CustomizationStatus
}

export type AppAction =
  | { type: 'start_canned' }
  | { type: 'start_custom' }
  | { type: 'select_commitment_type'; commitmentType: CommitmentType }
  | { type: 'set_brief_context'; value: string }
  | { type: 'set_source_text'; value: string }
  | { type: 'begin_recognition' }
  | {
      type: 'recognition_settled'
      scenarioId: string
      status: CustomizationStatus
      recognition?: JevRecognitionResult
    }
  | { type: 'confirm_custom_scenario' }
  | { type: 'use_standard_example' }
  | { type: 'edit_inputs' }
  | { type: 'reveal_evidence' }
  | { type: 'go_to'; screen: AppScreen }
  | { type: 'open_pilot_modal' }
  | { type: 'close_pilot_modal' }
  | { type: 'restart' }

/** Screens that belong to the three-step example, in order. */
export const FLOW_SCREENS: AppScreen[] = ['conditions', 'comparables', 'receipt']

function defaults(packId: string): AppState {
  return {
    screen: 'landing',
    mode: null,
    packId,
    selectedScenarioId: getDefaultScenario(packId).id,
    evidenceRevealed: false,
    pilotModalOpen: false,
    furthestFlowIndex: 0,
    briefContext: '',
    sourceText: '',
  }
}

function isAppScreen(value: unknown): value is AppScreen {
  return (
    value === 'landing' ||
    value === 'customize' ||
    value === 'recognizing' ||
    value === 'confirm' ||
    value === 'conditions' ||
    value === 'comparables' ||
    value === 'receipt'
  )
}

/**
 * Initial state, assembled in three passes: defaults, then any stored flow
 * from this tab, then the URL. The URL wins so that a link like
 * `?scenario=integration_v1` shows that scenario even when the tab was part
 * way through something else.
 */
export function initialState(search = window.location.search): AppState {
  const prefs = readPrefs()
  let state = defaults(
    prefs !== undefined && prefs.lastPackId in manifest.packs
      ? prefs.lastPackId
      : manifest.defaultPack,
  )

  const stored = readFlow()
  if (stored !== undefined && isAppScreen(stored.screen)) {
    const packId = stored.packId in manifest.packs ? stored.packId : state.packId
    state = {
      ...state,
      screen: stored.screen,
      mode: stored.mode === 'canned' || stored.mode === 'custom' ? stored.mode : null,
      packId,
      selectedScenarioId: resolveScenario(stored.selectedScenarioId, packId).id,
      evidenceRevealed: stored.evidenceRevealed === true,
      furthestFlowIndex: Math.max(
        typeof stored.furthestFlowIndex === 'number' ? stored.furthestFlowIndex : 0,
        FLOW_SCREENS.indexOf(stored.screen),
        0,
      ),
    }
  }

  const params = new URLSearchParams(search)
  const packParam = params.get('pack')
  if (packParam !== null && packParam in manifest.packs) {
    state = { ...state, packId: packParam, selectedScenarioId: getDefaultScenario(packParam).id }
  }

  const scenarioParam = params.get('scenario')
  if (scenarioParam !== null) {
    state = { ...state, selectedScenarioId: resolveScenario(scenarioParam, state.packId).id }
  }

  if (params.get('mode') === 'custom') {
    state = { ...state, mode: 'custom', screen: 'customize' }
  }

  // A scenario named in the URL is an explicit request to see that example, so
  // it starts the canned path rather than sitting on the landing screen.
  if (scenarioParam !== null && params.get('mode') !== 'custom' && state.screen === 'landing') {
    state = { ...state, mode: 'canned', screen: 'conditions' }
  }

  return state
}

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'start_canned':
      return {
        ...state,
        mode: 'canned',
        screen: 'conditions',
        selectedScenarioId: getDefaultScenario(state.packId).id,
        evidenceRevealed: false,
        furthestFlowIndex: 0,
      }

    case 'start_custom':
      return { ...state, mode: 'custom', screen: 'customize' }

    case 'select_commitment_type':
      return { ...state, selectedCommitmentType: action.commitmentType }

    case 'set_brief_context':
      return { ...state, briefContext: action.value }

    case 'set_source_text':
      return { ...state, sourceText: action.value }

    case 'begin_recognition':
      return { ...state, screen: 'recognizing', recognition: undefined }

    case 'recognition_settled':
      return {
        ...state,
        screen: 'confirm',
        selectedScenarioId: action.scenarioId,
        recognition: action.recognition,
        customizationStatus: action.status,
      }

    case 'confirm_custom_scenario':
      return { ...state, screen: 'conditions', evidenceRevealed: false, furthestFlowIndex: 0 }

    case 'use_standard_example':
      // Drops the custom context entirely and runs the canned example.
      return {
        ...defaults(state.packId),
        mode: 'canned',
        screen: 'conditions',
      }

    case 'edit_inputs':
      return { ...state, screen: 'customize' }

    case 'reveal_evidence':
      return { ...state, evidenceRevealed: true }

    case 'go_to':
      return {
        ...state,
        screen: action.screen,
        furthestFlowIndex: Math.max(
          state.furthestFlowIndex,
          FLOW_SCREENS.indexOf(action.screen),
        ),
      }

    case 'open_pilot_modal':
      return { ...state, pilotModalOpen: true }

    case 'close_pilot_modal':
      return { ...state, pilotModalOpen: false }

    case 'restart':
      // Resets the flow only; the persist() effect writes this state straight
      // back, so a refresh after restarting lands on S0. Preferences and any
      // captured pilot requests survive (docs/PLAN.md §5.1). No clearing
      // happens here: a reducer must stay pure, and StrictMode calls it twice.
      return defaults(state.packId)
  }
}

/** Mirrors the parts of state worth resuming after a refresh. */
export function persist(state: AppState): void {
  writeFlow({
    screen: state.screen,
    mode: state.mode,
    packId: state.packId,
    selectedScenarioId: state.selectedScenarioId,
    evidenceRevealed: state.evidenceRevealed,
    furthestFlowIndex: state.furthestFlowIndex,
  })
  writePrefs({ lastPackId: state.packId })
}
