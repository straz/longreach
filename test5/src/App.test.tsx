// @vitest-environment jsdom

import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App.tsx'
import { copy, getScenario } from './content.ts'
import { FLOW_KEY, PILOT_KEY, readPilotRequests } from './storage.ts'

const regional = getScenario('regional_expansion_v1')!

const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
beforeEach(() => {
  logSpy.mockClear()
})

/** S0 → S1 → reveal → S2 → S3: the four clicks the spec budgets 30 seconds for. */
async function walkTheCannedPath(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
  await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
  await user.click(screen.getByRole('button', { name: copy.conditions.nextButton }))
  await user.click(screen.getByRole('button', { name: copy.comparables.button }))
}

describe('the canned path', () => {
  test('reaches the receipt in four clicks with no input', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('heading', { name: copy.landing.headline })).toBeInTheDocument()
    await walkTheCannedPath(user)

    expect(screen.getByRole('heading', { name: copy.receipt.headline })).toBeInTheDocument()
    expect(screen.getByText(copy.receipt.receiptTitle)).toBeInTheDocument()
  })

  test('shows the spec figures on the receipt', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)

    expect(screen.getByText('$7.6M')).toBeInTheDocument()
    expect(screen.getByText('OPEN · 45 DAYS')).toBeInTheDocument()
    expect(screen.getByText(regional.flexibilityWindowText)).toBeInTheDocument()
    expect(screen.getByText(copy.receipt.suggestedDecisionValue)).toBeInTheDocument()
  })
})

describe('the evidence shift', () => {
  test('is not visible until asked for', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))

    expect(screen.queryByText(copy.conditions.revealHeadline)).not.toBeInTheDocument()
    expect(screen.queryByText(regional.evidenceShiftStatement)).not.toBeInTheDocument()
  })

  test('adds the shift without removing the conditions', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))

    expect(screen.getByText(copy.conditions.revealHeadline)).toBeInTheDocument()
    expect(screen.getByText(regional.evidenceShiftStatement)).toBeInTheDocument()
    // All three rows are still on screen: the shift is additive, not a filter.
    for (const condition of regional.conditions) {
      expect(screen.getByText(condition.why)).toBeInTheDocument()
      expect(screen.getByText(condition.reconsiderationCondition)).toBeInTheDocument()
    }
  })

  test('the reveal is announced, not only shown', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))

    const live = container.querySelector('[aria-live="polite"]')
    expect(live).not.toBeNull()
    expect(within(live as HTMLElement).getByText(copy.conditions.revealHeadline)).toBeInTheDocument()
  })
})

describe('comparables', () => {
  test('are a real table, marked illustrative', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.nextButton }))

    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(
      regional.comparableCommitments.length + 1,
    )
    expect(screen.getByText(copy.comparables.illustrativeBadge)).toBeInTheDocument()
    expect(
      screen.getByText(
        'In 2 of 3 comparable commitments, the relevant operating condition changed before the next scheduled review.',
      ),
    ).toBeInTheDocument()
  })
})

describe('the receipt disclosure', () => {
  test('starts collapsed so the screen stays inside the time budget', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)

    const toggle = screen.getByRole('button', { name: new RegExp(copy.receipt.disclosureLabel) })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(copy.receipt.disclosureBody)).toBeVisible()
  })
})

describe('the pilot modal', () => {
  async function openModal(user: ReturnType<typeof userEvent.setup>) {
    render(<App />)
    await walkTheCannedPath(user)
    await user.click(screen.getByRole('button', { name: copy.receipt.primaryButton }))
    return screen.getByRole('dialog')
  }

  test('opens over the receipt rather than navigating away', async () => {
    const user = userEvent.setup()
    const dialog = await openModal(user)

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText(copy.pilotModal.headline)).toBeInTheDocument()
    // The receipt is still behind it.
    expect(screen.getByText(copy.receipt.receiptTitle)).toBeInTheDocument()
  })

  test('closes with Escape', async () => {
    const user = userEvent.setup()
    await openModal(user)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('captures the request without claiming an email was sent', async () => {
    const user = userEvent.setup()
    const dialog = await openModal(user)

    await user.type(within(dialog).getByLabelText(copy.pilotModal.fieldLabels.name), 'A Buyer')
    await user.type(
      within(dialog).getByLabelText(copy.pilotModal.fieldLabels.workEmail),
      'buyer@example.com',
    )
    await user.type(
      within(dialog).getByLabelText(copy.pilotModal.fieldLabels.organization),
      'Example Group',
    )
    await user.click(within(dialog).getByRole('button', { name: copy.pilotModal.submitButton }))

    expect(screen.getByText(copy.pilotModal.successMessage)).toBeInTheDocument()
    expect(screen.getByText(copy.pilotModal.successMessage).textContent).not.toMatch(/sent/i)

    const stored = readPilotRequests()
    expect(stored).toHaveLength(1)
    expect(stored[0]!.workEmail).toBe('buyer@example.com')

    // The event fires, and carries none of what was typed.
    const logged = logSpy.mock.calls.filter((call) => call[1] === 'pilot_request_submitted')
    expect(logged).toHaveLength(1)
    expect(JSON.stringify(logged[0])).not.toMatch(/buyer@example\.com|A Buyer|Example Group/)
  })
})

describe('resuming and restarting', () => {
  test('a refresh mid-flow resumes on the same screen', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.nextButton }))
    expect(screen.getByRole('heading', { name: copy.comparables.headline })).toBeInTheDocument()

    // Unmounting and remounting is what a page refresh does to this app.
    first.unmount()
    render(<App />)

    expect(screen.getByRole('heading', { name: copy.comparables.headline })).toBeInTheDocument()
  })

  test('restarting clears the flow but keeps captured pilot requests', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)
    await user.click(screen.getByRole('button', { name: copy.receipt.primaryButton }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(copy.pilotModal.fieldLabels.name), 'A Buyer')
    await user.type(
      within(dialog).getByLabelText(copy.pilotModal.fieldLabels.workEmail),
      'buyer@example.com',
    )
    await user.type(
      within(dialog).getByLabelText(copy.pilotModal.fieldLabels.organization),
      'Example Group',
    )
    await user.click(within(dialog).getByRole('button', { name: copy.pilotModal.submitButton }))
    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('button', { name: copy.receipt.secondaryButton }))

    expect(screen.getByRole('heading', { name: copy.landing.headline })).toBeInTheDocument()

    // The stored flow no longer describes a mid-flow position, so a refresh
    // after restarting lands on S0 rather than back on the receipt.
    const storedFlow = JSON.parse(window.sessionStorage.getItem(FLOW_KEY) ?? '{}') as {
      screen?: string
      evidenceRevealed?: boolean
    }
    expect(storedFlow.screen).toBe('landing')
    expect(storedFlow.evidenceRevealed).toBe(false)

    // The captured lead survives the restart.
    expect(window.localStorage.getItem(PILOT_KEY)).not.toBeNull()
    expect(readPilotRequests()).toHaveLength(1)
  })

  test('renders correctly when storage is unavailable', async () => {
    const user = userEvent.setup()
    const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage')
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() {
        throw new Error('site data blocked')
      },
    })

    try {
      render(<App />)
      await walkTheCannedPath(user)
      expect(screen.getByText(copy.receipt.receiptTitle)).toBeInTheDocument()
    } finally {
      if (original !== undefined) Object.defineProperty(window, 'sessionStorage', original)
    }
  })
})

describe('modal scroll lock', () => {
  test('the page behind the dialog stops scrolling, and resumes on close', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)

    expect(document.body.style.overflow).not.toBe('hidden')
    await user.click(screen.getByRole('button', { name: copy.receipt.primaryButton }))
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})

describe('the chevron step rail', () => {
  /** Names of every control in the rail, in order. */
  function stepButtonNames(rail: HTMLElement): string[] {
    return within(rail)
      .queryAllByRole('button')
      .map((button) => button.textContent?.trim() ?? '')
  }

  test('lets a visitor go back to a step they have seen', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)
    expect(screen.getByRole('heading', { name: copy.receipt.headline })).toBeInTheDocument()

    const rail = screen.getByRole('navigation', { name: /progress/i })
    await user.click(within(rail).getByRole('button', { name: 'Conditions' }))

    expect(screen.getByRole('heading', { name: copy.conditions.headline })).toBeInTheDocument()
    // Going back does not undo the reveal: it is where they had got to.
    expect(screen.getByText(copy.conditions.revealHeadline)).toBeInTheDocument()
  })

  test('a step returned to stays reachable in both directions', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)

    const rail = () => screen.getByRole('navigation', { name: /progress/i })
    await user.click(within(rail()).getByRole('button', { name: 'Conditions' }))
    expect(screen.getByRole('heading', { name: copy.conditions.headline })).toBeInTheDocument()

    // Forward again without clicking through: Receipt was already seen.
    await user.click(within(rail()).getByRole('button', { name: 'Receipt' }))
    expect(screen.getByText(copy.receipt.receiptTitle)).toBeInTheDocument()
  })

  test('restarting clears the history, so nothing ahead is reachable', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)
    await user.click(screen.getByRole('button', { name: copy.receipt.secondaryButton }))
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))

    const rail = screen.getByRole('navigation', { name: /progress/i })
    expect(stepButtonNames(rail)).toEqual([copy.stepIndicatorStart])
  })

  test('offers no control for steps not yet reached', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))

    const rail = screen.getByRole('navigation', { name: /progress/i })
    expect(stepButtonNames(rail)).toEqual([copy.stepIndicatorStart])
    expect(within(rail).getByText('Receipt')).toBeInTheDocument()
  })

  test('Start restarts the example and returns to the landing screen', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)

    const rail = screen.getByRole('navigation', { name: /progress/i })
    await user.click(within(rail).getByRole('button', { name: copy.stepIndicatorStart }))

    expect(screen.getByRole('heading', { name: copy.landing.headline })).toBeInTheDocument()
    // Restarted, not merely navigated: the rail is gone and the reveal is reset.
    expect(screen.queryByRole('navigation', { name: /progress/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    expect(screen.queryByText(copy.conditions.revealHeadline)).not.toBeInTheDocument()
  })

  test('marks the current step for assistive technology', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.nextButton }))

    const rail = screen.getByRole('navigation', { name: /progress/i })
    expect(within(rail).getByText('Comparables')).toHaveAttribute('aria-current', 'step')
  })

  test('is absent outside the three-step example', async () => {
    render(<App />)
    expect(screen.queryByRole('navigation', { name: /progress/i })).not.toBeInTheDocument()
  })
})
