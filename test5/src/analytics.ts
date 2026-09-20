// Analytics, such as it is: console logging behind one call.
//
// docs/README.md §"Analytics events" asks for a simple abstraction with no
// external dependency, so swapping in a real sink later means editing `emit`.
//
// Two rules that are not negotiable:
//   - Pasted source text and typed context never appear in a payload.
//   - The clarity score is reported as a band, never as a number, so it cannot
//     read as a score assigned to the visitor.

import type { CommitmentType } from './types.ts'

export type AnalyticsEvent =
  | 'landing_viewed'
  | 'canned_mode_started'
  | 'custom_mode_started'
  | 'custom_input_submitted'
  | 'jev_classification_completed'
  | 'jev_fallback_used'
  | 'custom_scenario_confirmed'
  | 'decision_condition_revealed'
  | 'comparables_viewed'
  | 'receipt_viewed'
  | 'pilot_modal_opened'
  | 'pilot_request_submitted'
  | 'example_restarted'

export type ScoreBand = 'low' | 'medium' | 'high'

export interface AnalyticsPayload {
  mode?: 'canned' | 'custom' | null
  scenarioId?: string
  commitmentType?: CommitmentType
  scoreBand?: ScoreBand
  packId?: string
}

export function scoreBand(score: number): ScoreBand {
  if (score <= 3) return 'low'
  if (score <= 7) return 'medium'
  return 'high'
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  // eslint-disable-next-line no-console
  console.log('[longreach]', event, payload)
}
