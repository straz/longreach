// Browser storage. No backend, no database (docs/PLAN.md §5.1).
//
// Every read and write is guarded: a private window, blocked site data, or a
// quota error must degrade to "no stored state", never to a broken page. Each
// payload carries a version so a shape change discards stale state rather than
// crashing on it.
//
// What is deliberately never written here: pasted source text and typed
// context. Those live in React state only, and nothing the visitor types is
// persisted anywhere.

const VERSION = 1

export const FLOW_KEY = 'lr5-flow'
export const PREFS_KEY = 'lr5-prefs'

interface Versioned {
  version: number
}

function read<T>(storage: Storage | undefined, key: string): T | undefined {
  if (storage === undefined) return undefined
  try {
    const raw = storage.getItem(key)
    if (raw === null) return undefined
    const parsed = JSON.parse(raw) as Versioned
    if (parsed === null || typeof parsed !== 'object') return undefined
    if (parsed.version !== VERSION) return undefined
    return parsed as T
  } catch {
    return undefined
  }
}

function write(storage: Storage | undefined, key: string, value: object): void {
  if (storage === undefined) return
  try {
    storage.setItem(key, JSON.stringify({ ...value, version: VERSION }))
  } catch {
    // Full, blocked, or unavailable. The app works without it.
  }
}

// Accessing window.sessionStorage can itself throw when site data is blocked,
// so resolve it once behind a guard rather than at each call site.
function resolve(kind: 'session' | 'local'): Storage | undefined {
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return undefined
  }
}

// ------------------------------------------------------------------ flow
// Per-tab, so two tabs can demo two scenarios side by side.

export interface StoredFlow extends Versioned {
  screen: string
  mode: string | null
  packId: string
  selectedScenarioId: string
  evidenceRevealed: boolean
  furthestFlowIndex: number
}

export function readFlow(): StoredFlow | undefined {
  return read<StoredFlow>(resolve('session'), FLOW_KEY)
}

export function writeFlow(flow: Omit<StoredFlow, 'version'>): void {
  write(resolve('session'), FLOW_KEY, flow)
}

// ----------------------------------------------------------------- prefs
// Outlives the tab, so a return visit reopens the pack last demoed.

export interface StoredPrefs extends Versioned {
  lastPackId: string
}

export function readPrefs(): StoredPrefs | undefined {
  return read<StoredPrefs>(resolve('local'), PREFS_KEY)
}

export function writePrefs(prefs: Omit<StoredPrefs, 'version'>): void {
  write(resolve('local'), PREFS_KEY, prefs)
}
