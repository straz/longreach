import { daysBetween, isOnOrBefore } from '../../lib/dates'

export function governableCapital(authorized: number, committed: number): number {
  return authorized - committed
}

export function reconsiderationConditionMet(currentEstimate: number, reconsiderBelow: number): boolean {
  return currentEstimate < reconsiderBelow
}

export function governableAfterEvent(governable: number, becoming: number): number {
  return governable - becoming
}

// True when the authorized review occurs on or before the capital commitment date (Screen 3B).
export function reviewOnOrBeforeCommitment(reviewDate: string, commitmentDate: string): boolean {
  return isOnOrBefore(reviewDate, commitmentDate)
}

export function optionalityBurn(becoming: number, commitmentBeforeReview: boolean): number {
  return commitmentBeforeReview ? becoming : 0
}

export function timingDifferenceDays(commitmentDate: string, reviewDate: string): number {
  return Math.abs(daysBetween(commitmentDate, reviewDate))
}
