// Validates everything under content/ before it can reach a prospect.
//
// Runs in `pnpm build` and in CI. The YAML in content/ is hand-edited — that
// is the point of keeping it there — so this is what stops a bad edit from
// shipping. Node strips the types; there is no build step for this file.
//
//   node scripts/check-content.ts
//
// It deliberately reuses formatCapital() from src/compute.ts rather than
// reimplementing it: the check is that the real formatter produces the figure
// docs/SCENARIO_CONTENT.md states, not that two copies of the same arithmetic
// agree with each other.

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as loadYaml } from 'js-yaml'
import { formatCapital } from '../src/compute.ts'
import { unsupportedEntities } from '../src/entities.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'content')
const scenarioDir = join(contentDir, 'scenarios')

const COMMITMENT_TYPES = [
  'market_expansion',
  'technology_transformation',
  'acquisition_integration',
  'capital_expansion',
  'investment_allocation',
  'strategic_other',
]

const EVIDENCE_SHIFT_CATEGORIES = [
  'economics',
  'demand',
  'cost',
  'schedule',
  'execution',
  'customer_retention',
  'regulatory',
  'unclear',
]

const CONDITION_STATUSES = ['within_range', 'new_evidence']

const FLEXIBILITY_BANDS = ['immediate', 'open', 'developing', 'longerDated']

const errors: string[] = []

function check(ok: boolean, message: string): void {
  if (!ok) errors.push(message)
}

function load(file: string): Record<string, unknown> {
  const parsed = loadYaml(readFileSync(file, 'utf8'))
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    errors.push(`${basename(file)}: expected a YAML mapping at the top level`)
    return {}
  }
  return parsed as Record<string, unknown>
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isStringArray(value: unknown, minLength: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minLength &&
    value.every(isNonEmptyString)
  )
}

/** Requires every named key to be a non-empty string. */
function requireStrings(
  where: string,
  source: Record<string, unknown>,
  keys: string[],
): void {
  for (const key of keys) {
    check(isNonEmptyString(source[key]), `${where}: "${key}" must be a non-empty string`)
  }
}

/** Walks a dotted path, requiring a non-empty string or array of them at the end. */
function requirePath(where: string, source: unknown, path: string, minItems?: number): void {
  let cursor: unknown = source
  for (const segment of path.split('.')) {
    if (cursor === null || typeof cursor !== 'object') {
      errors.push(`${where}: missing "${path}"`)
      return
    }
    cursor = (cursor as Record<string, unknown>)[segment]
  }
  if (minItems === undefined) {
    check(isNonEmptyString(cursor), `${where}: "${path}" must be a non-empty string`)
  } else {
    check(
      isStringArray(cursor, minItems),
      `${where}: "${path}" must be an array of at least ${minItems} non-empty strings`,
    )
  }
}

// ------------------------------------------------------------- scenarios

const scenarioFiles = readdirSync(scenarioDir).filter((name) => name.endsWith('.yml'))
check(scenarioFiles.length > 0, 'content/scenarios: no .yml templates found')

const scenarioIds = new Set<string>()

for (const file of scenarioFiles) {
  const where = `scenarios/${file}`
  const scenario = load(join(scenarioDir, file))

  requireStrings(where, scenario, [
    'id',
    'type',
    'title',
    'amountLabel',
    'activeCommitmentText',
    'description',
    'authority',
    'owner',
    'evidenceShiftConditionId',
    'evidenceShiftStatement',
    'evidenceShiftInterpretation',
    'expectedCapitalStillInPlayLabel',
    'lockInDescription',
    'flexibilityWindowText',
    'receiptCommitmentText',
  ])

  // The receipt drops the leading verb phrase but must otherwise say exactly
  // what the commitment card says, so the two cannot drift apart.
  if (
    isNonEmptyString(scenario.activeCommitmentText) &&
    isNonEmptyString(scenario.receiptCommitmentText)
  ) {
    check(
      scenario.activeCommitmentText.endsWith(scenario.receiptCommitmentText),
      `${where}: "receiptCommitmentText" must be the tail of "activeCommitmentText"`,
    )
  }

  const id = scenario.id
  if (isNonEmptyString(id)) {
    check(id === file.replace(/\.yml$/, ''), `${where}: "id" must match the filename`)
    check(!scenarioIds.has(id), `${where}: duplicate scenario id "${id}"`)
    scenarioIds.add(id)
  }

  check(
    typeof scenario.type === 'string' && COMMITMENT_TYPES.includes(scenario.type),
    `${where}: "type" must be one of ${COMMITMENT_TYPES.join(', ')}`,
  )

  check(
    isStringArray(scenario.rationale, 1),
    `${where}: "rationale" must be a non-empty array of strings`,
  )

  // One or two sentences. Longer and it stops being scannable at a glance,
  // which is the only reason it sits above the table.
  if (isNonEmptyString(scenario.description)) {
    const words = scenario.description.trim().split(/\s+/).length
    const sentences = scenario.description.trim().split(/[.!?](?:\s|$)/).filter(Boolean).length
    check(
      words <= 40,
      `${where}: "description" is ${words} words; keep it to 40 or fewer`,
    )
    check(
      sentences <= 2,
      `${where}: "description" runs to ${sentences} sentences; keep it to one or two`,
    )
  }

  // Conditions. Exactly one carries the evidence shift, and it must be the one
  // the template names — otherwise S1 highlights a row that does not match the
  // reveal statement.
  const conditions = scenario.conditions
  if (!Array.isArray(conditions) || conditions.length === 0) {
    errors.push(`${where}: "conditions" must be a non-empty array`)
  } else {
    const conditionIds = new Set<string>()
    for (const [index, raw] of conditions.entries()) {
      const at = `${where}: conditions[${index}]`
      if (raw === null || typeof raw !== 'object') {
        errors.push(`${at}: must be a mapping`)
        continue
      }
      const condition = raw as Record<string, unknown>
      requireStrings(at, condition, [
        'id',
        'label',
        'watchedEvidence',
        'reconsiderationCondition',
        'why',
      ])
      check(
        typeof condition.status === 'string' &&
          CONDITION_STATUSES.includes(condition.status),
        `${at}: "status" must be one of ${CONDITION_STATUSES.join(', ')}`,
      )
      if (isNonEmptyString(condition.id)) {
        check(!conditionIds.has(condition.id), `${at}: duplicate condition id "${condition.id}"`)
        conditionIds.add(condition.id)
      }
    }

    // The table pairs each condition with a rationale bullet, so the two must
    // hold the same sentences: a "why" invented here, or a bullet left
    // unpaired, would put words on screen the spec never authored.
    const whys = conditions
      .map((condition) =>
        condition !== null && typeof condition === 'object'
          ? (condition as Record<string, unknown>).why
          : undefined,
      )
      .filter(isNonEmptyString)
      .sort()
    if (isStringArray(scenario.rationale, 1) && whys.length === conditions.length) {
      const bullets = [...scenario.rationale].sort()
      check(
        whys.length === bullets.length && whys.every((why, index) => why === bullets[index]),
        `${where}: every condition's "why" must be one of the "rationale" bullets, each used once`,
      )
    }

    const shifted = conditions.filter(
      (condition) =>
        condition !== null &&
        typeof condition === 'object' &&
        (condition as Record<string, unknown>).status === 'new_evidence',
    )
    check(
      shifted.length === 1,
      `${where}: exactly one condition must have status "new_evidence" (found ${shifted.length})`,
    )
    if (shifted.length === 1) {
      const shiftedId = (shifted[0] as Record<string, unknown>).id
      check(
        shiftedId === scenario.evidenceShiftConditionId,
        `${where}: "evidenceShiftConditionId" is "${String(scenario.evidenceShiftConditionId)}" but the shifted condition is "${String(shiftedId)}"`,
      )
    }
  }

  // Capital. The expected label is transcribed by hand from
  // docs/SCENARIO_CONTENT.md; deriving it from the components would make this
  // check circular and prove nothing (docs/PLAN.md §4.2).
  const planned = scenario.plannedUncommittedCapital
  const changeable = scenario.practicallyChangeableCapital
  const irreversible = scenario.irreversiblyCommittedCapital
  const capitalFields: [string, unknown][] = [
    ['plannedUncommittedCapital', planned],
    ['practicallyChangeableCapital', changeable],
    ['irreversiblyCommittedCapital', irreversible],
  ]
  let capitalOk = true
  for (const [key, value] of capitalFields) {
    const ok = typeof value === 'number' && Number.isFinite(value) && value >= 0
    check(ok, `${where}: "${key}" must be a non-negative number`)
    if (!ok) capitalOk = false
  }

  if (capitalOk) {
    const stillInPlay = formatCapital((planned as number) + (changeable as number))
    check(
      stillInPlay === scenario.expectedCapitalStillInPlayLabel,
      `${where}: planned + changeable formats to ${stillInPlay}, but "expectedCapitalStillInPlayLabel" says ${String(scenario.expectedCapitalStillInPlayLabel)}`,
    )

    // The three components are the whole commitment, so they must agree with
    // the amount shown on the commitment card.
    const total = (planned as number) + (changeable as number) + (irreversible as number)
    const amountLabel = scenario.amountLabel
    if (isNonEmptyString(amountLabel)) {
      const stated = Number(amountLabel.replace(/[^0-9.]/g, ''))
      check(
        Number.isFinite(stated) && Math.abs(total / 1_000_000 - stated) < 0.05,
        `${where}: capital components total $${(total / 1_000_000).toFixed(1)}M, but "amountLabel" says ${amountLabel}`,
      )
    }
  }

  // Flexibility window. The full sentence is stored because two templates end
  // it differently, so both halves are tied back to the structured fields.
  const days = scenario.flexibilityWindowDays
  const daysOk = typeof days === 'number' && Number.isInteger(days) && days > 0
  check(daysOk, `${where}: "flexibilityWindowDays" must be a positive integer`)
  const windowText = scenario.flexibilityWindowText
  if (daysOk && isNonEmptyString(windowText)) {
    check(
      windowText.startsWith(`${days} days before `),
      `${where}: "flexibilityWindowText" must start with "${days} days before "`,
    )
    if (isNonEmptyString(scenario.lockInDescription)) {
      check(
        windowText.includes(scenario.lockInDescription),
        `${where}: "flexibilityWindowText" must contain "lockInDescription"`,
      )
    }
  }

  // Comparables. docs/README.md §S2 shows three; the pattern sentence reads as
  // a count out of them, so fewer would not demonstrate a pattern.
  const comparables = scenario.comparableCommitments
  if (!Array.isArray(comparables) || comparables.length < 3) {
    errors.push(`${where}: "comparableCommitments" must have at least 3 entries`)
  } else {
    for (const [index, raw] of comparables.entries()) {
      const at = `${where}: comparableCommitments[${index}]`
      if (raw === null || typeof raw !== 'object') {
        errors.push(`${at}: must be a mapping`)
        continue
      }
      const comparable = raw as Record<string, unknown>
      requireStrings(at, comparable, [
        'year',
        'title',
        'relevantCondition',
        'evidenceShift',
        'whatHappenedNext',
      ])
      check(
        typeof comparable.changedBeforeScheduledReview === 'boolean',
        `${at}: "changedBeforeScheduledReview" must be a boolean`,
      )
      check(
        comparable.reviewedAfterLockIn === undefined ||
          typeof comparable.reviewedAfterLockIn === 'boolean',
        `${at}: "reviewedAfterLockIn" must be a boolean when present`,
      )
    }
  }
}

// -------------------------------------------------------------- manifest

const manifest = load(join(contentDir, 'manifest.yml'))
const packs = manifest.packs

if (packs === null || typeof packs !== 'object' || Array.isArray(packs)) {
  errors.push('manifest.yml: "packs" must be a mapping')
} else {
  const packEntries = Object.entries(packs as Record<string, unknown>)
  check(packEntries.length > 0, 'manifest.yml: at least one pack is required')
  check(
    typeof manifest.defaultPack === 'string' &&
      manifest.defaultPack in (packs as Record<string, unknown>),
    `manifest.yml: "defaultPack" must name a pack`,
  )

  for (const [packId, raw] of packEntries) {
    const at = `manifest.yml: packs.${packId}`
    if (raw === null || typeof raw !== 'object') {
      errors.push(`${at}: must be a mapping`)
      continue
    }
    const pack = raw as Record<string, unknown>
    requireStrings(at, pack, ['label', 'defaultScenario'])

    if (!isStringArray(pack.templates, 1)) {
      errors.push(`${at}: "templates" must be a non-empty array of scenario ids`)
      continue
    }
    for (const templateId of pack.templates) {
      check(scenarioIds.has(templateId), `${at}: unknown template "${templateId}"`)
    }
    check(
      typeof pack.defaultScenario === 'string' &&
        pack.templates.includes(pack.defaultScenario),
      `${at}: "defaultScenario" must be listed in "templates"`,
    )
  }
}

// --------------------------------------------------------------- routing

const routing = load(join(contentDir, 'routing.yml'))
const typeToScenario = routing.typeToScenario

if (typeToScenario === null || typeof typeToScenario !== 'object') {
  errors.push('routing.yml: "typeToScenario" must be a mapping')
} else {
  const map = typeToScenario as Record<string, unknown>
  // Every commitment type must route somewhere: C1 offers all six pills, and
  // a selection alone has to be enough to reach a scenario.
  for (const type of COMMITMENT_TYPES) {
    const target = map[type]
    if (!isNonEmptyString(target)) {
      errors.push(`routing.yml: "typeToScenario.${type}" is missing`)
      continue
    }
    check(scenarioIds.has(target), `routing.yml: "typeToScenario.${type}" names unknown template "${target}"`)
  }
  for (const key of Object.keys(map)) {
    check(COMMITMENT_TYPES.includes(key), `routing.yml: "typeToScenario.${key}" is not a commitment type`)
  }
}

check(
  isNonEmptyString(routing.fallbackScenario) && scenarioIds.has(routing.fallbackScenario),
  'routing.yml: "fallbackScenario" must name an existing template',
)

const limits = routing.limits
if (limits === null || typeof limits !== 'object') {
  errors.push('routing.yml: "limits" must be a mapping')
} else {
  for (const key of ['briefContextMaxChars', 'sourceTextMaxChars']) {
    const value = (limits as Record<string, unknown>)[key]
    check(
      typeof value === 'number' && Number.isInteger(value) && value > 0,
      `routing.yml: "limits.${key}" must be a positive integer`,
    )
  }
}

// The recognizer's rules live in content so they can be tuned without touching
// src/jev/mock.ts. A missing list would silently stop a category from ever
// being recognized, which is exactly the kind of failure nobody notices.
//
// Two categories are deliberately absent: 'strategic_other' and 'unclear' are
// the no-match outcomes. They are what the recognizer returns when nothing
// matched, so giving either its own keywords would stop them working.
const keywordGroups: [string, string[]][] = [
  [
    'commitmentKeywords',
    COMMITMENT_TYPES.filter((type) => type !== 'strategic_other'),
  ],
  [
    'evidenceShiftKeywords',
    EVIDENCE_SHIFT_CATEGORIES.filter((category) => category !== 'unclear'),
  ],
]

for (const [field, expected] of keywordGroups) {
  const group = routing[field]
  if (group === null || typeof group !== 'object') {
    errors.push(`routing.yml: "${field}" must be a mapping`)
    continue
  }
  const entries = group as Record<string, unknown>
  for (const name of expected) {
    check(isStringArray(entries[name], 1), `routing.yml: "${field}.${name}" must be a non-empty list`)
  }
  for (const name of Object.keys(entries)) {
    check(expected.includes(name), `routing.yml: "${field}.${name}" is not a known key`)
  }
}

check(isStringArray(routing.timingWords, 1), 'routing.yml: "timingWords" must be a non-empty list')

const clarity = routing.clarityScore
if (clarity === null || typeof clarity !== 'object') {
  errors.push('routing.yml: "clarityScore" must be a mapping')
} else {
  const weights = clarity as Record<string, unknown>
  for (const key of [
    'start',
    'commitmentKeyword',
    'evidenceShiftKeyword',
    'currencyAmount',
    'timingWord',
    'longWithClauses',
    'longMinChars',
    'min',
    'max',
  ]) {
    check(
      typeof weights[key] === 'number' && Number.isInteger(weights[key]),
      `routing.yml: "clarityScore.${key}" must be an integer`,
    )
  }
  check(
    weights.min === 1 && weights.max === 10,
    'routing.yml: "clarityScore" must clamp to 1-10, the range the recognizer contract defines',
  )
}

const overrideMin = routing.commitmentCategoryOverrideMinScore
check(
  typeof overrideMin === 'number' && overrideMin >= 1 && overrideMin <= 10,
  'routing.yml: "commitmentCategoryOverrideMinScore" must be a score between 1 and 10',
)

// Every evidence-shift category needs a pre-authored sentence, including
// 'unclear': C3 renders one of these instead of the visitor's own words.
const summaries = routing.contextSummaries
if (summaries === null || typeof summaries !== 'object') {
  errors.push('routing.yml: "contextSummaries" must be a mapping')
} else {
  const entries = summaries as Record<string, unknown>
  for (const category of EVIDENCE_SHIFT_CATEGORIES) {
    const summary = entries[category]
    if (!isNonEmptyString(summary)) {
      errors.push(`routing.yml: "contextSummaries.${category}" is missing`)
      continue
    }
    // The recognizer contract caps both summaries at 20 words.
    check(
      summary.trim().split(/\s+/).length <= 20,
      `routing.yml: "contextSummaries.${category}" must be 20 words or fewer`,
    )
  }
  for (const name of Object.keys(entries)) {
    check(
      EVIDENCE_SHIFT_CATEGORIES.includes(name),
      `routing.yml: "contextSummaries.${name}" is not an evidence-shift category`,
    )
  }
}

// ------------------------------------------------------------------ copy

const copy = load(join(contentDir, 'copy.yml'))

requirePath('copy.yml', copy, 'stepIndicator', 3)
requirePath('copy.yml', copy, 'stepIndicatorStart')
for (const path of [
  'landing.eyebrow',
  'landing.headline',
  'landing.body',
  'landing.primaryButton',
  'landing.secondaryButton',
  'landing.microcopy',
  'landing.footer',
  'customize.headline',
  'customize.body',
  'customize.commitmentTypeLabel',
  'customize.briefContextLabel',
  'customize.briefContextHelper',
  'customize.briefContextPlaceholder',
  'customize.briefContextGuidance',
  'customize.advancedTitle',
  'customize.advancedHelper',
  'customize.advancedPlaceholder',
  'customize.primaryButton',
  'customize.secondaryButton',
  'customize.privacy',
  'customize.sourceTextTooLong',
  'customize.commitmentTypeRequired',
  'recognizing.headline',
  'recognizing.footer',
  'confirm.headline',
  'confirm.commitmentTypeLabel',
  'confirm.contextRecognizedLabel',
  'confirm.focusLabel',
  'confirm.primaryButton',
  'confirm.secondaryButton',
  'confirm.editLink',
  'conditions.headline',
  'conditions.commitmentCardLabel',
  'conditions.commitmentPickerLabel',
  'conditions.rationaleSectionTitle',
  'conditions.conditionsSectionTitle',
  'conditions.conditionColumnLabels.why',
  'conditions.conditionColumnLabels.watchedEvidence',
  'conditions.conditionColumnLabels.reconsiderationCondition',
  'conditions.conditionColumnLabels.status',
  'conditions.statusLabels.within_range',
  'conditions.statusLabels.new_evidence',
  'conditions.initialButton',
  'conditions.revealHeadline',
  'conditions.nextButton',
  'comparables.headline',
  'comparables.body',
  'comparables.sectionTitle',
  'comparables.patternHeading',
  'comparables.patternStatement',
  'comparables.patternImplication',
  'comparables.button',
  'receipt.headline',
  'receipt.receiptTitle',
  'receipt.rowLabels.activeCommitment',
  'receipt.rowLabels.owner',
  'receipt.rowLabels.evidenceShift',
  'receipt.rowLabels.capitalStillInPlay',
  'receipt.rowLabels.flexibilityWindow',
  'receipt.rowLabels.comparableLearning',
  'receipt.rowLabels.suggestedDecision',
  'receipt.authorityLabel',
  'receipt.comparableLearningValue',
  'receipt.suggestedDecisionValue',
  'receipt.possibleSectionTitle',
  'contact.linkLabel',
  'contact.suffix',
  'receipt.primarySupportingText',
  'receipt.secondaryButton',
  'receipt.footer',
  'receipt.disclosureLabel',
  'receipt.disclosureBody',
]) {
  requirePath('copy.yml', copy, path)
}

requirePath('copy.yml', copy, 'recognizing.statusRows', 4)
requirePath('copy.yml', copy, 'comparables.tableHeaders', 4)
requirePath('copy.yml', copy, 'receipt.calloutLines', 2)
requirePath('copy.yml', copy, 'receipt.possibleBullets', 3)

// The footer's call to action points off-site, so a typo here is a dead end
// on every screen rather than on one.
const contactCopy = copy.contact as Record<string, unknown> | undefined
const contactUrl = contactCopy?.url
check(
  isNonEmptyString(contactUrl) && /^https:\/\/[^\s]+$/.test(contactUrl),
  'copy.yml: "contact.url" must be an https URL',
)

const comparablesCopy = copy.comparables as Record<string, unknown> | undefined
const patternStatement = comparablesCopy?.patternStatement
if (isNonEmptyString(patternStatement)) {
  for (const token of ['{early}', '{total}']) {
    check(
      patternStatement.includes(token),
      `copy.yml: "comparables.patternStatement" must contain ${token}`,
    )
  }
  check(
    !/\d\s*%|percent/i.test(patternStatement),
    'copy.yml: "comparables.patternStatement" must read as a count, not a percentage',
  )
}

const recognizing = copy.recognizing as Record<string, unknown> | undefined
const holdMs = recognizing?.holdMs
check(
  typeof holdMs === 'number' && holdMs >= 800 && holdMs <= 1400,
  'copy.yml: "recognizing.holdMs" must be 800-1400, the range docs/README.md §C2 sets',
)

// Clarity bands. Unresolved between two bands and three (docs/PLAN.md R5), so
// both sets live here; whichever is active must still cover the whole 1-10
// range in ascending order.
const confirm = copy.confirm as Record<string, unknown> | undefined
const bandSets = confirm?.bandSets
if (bandSets === null || typeof bandSets !== 'object') {
  errors.push('copy.yml: "confirm.bandSets" must be a mapping')
} else {
  const sets = bandSets as Record<string, unknown>
  check(
    typeof confirm?.activeBandSet === 'string' && confirm.activeBandSet in sets,
    'copy.yml: "confirm.activeBandSet" must name a band set',
  )
  for (const [setName, raw] of Object.entries(sets)) {
    const at = `copy.yml: confirm.bandSets.${setName}`
    if (!Array.isArray(raw) || raw.length === 0) {
      errors.push(`${at}: must be a non-empty array`)
      continue
    }
    let previous = 0
    for (const [index, entry] of raw.entries()) {
      if (entry === null || typeof entry !== 'object') {
        errors.push(`${at}[${index}]: must be a mapping`)
        continue
      }
      const band = entry as Record<string, unknown>
      check(isNonEmptyString(band.text), `${at}[${index}]: "text" must be a non-empty string`)
      const maxScore = band.maxScore
      if (typeof maxScore !== 'number' || !Number.isInteger(maxScore)) {
        errors.push(`${at}[${index}]: "maxScore" must be an integer`)
        continue
      }
      check(maxScore > previous, `${at}[${index}]: "maxScore" must ascend`)
      previous = maxScore
    }
    check(previous === 10, `${at}: the last "maxScore" must be 10 to cover the whole range`)
  }
}

// Label maps must be total: a missing key renders as blank on screen.
for (const [key, expected] of [
  ['commitmentTypeLabels', COMMITMENT_TYPES],
  ['evidenceShiftCategoryLabels', EVIDENCE_SHIFT_CATEGORIES],
  ['flexibilityWindowBands', FLEXIBILITY_BANDS],
] as [string, string[]][]) {
  const map = copy[key]
  if (map === null || typeof map !== 'object') {
    errors.push(`copy.yml: "${key}" must be a mapping`)
    continue
  }
  const entries = map as Record<string, unknown>
  for (const name of expected) {
    check(isNonEmptyString(entries[name]), `copy.yml: "${key}.${name}" is missing`)
  }
  for (const name of Object.keys(entries)) {
    check(expected.includes(name), `copy.yml: "${key}.${name}" is not a known key`)
  }
}

// Every HTML entity used anywhere in the copy must be one the renderer knows,
// or it reaches the screen as the literal "&rarr;".
function walkStrings(value: unknown, path: string, visit: (text: string, at: string) => void) {
  if (typeof value === 'string') return visit(value, path)
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${path}[${index}]`, visit))
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      walkStrings(child, path === '' ? key : `${path}.${key}`, visit)
    }
  }
}

walkStrings(copy, '', (text, at) => {
  for (const name of unsupportedEntities(text)) {
    errors.push(
      `copy.yml: "${at}" uses &${name};, which the renderer does not support — add it to ENTITIES in src/entities.ts or write the character directly`,
    )
  }
})

// ---------------------------------------------------------------- report

if (errors.length > 0) {
  console.error(`content check failed (${errors.length} problem${errors.length === 1 ? '' : 's'}):\n`)
  for (const error of errors) console.error(`  - ${error}`)
  console.error('')
  process.exit(1)
}

console.log(
  `content check passed: ${scenarioFiles.length} scenario templates, manifest, routing, copy.`,
)
