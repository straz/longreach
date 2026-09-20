// @vitest-environment jsdom
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RichText, toParagraphs } from './richtext.tsx'
import { decodeEntities, unsupportedEntities } from './entities.ts'
import { copy } from './content.ts'

describe('paragraphs', () => {
  // A folded YAML block turns a blank line into "\n", which is how copy.yml
  // writes a paragraph break.
  test('a blank line becomes a second paragraph', () => {
    const { container } = render(<RichText>{'First para.\n\nSecond para.'}</RichText>)
    const paragraphs = [...container.querySelectorAll('p')].map((p) => p.textContent)
    expect(paragraphs).toEqual(['First para.', 'Second para.'])
  })

  test('a single newline does too, which is what folded YAML yields', () => {
    expect(toParagraphs('One.\nTwo.')).toEqual(['One.', 'Two.'])
  })

  test('plain copy still renders as one paragraph', () => {
    const { container } = render(<RichText>Just one sentence.</RichText>)
    expect(container.querySelectorAll('p')).toHaveLength(1)
  })

  test('the class goes on every paragraph', () => {
    const { container } = render(<RichText className="x">{'A.\n\nB.'}</RichText>)
    expect([...container.querySelectorAll('p.x')]).toHaveLength(2)
  })
})

describe('entities', () => {
  test('decodes named and numeric forms alike', () => {
    expect(decodeEntities('a &rarr; b')).toBe('a → b')
    expect(decodeEntities('&mdash;&nbsp;&hellip;')).toBe('— …')
    expect(decodeEntities('&#8594; &#x2192;')).toBe('→ →')
  })

  test('renders the decoded character, not the markup', () => {
    render(<RichText>{'See what changed &rarr;'}</RichText>)
    expect(screen.getByText('See what changed →')).toBeInTheDocument()
  })

  test('an unknown entity is left visible rather than silently dropped', () => {
    expect(decodeEntities('&nope;')).toBe('&nope;')
    expect(unsupportedEntities('&nope; and &rarr;')).toEqual(['nope'])
  })
})

describe('inline marks', () => {
  test('bold, italic and links', () => {
    const { container } = render(
      <RichText>{'**bold** and *italic* and _also_ and [a link](https://example.com)'}</RichText>,
    )
    expect(container.querySelector('strong')?.textContent).toBe('bold')
    expect([...container.querySelectorAll('em')].map((e) => e.textContent)).toEqual([
      'italic',
      'also',
    ])
    const link = container.querySelector('a')
    expect(link?.textContent).toBe('a link')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  test('markup is never injected as HTML', () => {
    const { container } = render(<RichText>{'<img src=x onerror=alert(1)> &lt;b&gt;'}</RichText>)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('b')).toBeNull()
    expect(container.textContent).toBe('<img src=x onerror=alert(1)> <b>')
  })

  test('text with no marks is returned unchanged', () => {
    render(<RichText>A plain sentence, with a comma.</RichText>)
    expect(screen.getByText('A plain sentence, with a comma.')).toBeInTheDocument()
  })
})

describe('the copy it actually renders', () => {
  test('both rich-text bodies decode cleanly', () => {
    for (const body of [copy.landing.body, copy.comparables.body]) {
      expect(unsupportedEntities(body)).toEqual([])
    }
  })
})
