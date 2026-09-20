// Picks the recognizer implementation.
//
// v1 is mock-only: there is no API key, no proxy and no network call
// (docs/PLAN.md §6.1). When the remote recognizer lands it is selected here by
// VITE_JEV_MODE, and this is the only file that needs to know.

import { createMockRecognizer, type Simulate } from './mock.ts'
import type { JevRecognizer } from './types.ts'

/**
 * `?jev=fail` and `?jev=slow` force the failure paths.
 *
 * A deterministic mock never fails, so without this the silent-fallback
 * behaviour the spec requires (acceptance criterion 7) would be untestable and
 * undemonstrable in v1. It is a development affordance, not a visitor-facing
 * control, and it changes nothing on the default path.
 */
export function simulateFromSearch(search: string): Simulate {
  const value = new URLSearchParams(search).get('jev')
  if (value === 'fail') return 'error'
  if (value === 'slow') return 'slow'
  return 'none'
}

export function getRecognizer(simulate: Simulate = 'none'): JevRecognizer {
  return createMockRecognizer(simulate)
}

export type { Simulate }
