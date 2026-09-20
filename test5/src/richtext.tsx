// A very small Markdown subset for the strings in content/copy.yml.
//
// Not a Markdown library: those bring a parser, a sanitizer and an innerHTML
// call for what amounts to paragraphs, emphasis and the odd entity. This
// renders to React elements instead, so everything is escaped by construction
// and there is no innerHTML anywhere.
//
// Entity handling lives in ./entities.ts.
//
// Supported:
//   - paragraphs, split on a blank line (a folded YAML block yields "\n")
//   - **bold**, *italic* and _italic_
//   - [text](https://example.com) links
//   - HTML entities, named or numeric
//
// Anything else is rendered as the literal text it is.

import type { ReactNode } from 'react'
import { decodeEntities } from './entities.ts'

export { decodeEntities, ENTITIES, unsupportedEntities } from './entities.ts'

// Links first, then bold, so "**a**" is not read as an italic wrapping "*a*".
const INLINE =
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*\n]+)\*|_([^_\n]+)_/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0
  let index = 0

  for (const match of text.matchAll(INLINE)) {
    const at = match.index
    if (at > cursor) nodes.push(decodeEntities(text.slice(cursor, at)))

    const [, linkText, href, bold, star, underscore] = match
    const key = `${keyPrefix}-${index}`
    if (href !== undefined && linkText !== undefined) {
      nodes.push(
        <a key={key} href={href}>
          {decodeEntities(linkText)}
        </a>,
      )
    } else if (bold !== undefined) {
      nodes.push(<strong key={key}>{decodeEntities(bold)}</strong>)
    } else {
      const italic = star ?? underscore
      nodes.push(<em key={key}>{decodeEntities(italic!)}</em>)
    }

    cursor = at + match[0].length
    index += 1
  }

  if (cursor < text.length) nodes.push(decodeEntities(text.slice(cursor)))
  return nodes
}

/** Splits on blank lines. A folded YAML block turns one into "\n". */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n|\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
}

/**
 * Renders one copy string. Each paragraph becomes its own <p>, so a blank line
 * in copy.yml is a paragraph break on screen.
 */
export function RichText({ children, className }: { children: string; className?: string }) {
  const paragraphs = toParagraphs(children)
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={paragraph.slice(0, 32) + index} className={className}>
          {renderInline(paragraph, String(index))}
        </p>
      ))}
    </>
  )
}
