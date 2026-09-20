// Greps the built bundle for phrases the product must never say.
//
// Tone regressions are invisible to a type checker and survive code review,
// because each one reads as a small, reasonable edit (docs/PLAN.md R9). This
// runs after `vite build`, against what actually ships — not against the
// sources — so a phrase hard-coded in a component is caught as readily as one
// added to content/copy.yml.
//
//   node scripts/check-tone.ts

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as loadYaml } from 'js-yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')

const config = loadYaml(
  readFileSync(join(root, 'content', 'prohibited-phrases.yml'), 'utf8'),
) as { phrases?: unknown; alsoAvoid?: unknown }

function asPhrases(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    console.error(`prohibited-phrases.yml: "${field}" must be a list of strings`)
    process.exit(1)
  }
  return (value as string[]).map((phrase) => phrase.toLowerCase().trim())
}

const phrases = [
  ...asPhrases(config.phrases, 'phrases'),
  ...asPhrases(config.alsoAvoid, 'alsoAvoid'),
]

function filesIn(dir: string): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    console.error(
      `tone check: ${relative(root, dir)} not found. Run it after \`vite build\`.`,
    )
    process.exit(1)
  }
  return entries.flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? filesIn(full) : [full]
  })
}

const scannable = filesIn(distDir).filter((file) => /\.(js|css|html)$/.test(file))
if (scannable.length === 0) {
  console.error('tone check: nothing to scan in dist/')
  process.exit(1)
}

const found: string[] = []

for (const file of scannable) {
  // Collapse whitespace so a phrase split across a line break still matches.
  const haystack = readFileSync(file, 'utf8').toLowerCase().replace(/\s+/g, ' ')
  for (const phrase of phrases) {
    if (haystack.includes(phrase)) {
      found.push(`${relative(root, file)}: "${phrase}"`)
    }
  }
}

if (found.length > 0) {
  console.error(
    `tone check failed — the build contains ${found.length} prohibited phrase${found.length === 1 ? '' : 's'}:\n`,
  )
  for (const entry of found) console.error(`  - ${entry}`)
  console.error(
    '\nThe demo must never imply the original decision was wrong. See docs/README.md §"Customer-facing vocabulary".\n',
  )
  process.exit(1)
}

console.log(
  `tone check passed: ${phrases.length} phrases, ${scannable.length} built files.`,
)
