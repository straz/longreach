// @vitest-environment jsdom

import { describe, expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App.tsx'
import { copy, getPackScenarios, getScenario } from './content.ts'
import { FLOW_KEY } from './storage.ts'

const regional = getScenario('regional_expansion_v1')!

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

  test('restarting returns to the landing screen and resets the flow', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)
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


/** Names of every control in the step rail, in order. */
function stepButtonNames(rail: HTMLElement): string[] {
  return within(rail)
    .queryAllByRole('button')
    .map((button) => button.textContent?.trim() ?? '')
}

describe('the chevron step rail', () => {

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

describe('the commitment picker', () => {
  test('offers every scenario in the pack', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))

    const picker = screen.getByRole('combobox', { name: copy.conditions.commitmentPickerLabel })
    const offered = within(picker).getAllByRole('option').map((o) => o.textContent)
    expect(offered).toEqual(getPackScenarios().map((s) => s.title))
    expect(offered.length).toBeGreaterThanOrEqual(6)
  })

  test('shows the current commitment as the selection', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))

    expect(screen.getByRole('combobox', { name: copy.conditions.commitmentPickerLabel })).toHaveValue(
      'regional_expansion_v1',
    )
  })

  test('switching swaps the whole example, not just the heading', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))

    const picker = screen.getByRole('combobox', { name: copy.conditions.commitmentPickerLabel })
    await user.selectOptions(picker, 'capacity_expansion_v1')

    expect(screen.getByText('Fund a $60M capacity expansion program')).toBeInTheDocument()
    // The conditions belong to the new template too.
    expect(screen.getByText('Demand was expected to justify phase-two capacity.')).toBeInTheDocument()
    expect(
      screen.queryByText('Demand was expected to exceed current capacity.'),
    ).not.toBeInTheDocument()
  })

  test('the new example starts unrevealed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
    expect(screen.getByText(copy.conditions.revealHeadline)).toBeInTheDocument()

    await user.selectOptions(
      screen.getByRole('combobox', { name: copy.conditions.commitmentPickerLabel }),
      'integration_v1',
    )

    expect(screen.queryByText(copy.conditions.revealHeadline)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: copy.conditions.initialButton })).toBeInTheDocument()
    // And the rail no longer offers steps from the previous run.
    const rail = screen.getByRole('navigation', { name: /progress/i })
    expect(stepButtonNames(rail)).toEqual([copy.stepIndicatorStart])
  })

  test('the switched example carries through to the receipt', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: copy.conditions.commitmentPickerLabel }),
      'portfolio_allocation_v1',
    )
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.nextButton }))
    await user.click(screen.getByRole('button', { name: copy.comparables.button }))

    expect(screen.getByText('$15.0M')).toBeInTheDocument()
  })
})

describe('the scenario description', () => {
  test('sits under the picker, with no label of its own', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))

    const description = screen.getByText(regional.description)
    expect(description).toBeInTheDocument()

    // Immediately after the commitment bar, before the conditions section.
    const bar = document.querySelector('.lr-commitment')
    expect(bar?.nextElementSibling).toBe(description)
    expect(description.tagName).toBe('P')
  })

  test('changes with the chosen commitment', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: copy.conditions.commitmentPickerLabel }),
      'technology_program_v1',
    )

    expect(screen.getByText(getScenario('technology_program_v1')!.description)).toBeInTheDocument()
    expect(screen.queryByText(regional.description)).not.toBeInTheDocument()
  })

  test('every template has one', () => {
    for (const template of getPackScenarios()) {
      expect(template.description.trim().length, `${template.id} has no description`).toBeGreaterThan(20)
    }
  })
})

describe('the receipt owner', () => {
  test('names who is accountable, right after the commitment', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)

    const label = screen.getByText(copy.receipt.rowLabels.owner)
    expect(screen.getByText(regional.owner)).toBeInTheDocument()

    // Second row: subject, then who owns it.
    const rows = [...document.querySelectorAll('.lr-receipt__row')]
    expect(rows[1]?.contains(label)).toBe(true)
  })

  test('every template names an owner, and it is not the committee', () => {
    for (const template of getPackScenarios()) {
      expect(template.owner.trim().length, `${template.id} has no owner`).toBeGreaterThan(3)
      expect(template.authority.trim().length, `${template.id} has no authority`).toBeGreaterThan(3)
      expect(template.owner).not.toBe(template.authority)
    }
  })

  test('the authority sits on a second line under the owner', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)

    const ownerRow = [...document.querySelectorAll('.lr-receipt__row')].find((row) =>
      row.textContent?.includes(copy.receipt.rowLabels.owner),
    )
    expect(ownerRow?.textContent).toContain(regional.owner)
    expect(ownerRow?.textContent).toContain(`${copy.receipt.authorityLabel} ${regional.authority}`)

    // A distinct line, not run together with the owner.
    const secondary = ownerRow?.querySelector('.lr-receipt__secondary')
    expect(secondary?.textContent).toBe(`${copy.receipt.authorityLabel} ${regional.authority}`)
  })

  test('the authority follows the chosen commitment', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: copy.conditions.commitmentPickerLabel }),
      'portfolio_allocation_v1',
    )
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.nextButton }))
    await user.click(screen.getByRole('button', { name: copy.comparables.button }))

    expect(screen.getByText('CIO · Chief Investment Officer')).toBeInTheDocument()
    expect(screen.getByText('Authority: Investment Committee')).toBeInTheDocument()
  })

  test('the owner follows the chosen commitment', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: copy.conditions.commitmentPickerLabel }),
      'capacity_expansion_v1',
    )
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.nextButton }))
    await user.click(screen.getByRole('button', { name: copy.comparables.button }))

    expect(screen.getByText('CSCO · Chief Supply Chain Officer')).toBeInTheDocument()
  })
})

describe('the contact call to action', () => {
  const CONTACT = 'Contact us for more info and a free trial'

  test('points at the live try-us page, on every screen', async () => {
    const user = userEvent.setup()
    render(<App />)

    async function expectContactPresent(where: string) {
      const link = screen.getByRole('link', { name: copy.contact.linkLabel })
      expect(link, where).toHaveAttribute('href', copy.contact.url)
      expect(link.parentElement?.textContent?.replace(/\s+/g, ' ').trim(), where).toBe(CONTACT)
    }

    await expectContactPresent('landing')
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))
    await expectContactPresent('conditions')
    await user.click(screen.getByRole('button', { name: copy.conditions.initialButton }))
    await user.click(screen.getByRole('button', { name: copy.conditions.nextButton }))
    await expectContactPresent('comparables')
    await user.click(screen.getByRole('button', { name: copy.comparables.button }))
    await expectContactPresent('receipt')
  })

  test('reaches the customize path too', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.secondaryButton }))
    expect(screen.getByRole('link', { name: copy.contact.linkLabel })).toBeInTheDocument()
  })

  test('is an https link off-site, not a mailto', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: copy.landing.primaryButton }))

    const link = screen.getByRole('link', { name: copy.contact.linkLabel })
    expect(link.getAttribute('href')).toBe('https://www.longreach.ai/try-us/')
    expect(link.getAttribute('href')).not.toMatch(/^mailto:/)
  })

  test('appears once, not once per screen section', async () => {
    const user = userEvent.setup()
    render(<App />)
    await walkTheCannedPath(user)
    expect(screen.getAllByRole('link', { name: copy.contact.linkLabel })).toHaveLength(1)
  })
})
