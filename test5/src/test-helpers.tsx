// Navigation shared by the test files.
//
// Each file had grown its own version of "click through to the receipt", so
// the same four button names were spelled out in three places and a copy
// change meant fixing all three. The button names come from copy.yml, so
// these follow a wording change on their own.

import { render, screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { expect } from 'vitest'

import App from './App.tsx'
import { copy } from './content.ts'

export type User = ReturnType<typeof userEvent.setup>

/** Clicks a button by its accessible name, which getByRole matches exactly. */
export function press(user: User, name: string) {
  return user.click(screen.getByRole('button', { name }))
}

export function renderApp() {
  return render(<App />)
}

// ------------------------------------------------------------ canned path

export async function toConditions(user: User) {
  await press(user, copy.landing.primaryButton)
}

export async function toRevealed(user: User) {
  await toConditions(user)
  await press(user, copy.conditions.initialButton)
}

export async function toComparables(user: User) {
  await toRevealed(user)
  await press(user, copy.conditions.nextButton)
}

export async function toReceipt(user: User) {
  await toComparables(user)
  await press(user, copy.comparables.button)
}

// ------------------------------------------------------------ custom path

export async function toCustomize(user: User) {
  await press(user, copy.landing.secondaryButton)
}

/** C2 is held deliberately, so landing on C3 is a wait, not a click. */
export async function settleOnConfirm() {
  await screen.findByRole(
    'heading',
    { name: copy.confirm.headline },
    { timeout: 5000 },
  )
}

// ----------------------------------------------------------------- assorted

/** Names of every control in the step rail, in order. */
export function stepButtonNames(rail: HTMLElement): string[] {
  return Array.from(rail.querySelectorAll('button')).map(
    (button) => button.textContent?.trim() ?? '',
  )
}

/**
 * Present anywhere in the document as that exact string, whatever markup
 * wraps it. queryAll rather than getAll, so a miss fails with the string that
 * is missing instead of a wall of DOM.
 */
export function expectExactText(value: string) {
  const matches = screen.queryAllByText(
    (_content, element) => element?.textContent?.trim() === value,
  )
  expect(matches.length, `expected the exact string: ${value}`).toBeGreaterThan(0)
}
