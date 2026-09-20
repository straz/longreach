// HTML entities used in content/copy.yml, and the decoding for them.
//
// Separate from richtext.tsx because scripts/check-content.ts imports it to
// verify the copy only uses entities the renderer knows, and Node can strip
// types from a .ts file but cannot parse the JSX in a .tsx one.

/**
 * Named entities worth having in prose. Deliberately a short list rather than
 * the full HTML table: scripts/check-content.ts fails the build on an entity
 * that is not here, so an unsupported one is caught at build time instead of
 * appearing raw on screen.
 */
export const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  larr: '←', rarr: '→', uarr: '↑', darr: '↓',
  harr: '↔', bull: '•', middot: '·', deg: '°',
  times: '×', divide: '÷', plusmn: '±',
  ne: '≠', le: '≤', ge: '≥', infin: '∞',
  copy: '©', reg: '®', trade: '™',
  euro: '€', pound: '£', yen: '¥', cent: '¢',
  frac12: '½', frac14: '¼', frac34: '¾',
}

export const ENTITY_PATTERN = /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g

/** Returns the names of any entities in `text` that are not supported. */
export function unsupportedEntities(text: string): string[] {
  const missing: string[] = []
  for (const [, name] of text.matchAll(ENTITY_PATTERN)) {
    if (name!.startsWith('#')) continue
    if (!(name! in ENTITIES) && !missing.includes(name!)) missing.push(name!)
  }
  return missing
}

export function decodeEntities(text: string): string {
  return text.replace(ENTITY_PATTERN, (whole, name: string) => {
    if (name.startsWith('#x') || name.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(name.slice(2), 16))
    }
    if (name.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(name.slice(1), 10))
    }
    // An unknown entity stays as written, so it is visible rather than silent.
    return ENTITIES[name] ?? whole
  })
}
