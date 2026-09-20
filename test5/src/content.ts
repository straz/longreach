// Loads content/ into the bundle and hands it out already typed.
//
// @rollup/plugin-yaml turns each .yml into an ES module at build time, so the
// content is frozen into the bundle: no YAML parser reaches the browser and
// there is no runtime fetch (docs/PLAN.md §4.3). The shapes below are the
// contract the screens code against; scripts/check-content.ts is what proves
// the YAML satisfies them, and it runs in `pnpm build`. The casts here are
// therefore checked — just not by the type system.

import type {
  CommitmentType,
  EvidenceShiftCategory,
  ScenarioTemplate,
} from './types.ts'
import type { FlexibilityWindowBand } from './compute.ts'

import manifestYaml from '../content/manifest.yml'
import routingYaml from '../content/routing.yml'
import copyYaml from '../content/copy.yml'

// ---------------------------------------------------------------- shapes

export interface ScenarioPack {
  label: string
  defaultScenario: string
  templates: string[]
}

export interface Manifest {
  defaultPack: string
  packs: Record<string, ScenarioPack>
}

export interface ClarityWeights {
  start: number
  commitmentKeyword: number
  evidenceShiftKeyword: number
  currencyAmount: number
  timingWord: number
  longWithClauses: number
  longMinChars: number
  min: number
  max: number
}

export interface Routing {
  typeToScenario: Record<CommitmentType, string>
  fallbackScenario: string
  limits: {
    briefContextMaxChars: number
    sourceTextMaxChars: number
  }
  commitmentKeywords: Record<Exclude<CommitmentType, 'strategic_other'>, string[]>
  evidenceShiftKeywords: Record<Exclude<EvidenceShiftCategory, 'unclear'>, string[]>
  clarityScore: ClarityWeights
  timingWords: string[]
  commitmentCategoryOverrideMinScore: number
  contextSummaries: Record<EvidenceShiftCategory, string>
}

export interface ClarityBand {
  maxScore: number
  text: string
}

export interface Copy {
  contact: {
    linkLabel: string
    email: string
    suffix: string
  }
  stepIndicator: string[]
  stepIndicatorStart: string
  landing: {
    eyebrow: string
    headline: string
    body: string
    primaryButton: string
    secondaryButton: string
    microcopy: string
    footer: string
  }
  customize: {
    headline: string
    body: string
    commitmentTypeLabel: string
    briefContextLabel: string
    briefContextHelper: string
    briefContextPlaceholder: string
    briefContextGuidance: string
    advancedTitle: string
    advancedHelper: string
    advancedPlaceholder: string
    primaryButton: string
    secondaryButton: string
    privacy: string
    sourceTextTooLong: string
    commitmentTypeRequired: string
  }
  recognizing: {
    headline: string
    statusRows: string[]
    footer: string
    holdMs: number
  }
  confirm: {
    headline: string
    commitmentTypeLabel: string
    contextRecognizedLabel: string
    focusLabel: string
    primaryButton: string
    secondaryButton: string
    editLink: string
    activeBandSet: string
    bandSets: Record<string, ClarityBand[]>
  }
  conditions: {
    headline: string
    commitmentCardLabel: string
    commitmentPickerLabel: string
    rationaleSectionTitle: string
    conditionsSectionTitle: string
    conditionColumnLabels: {
      status: string
      why: string
      watchedEvidence: string
      reconsiderationCondition: string
    }
    statusLabels: Record<'within_range' | 'new_evidence', string>
    initialButton: string
    revealHeadline: string
    nextButton: string
  }
  comparables: {
    headline: string
    body: string
    sectionTitle: string
    tableHeaders: string[]
    patternHeading: string
    patternStatement: string
    patternImplication: string
    button: string
  }
  receipt: {
    headline: string
    receiptTitle: string
    rowLabels: {
      activeCommitment: string
      owner: string
      evidenceShift: string
      capitalStillInPlay: string
      flexibilityWindow: string
      comparableLearning: string
      suggestedDecision: string
    }
    authorityLabel: string
    comparableLearningValue: string
    suggestedDecisionValue: string
    calloutLines: string[]
    possibleSectionTitle: string
    possibleBullets: string[]
    primarySupportingText: string
    secondaryButton: string
    footer: string
    disclosureLabel: string
    disclosureBody: string
  }
  commitmentTypeLabels: Record<CommitmentType, string>
  evidenceShiftCategoryLabels: Record<EvidenceShiftCategory, string>
  flexibilityWindowBands: Record<FlexibilityWindowBand, string>
}

// ---------------------------------------------------------------- loading

export const manifest = manifestYaml as Manifest
export const routing = routingYaml as Routing
export const copy = copyYaml as Copy

// Picks up a new template from dropping a file into content/scenarios/.
// A template still has to be listed in a pack in manifest.yml to be reachable.
const scenarioModules = import.meta.glob('../content/scenarios/*.yml', {
  eager: true,
  import: 'default',
}) as Record<string, ScenarioTemplate>

export const scenariosById: Record<string, ScenarioTemplate> = Object.fromEntries(
  Object.values(scenarioModules).map((scenario) => [scenario.id, scenario]),
)

// ---------------------------------------------------------------- lookups
//
// Every lookup below falls back rather than throwing. An unrecognized ?pack=
// or ?scenario= in a URL is a typo during a demo, not a reason to show the
// visitor a broken page (docs/PLAN.md §4.4).

export function getPack(packId?: string): ScenarioPack {
  if (packId !== undefined && packId in manifest.packs) {
    return manifest.packs[packId]!
  }
  return manifest.packs[manifest.defaultPack]!
}

export function getScenario(scenarioId: string): ScenarioTemplate | undefined {
  return scenariosById[scenarioId]
}

/**
 * Every template a pack offers, in the order manifest.yml lists them. This is
 * what the commitment picker on S1 shows.
 */
export function getPackScenarios(packId?: string): ScenarioTemplate[] {
  return getPack(packId)
    .templates.map((id) => getScenario(id))
    .filter((scenario): scenario is ScenarioTemplate => scenario !== undefined)
}

/**
 * The template a pack opens on, and the target of "Use the standard example".
 */
export function getDefaultScenario(packId?: string): ScenarioTemplate {
  const pack = getPack(packId)
  return (
    getScenario(pack.defaultScenario) ??
    getScenario(routing.fallbackScenario)!
  )
}

/**
 * Resolve an explicit scenario id against a pack, e.g. from ?scenario=.
 * Unknown ids, and ids outside the pack, fall back to the pack's default.
 */
export function resolveScenario(
  scenarioId: string | undefined,
  packId?: string,
): ScenarioTemplate {
  const pack = getPack(packId)
  if (scenarioId !== undefined && pack.templates.includes(scenarioId)) {
    const scenario = getScenario(scenarioId)
    if (scenario !== undefined) return scenario
  }
  return getDefaultScenario(packId)
}

/**
 * The menu selection on C1 is the fallback source of truth for which template
 * the custom path uses (docs/ARCHITECTURE.md §"Template routing").
 */
export function scenarioForCommitmentType(
  type: CommitmentType,
  packId?: string,
): ScenarioTemplate {
  return resolveScenario(routing.typeToScenario[type], packId)
}

/**
 * The clarity-band sentence for C3. The score is never displayed; it selects
 * wording only (docs/specification-analysis.md §"Post-processing rules").
 */
export function clarityBandText(score: number): string {
  // check-content.ts guarantees activeBandSet names a set, but `pnpm dev`
  // reloads YAML without re-running it, so fall back to whichever set is
  // first rather than to a hard-coded name that could itself be renamed.
  const bands =
    copy.confirm.bandSets[copy.confirm.activeBandSet] ??
    Object.values(copy.confirm.bandSets)[0]
  if (bands === undefined || bands.length === 0) return ''
  const band = bands.find((candidate) => score <= candidate.maxScore)
  return (band ?? bands[bands.length - 1]!).text
}
