// @vitest-environment jsdom

// Acceptance criterion: every verbatim string in docs/README.md §S0-S3 appears
// exactly (docs/PLAN.md Phase 3).
//
// The strings below are transcribed from the spec by hand and compared against
// the rendered DOM. That is deliberate: asserting `copy.landing.headline` would
// only prove the app renders whatever copy.yml happens to contain, which is
// exactly the mistake this is meant to catch. Curly apostrophes, the middle
// dot, and the em dashes are all as the spec writes them.

import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App.tsx'

type User = ReturnType<typeof userEvent.setup>

const S0 = {
  eyebrow: 'LONGREACH DECISION REFRESH',
  headline: 'Keep important commitments current as conditions change.',
  body: 'Major commitments are made using the best evidence available at the time. Longreach records the conditions behind a commitment, notices meaningful evidence shifts, and brings forward lessons from similar decisions.',
  primary: 'See a 30-second example',
  secondary: 'Customize this example',
  microcopy: 'No sign-up. The standard example uses illustrative data.',
  footer:
    'Illustrative demonstration — not investment, legal, accounting, or operating advice.',
}

// DEVIATION FROM SPEC, at the user's request: the per-screen eyebrows
// ("ILLUSTRATIVE EXAMPLE - STEP N OF 3") are no longer rendered on S1-S3. The
// chevron rail carries the step.
//
// Acceptance criterion 4 (all canned values clearly labelled illustrative) is
// still met, but more quietly: every screen's footer says "Illustrative
// demonstration", S2 keeps its Illustrative pill, and S3's footer names the
// figures as sample data. What is gone is the above-the-fold label.
const S1 = {
  headline: 'Every major commitment is made in a moment. Conditions keep moving.',
  cardLabel: 'Active commitment',
  cardTitle: 'Active:',
  cardValue: 'Fund a $12M regional expansion program',
  // DEVIATION FROM SPEC, at the user's request. docs/README.md §S1 has a "Why
  // it was authorized" list above a separate conditions table. The two are now
  // one table, and the bullets below are its Why column. The spec's condition
  // labels ("Demand supports the planned expansion") are no longer rendered:
  // each said the same thing as its bullet in a different tense, which is what
  // made the screen long. They remain in the content and in the type.
  rationale: [
    'Demand was expected to exceed current capacity.',
    'Customer-acquisition economics were expected to remain within range.',
    'The launch was expected to reach operating break-even by month 12.',
  ],
  conditionsTitle: 'Decision conditions Longreach keeps current',
  watched: ['Booked demand trend', 'Customer-acquisition cost', 'Launch-plan milestone status'],
  reconsideration: [
    'Demand remains 20% below plan for two consecutive months',
    'CAC remains above the agreed range for six weeks',
    'Launch timing moves more than 45 days',
  ],
  statuses: ['Within expected range', 'New evidence available'],
  initialButton: 'Show the evidence shift',
  revealHeadline: 'New evidence has changed one decision condition.',
  revealStatement:
    'Customer-acquisition cost has remained above the agreed range for six weeks.',
  interpretation:
    'The commitment is not automatically invalid. One condition that shaped its original scope has moved. The relevant question is whether the current scope remains the best use of the capital still in play.',
  nextButton: 'See similar commitments',
}

const S2 = {
  headline: 'You have encountered this pattern before.',
  // EDITED COPY, not the spec's. docs/README.md §S2 opens this paragraph at
  // "Longreach compares..."; the first sentence was added by hand.
  body: 'This is organizational memory, with an economic purpose. Longreach compares active commitments with prior decisions that relied on similar conditions, faced similar evidence shifts, or approached the same type of lock-in.',
  sectionTitle: 'Comparable commitments',
  headers: ['Commitment', 'Relevant condition', 'What changed', 'What happened next'],
  rows: [
    ['Market expansion · 2023', 'Acquisition economics', 'CAC moved outside the intended range', 'A review occurred after incremental spend had already increased'],
    ['Service rollout · 2024', 'Demand ramp', 'Demand remained below the planned range', 'Scope was staged and remaining capital was redirected'],
    ['Regional buildout · 2025', 'Launch timing', 'Launch timing moved by 60 days', 'Review occurred after a major operational lock-in'],
  ],
  patternHeading: 'Comparable pattern',
  patternStatement:
    'In 2 of 3 comparable commitments, the relevant operating condition changed before the next scheduled review.',
  patternImplication:
    'The opportunity is not to hold more meetings. It is to refresh the commitment when the condition that matters has changed—while context is fresh and flexibility remains.',
  button: 'See the decision refresh',
}

const S3 = {
  headline: 'A decision refresh is timely.',
  receiptTitle: 'Decision Refresh Receipt',
  rows: [
    ['Active commitment', '$12M regional expansion program'],
    ['Evidence shift', 'Customer-acquisition cost has remained above the agreed range for six weeks'],
    ['Capital still in play', '$7.6M'],
    ['Flexibility window', '45 days before regional launch contracts and hiring commitments create a material lock-in'],
    ['Comparable learning', 'In comparable commitments, meaningful evidence shifts appeared before the next scheduled review'],
    ['Suggested decision', 'Bring the original commitment back to the accountable authority to reaffirm, stage, resize, redirect, or renew the current scope'],
  ],
  callout: [
    'Longreach does not second-guess the original decision.',
    'It keeps the decision current as evidence changes—and makes the outcome more useful when the next similar commitment appears.',
  ],
  possibleTitle: 'What becomes possible',
  possible: [
    'Notice meaningful change before the calendar says it is time to review.',
    'Revisit the original commitment without reconstructing its history.',
    'Use comparable decisions to improve the next allocation of capital.',
  ],
  // DEVIATION FROM SPEC, at the user's request: the receipt's
  // "Apply this to five live commitments" button, and the pilot modal it
  // opened, are replaced by a mailto link. The spec's supporting sentence
  // loses its "In a 30-day pilot," opening with it.
  contact: 'Contact us for more info and a free trial',
  supporting:
    'Longreach maps active commitments, their decision conditions, evidence shifts, flexibility windows, and comparable patterns.',
  secondary: 'Restart the example',
  footer: 'Illustrative demonstration — figures and prior commitments are sample data.',
  disclosureLabel: 'How is this estimated?',
  disclosureBody:
    'In this illustration, capital still in play includes planned spend that can still be delayed, resized, redirected, or renegotiated before the next material lock-in. It excludes spend already incurred and commitments that are no longer practical to change.',
}

/**
 * Present anywhere in the document, whatever markup it is wrapped in.
 * queryAllByText rather than getAllByText, so a miss fails with the string
 * that is missing instead of a wall of DOM.
 */
function expectExactText(value: string) {
  const matches = screen.queryAllByText(
    (_content, element) => element?.textContent?.trim() === value,
  )
  expect(matches.length, `expected the exact string: ${value}`).toBeGreaterThan(0)
}

async function toConditions(user: User) {
  render(<App />)
  await user.click(screen.getByRole('button', { name: S0.primary }))
}

async function toComparables(user: User) {
  await toConditions(user)
  await user.click(screen.getByRole('button', { name: S1.initialButton }))
  await user.click(screen.getByRole('button', { name: S1.nextButton }))
}

async function toReceipt(user: User) {
  await toComparables(user)
  await user.click(screen.getByRole('button', { name: S2.button }))
}

describe('S0 landing', () => {
  test('renders the spec copy exactly', () => {
    render(<App />)
    for (const value of [S0.eyebrow, S0.headline, S0.body, S0.microcopy, S0.footer]) {
      expectExactText(value)
    }
    expect(screen.getByRole('button', { name: S0.primary })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: S0.secondary })).toBeInTheDocument()
  })
})

describe('S1 decision conditions', () => {
  test('renders the spec copy exactly', async () => {
    await toConditions(userEvent.setup())
    for (const value of [
      S1.headline,
      S1.cardLabel,
      S1.cardValue,
      S1.conditionsTitle,
      ...S1.rationale,
      ...S1.watched,
      ...S1.reconsideration,
    ]) {
      expectExactText(value)
    }
    for (const status of S1.statuses) {
      expect(screen.getAllByText(new RegExp(status)).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('button', { name: S1.initialButton })).toBeInTheDocument()
  })

  test('renders the reveal copy exactly', async () => {
    const user = userEvent.setup()
    await toConditions(user)
    await user.click(screen.getByRole('button', { name: S1.initialButton }))

    for (const value of [S1.revealHeadline, S1.revealStatement, S1.interpretation]) {
      expectExactText(value)
    }
    expect(screen.getByRole('button', { name: S1.nextButton })).toBeInTheDocument()
  })
})

describe('S2 comparable decisions', () => {
  test('renders the spec copy exactly', async () => {
    await toComparables(userEvent.setup())
    for (const value of [
      S2.headline,
      S2.body,
      S2.sectionTitle,
      ...S2.headers,
      ...S2.rows.flat(),
      S2.patternHeading,
      S2.patternStatement,
      S2.patternImplication,
    ]) {
      expectExactText(value)
    }
    expect(screen.getByRole('button', { name: S2.button })).toBeInTheDocument()
  })
})

describe('S3 decision refresh receipt', () => {
  test('renders the spec copy exactly', async () => {
    await toReceipt(userEvent.setup())
    for (const value of [
      S3.headline,
      S3.receiptTitle,
      ...S3.rows.flat(),
      ...S3.callout,
      S3.possibleTitle,
      ...S3.possible,
      S3.supporting,
      S3.footer,
    ]) {
      expectExactText(value)
    }
    expect(screen.getByRole('button', { name: S3.secondary })).toBeInTheDocument()

    // The call to action is a mailto link, not a button.
    const contact = screen.getByRole('link', { name: 'Contact us' })
    expect(contact).toHaveAttribute('href', 'mailto:info@longreach.ai')
    expect(contact.parentElement?.textContent?.trim()).toBe(S3.contact)
  })

  test('renders the estimation disclosure copy exactly', async () => {
    const user = userEvent.setup()
    await toReceipt(user)
    await user.click(screen.getByRole('button', { name: new RegExp(S3.disclosureLabel) }))
    expectExactText(S3.disclosureBody)
  })
})

describe('the step indicator', () => {
  // DEVIATION FROM SPEC, at the user's request. docs/README.md §"App flow"
  // writes these as "1 Conditions", "2 Comparables", "3 Receipt". The rail is
  // now a chevron sequence whose shape carries the order, so the numbers are
  // dropped — an <ol> renders its own numbering, and "1. 1 CONDITIONS" is what
  // keeping them looked like.
  test('names the three steps, unnumbered', async () => {
    await toConditions(userEvent.setup())
    for (const label of ['Conditions', 'Comparables', 'Receipt']) {
      expectExactText(label)
    }
  })
})
