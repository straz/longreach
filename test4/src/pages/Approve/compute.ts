import { num, type ApproveState } from './state'

export type Reveal = {
  authorized: number
  committed: number
  governable: number // clamped at 0
  fullyLockedIn: boolean // committed >= authorized
  daysToReview: number // today -> nextReview; negative once past
  reviewOverdue: boolean
  authority: string
}

const MS_PER_DAY = 86_400_000

function daysFromToday(iso: string, today: Date): number {
  const a = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const d = new Date(iso)
  const b = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  return Math.round((b - a) / MS_PER_DAY)
}

export function reveal(state: ApproveState, today: Date = new Date()): Reveal {
  const authorized = num(state.authorized)
  const committed = num(state.economicallyCommitted)
  const raw = authorized - committed
  const daysToReview = state.nextReview ? daysFromToday(state.nextReview, today) : 0
  return {
    authorized,
    committed,
    governable: Math.max(0, raw),
    fullyLockedIn: raw <= 0,
    daysToReview,
    reviewOverdue: Boolean(state.nextReview) && daysToReview < 0,
    authority: state.authority.trim(),
  }
}
