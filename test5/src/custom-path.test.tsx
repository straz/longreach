// @vitest-environment jsdom

import { describe, expect, test } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { copy, routing } from './content.ts'
import {
  press,
  renderApp,
  settleOnConfirm,
  toCustomize,
  type User,
} from './test-helpers.tsx'

async function openCustomize(user: User) {
  renderApp()
  await toCustomize(user)
}

describe('C1 intake', () => {
  test('is reachable from the landing screen', async () => {
    await openCustomize(userEvent.setup())
    expect(screen.getByRole('heading', { name: copy.customize.headline })).toBeInTheDocument()
    expect(screen.getByText(copy.customize.privacy)).toBeInTheDocument()
  })

  test('requires a commitment type, and says so without blaming anyone', async () => {
    const user = userEvent.setup()
    await openCustomize(user)

    await press(user, copy.customize.primaryButton)
    expect(screen.queryByRole('heading', { name: copy.recognizing.headline })).not.toBeInTheDocument()
    expect(screen.getByText(copy.customize.commitmentTypeRequired)).toBeInTheDocument()
  })

  test('offers all six commitment types as the spec names them', async () => {
    await openCustomize(userEvent.setup())
    for (const label of Object.values(copy.commitmentTypeLabels)) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  test('the selected pill is not marked by colour alone', async () => {
    const user = userEvent.setup()
    await openCustomize(user)

    const pill = screen.getByRole('button', {
      name: copy.commitmentTypeLabels.acquisition_integration,
    })
    expect(pill).toHaveAttribute('aria-pressed', 'false')
    await user.click(pill)
    expect(pill).toHaveAttribute('aria-pressed', 'true')
  })

  test('an over-long note shows the exact spec message and blocks submission', async () => {
    const user = userEvent.setup()
    await openCustomize(user)
    await user.click(screen.getByRole('button', { name: copy.commitmentTypeLabels.market_expansion }))

    // Typing 128k characters would take minutes; paste is what a visitor does.
    const textarea = screen.getByPlaceholderText(copy.customize.advancedPlaceholder)
    await user.click(textarea)
    await user.paste('x'.repeat(routing.limits.sourceTextMaxChars + 1))

    expect(screen.getByText(copy.customize.sourceTextTooLong)).toBeInTheDocument()
    await press(user, copy.customize.primaryButton)
    expect(screen.queryByRole('heading', { name: copy.recognizing.headline })).not.toBeInTheDocument()
  })

  test('a note at the limit is accepted', async () => {
    const user = userEvent.setup()
    await openCustomize(user)
    await user.click(screen.getByRole('button', { name: copy.commitmentTypeLabels.market_expansion }))

    const textarea = screen.getByPlaceholderText(copy.customize.advancedPlaceholder)
    await user.click(textarea)
    await user.paste('x'.repeat(routing.limits.sourceTextMaxChars))

    expect(screen.queryByText(copy.customize.sourceTextTooLong)).not.toBeInTheDocument()
  })
})

describe('selection-only submission', () => {
  // Acceptance criterion 5: custom mode works with only a menu selection.
  test('reaches C3 with no text at all', async () => {
    const user = userEvent.setup()
    await openCustomize(user)
    await user.click(
      screen.getByRole('button', { name: copy.commitmentTypeLabels.capital_expansion }),
    )
    await press(user, copy.customize.primaryButton)

    expect(screen.getByRole('heading', { name: copy.recognizing.headline })).toBeInTheDocument()
    await settleOnConfirm()

    expect(
      screen.getByText(copy.commitmentTypeLabels.capital_expansion),
    ).toBeInTheDocument()
  })

  test('then runs the same three screens as the canned path', async () => {
    const user = userEvent.setup()
    await openCustomize(user)
    await user.click(
      screen.getByRole('button', { name: copy.commitmentTypeLabels.acquisition_integration }),
    )
    await press(user, copy.customize.primaryButton)
    await settleOnConfirm()
    await press(user, copy.confirm.primaryButton)

    // The integration template, in the identical S1 structure.
    expect(screen.getByText('Fund a $45M post-acquisition integration plan')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: copy.conditions.headline })).toBeInTheDocument()

    await press(user, copy.conditions.initialButton)
    await press(user, copy.conditions.nextButton)
    await press(user, copy.comparables.button)
    expect(screen.getByText('$18.2M')).toBeInTheDocument()
  })
})

describe('text routing', () => {
  test('a technology note routes to the technology template', async () => {
    const user = userEvent.setup()
    await openCustomize(user)
    await user.click(
      screen.getByRole('button', { name: copy.commitmentTypeLabels.market_expansion }),
    )
    await user.type(
      screen.getByPlaceholderText(copy.customize.briefContextPlaceholder),
      'Our $20M ERP migration and platform automation programme is over budget in March',
    )
    await press(user, copy.customize.primaryButton)
    await settleOnConfirm()

    // A clear reading overrode the market-expansion selection.
    expect(
      screen.getByText(copy.commitmentTypeLabels.technology_transformation),
    ).toBeInTheDocument()
    expect(screen.getByText(routing.contextSummaries.cost)).toBeInTheDocument()
  })

  test('C3 shows a pre-authored summary, never the visitor’s own words', async () => {
    const user = userEvent.setup()
    await openCustomize(user)
    await user.click(
      screen.getByRole('button', { name: copy.commitmentTypeLabels.technology_transformation }),
    )
    await user.type(
      screen.getByPlaceholderText(copy.customize.briefContextPlaceholder),
      'Project Orion at Acme Holdings is over budget',
    )
    await press(user, copy.customize.primaryButton)
    await settleOnConfirm()

    expect(document.body.textContent).not.toMatch(/Orion/)
    expect(document.body.textContent).not.toMatch(/Acme/)
  })
})

describe('the fallback path', () => {
  // Acceptance criterion 7: a recognizer timeout or error falls back silently.
  async function runWithJevParam(user: User, value: string) {
    window.history.replaceState({}, '', `/?jev=${value}`)
    try {
      renderApp()
      await press(user, copy.landing.secondaryButton)
      await user.click(
        screen.getByRole('button', { name: copy.commitmentTypeLabels.investment_allocation }),
      )
      await user.type(
        screen.getByPlaceholderText(copy.customize.briefContextPlaceholder),
        'Our ERP migration is over budget',
      )
      await press(user, copy.customize.primaryButton)
      await settleOnConfirm()
    } finally {
      window.history.replaceState({}, '', '/')
    }
  }

  test('a recognizer error still lands on C3, with the menu selection', async () => {
    await runWithJevParam(userEvent.setup(), 'fail')

    // Fell back to what was chosen, not to what the text said.
    expect(
      screen.getByText(copy.commitmentTypeLabels.investment_allocation),
    ).toBeInTheDocument()
  })

  // Real timers on purpose. Faking them here left the following tests wedged,
  // and the thing worth proving is that the 2s budget actually fires: the slow
  // mock would take 10s, so reaching C3 at all is the assertion.
  test(
    'a slow recognizer times out rather than hanging',
    async () => {
      const user = userEvent.setup()
      await runWithJevParam(user, 'slow')
      expect(
        screen.getByText(copy.commitmentTypeLabels.investment_allocation),
      ).toBeInTheDocument()
    },
    10_000,
  )

  test('shows nothing technical when it falls back', async () => {
    await runWithJevParam(userEvent.setup(), 'fail')

    const body = document.body.textContent ?? ''
    for (const leak of [/error/i, /failed/i, /timeout/i, /undefined/i, /\bNaN\b/]) {
      expect(body, `C3 leaked: ${leak}`).not.toMatch(leak)
    }
  })
})

describe('staying in control on C3', () => {
  async function toConfirm(user: User) {
    await openCustomize(user)
    await user.click(
      screen.getByRole('button', { name: copy.commitmentTypeLabels.capital_expansion }),
    )
    await press(user, copy.customize.primaryButton)
    await settleOnConfirm()
  }

  test('"Edit my inputs" returns to C1 with the selection intact', async () => {
    const user = userEvent.setup()
    await toConfirm(user)
    await press(user, copy.confirm.editLink)

    expect(screen.getByRole('heading', { name: copy.customize.headline })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: copy.commitmentTypeLabels.capital_expansion }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  test('"Use the standard example" runs the canned scenario instead', async () => {
    const user = userEvent.setup()
    await toConfirm(user)
    await press(user, copy.confirm.secondaryButton)

    expect(screen.getByText('Fund a $12M regional expansion program')).toBeInTheDocument()
  })

  test('the clarity score is never shown as a number', async () => {
    const user = userEvent.setup()
    await toConfirm(user)

    const band = within(screen.getByRole('main')).getByText(/illustrative example|broad example/i)
    expect(band.textContent).not.toMatch(/\b([1-9]|10)\s*\/\s*10\b/)
    expect(band.textContent).not.toMatch(/score/i)
  })
})
