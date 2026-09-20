import { useEffect, useState } from 'react'
import { copy } from '../content.ts'
import './Recognizing.css'

/**
 * C2. A brief, honest processing state.
 *
 * It never claims to be evaluating the original decision — the footer says so
 * outright. The status rows advance on a timer rather than tracking real work,
 * because with a local recognizer there is no real work to track; the screen is
 * held for content/copy.yml's `holdMs` so the step reads as considered rather
 * than as a flash (docs/README.md §C2).
 */
export function Recognizing() {
  const text = copy.recognizing
  const [visibleRows, setVisibleRows] = useState(1)

  useEffect(() => {
    const step = text.holdMs / text.statusRows.length
    const timers = text.statusRows.map((_row, index) =>
      setTimeout(() => setVisibleRows(index + 1), step * index),
    )
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
  }, [text.holdMs, text.statusRows])

  return (
    <div className="lr-recognizing">
      <h1 className="lr-recognizing__headline">{text.headline}</h1>

      <ol className="lr-recognizing__rows" aria-live="polite">
        {text.statusRows.slice(0, visibleRows).map((row, index) => (
          <li
            key={row}
            className={`lr-recognizing__row${
              index === visibleRows - 1 ? ' lr-recognizing__row--active' : ''
            }`}
          >
            <span className="lr-recognizing__marker" aria-hidden="true">
              {index === visibleRows - 1 ? '◦' : '•'}
            </span>
            {row}
          </li>
        ))}
      </ol>

      <p className="lr-recognizing__footer">{text.footer}</p>
    </div>
  )
}
