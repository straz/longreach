import { daysBetween, isOnOrBefore } from '../../lib/dates'

export function computeVerdict(
  changeableCapital: number,
  irreversibleAmount: number,
  irreversibleDate: string,
  reviewDate: string,
) {
  const burnBeforeReview = isOnOrBefore(irreversibleDate, reviewDate)
  const flexibilityAtReview = burnBeforeReview
    ? changeableCapital - irreversibleAmount
    : changeableCapital
  const optionalityBurn = changeableCapital - flexibilityAtReview
  const daysLate = daysBetween(irreversibleDate, reviewDate)

  return { burnBeforeReview, flexibilityAtReview, optionalityBurn, daysLate }
}
