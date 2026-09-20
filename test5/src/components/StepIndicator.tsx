import { useEffect, useRef } from 'react'
import type { AppScreen } from '../types.ts'
import { FLOW_SCREENS } from '../state.ts'
import './StepIndicator.css'

/**
 * The chevron rail across S1-S3.
 *
 * Every step already seen is a button, in both directions: stepping back must
 * not erase the way forward, or a visitor who glances at an earlier screen has
 * to click through the whole example again. Steps not yet reached are plain
 * text — something unreachable should not look or behave like a control.
 *
 * Order is carried by the chevron shape rather than by numbering, so the
 * labels are bare nouns. The leading Start chevron restarts the example and
 * returns to the landing screen.
 */
export function StepIndicator({
  labels,
  startLabel,
  current,
  furthestIndex,
  onGoTo,
  onRestart,
}: {
  labels: string[]
  startLabel: string
  current: AppScreen
  furthestIndex: number
  onGoTo: (screen: AppScreen) => void
  onRestart: () => void
}) {
  const currentIndex = FLOW_SCREENS.indexOf(current)
  const listRef = useRef<HTMLOListElement>(null)

  // On a narrow screen the rail scrolls, so the step you are on must be
  // brought into view rather than left off the right-hand edge.
  useEffect(() => {
    const list = listRef.current
    if (list === null || currentIndex < 0) return
    const item = list.children[currentIndex + 1] as HTMLElement | undefined
    if (item === undefined || list.scrollWidth <= list.clientWidth) return
    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    item.scrollIntoView({
      behavior: motionOk ? 'smooth' : 'auto',
      inline: 'nearest',
      block: 'nearest',
    })
  }, [currentIndex])

  if (currentIndex < 0) return null

  return (
    <nav className="lr-steps" aria-label="Example progress">
      <ol className="lr-steps__list" ref={listRef}>
        {/* Always available: the visitor is past it by definition. It restarts
            the example rather than just navigating, so returning to the
            landing screen leaves nothing half-finished behind it. */}
        <li className="lr-steps__item lr-steps__item--seen lr-steps__item--start">
          <button type="button" className="lr-steps__link" onClick={onRestart}>
            {startLabel}
          </button>
        </li>

        {labels.map((label, index) => {
          const state =
            index === currentIndex
              ? 'current'
              : index <= Math.max(furthestIndex, currentIndex)
                ? 'seen'
                : 'upcoming'
          const target = FLOW_SCREENS[index]

          return (
            <li key={label} className={`lr-steps__item lr-steps__item--${state}`}>
              {state === 'seen' && target !== undefined ? (
                <button
                  type="button"
                  className="lr-steps__link"
                  onClick={() => onGoTo(target)}
                >
                  {label}
                </button>
              ) : (
                <span
                  className="lr-steps__label"
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  {label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
