export type BeatTheCalendarState = {
  step: number
  commitment: string
  changeableCapital: string
  irreversibleAmount: string
  irreversibleDate: string
  reviewDate: string
  simulatedReviewDate: string
  simulatedIrreversibleDate: string
}

export const initialBeatTheCalendarState: BeatTheCalendarState = {
  step: 0,
  commitment: '',
  changeableCapital: '',
  irreversibleAmount: '',
  irreversibleDate: '',
  reviewDate: '',
  simulatedReviewDate: '',
  simulatedIrreversibleDate: '',
}

export const SESSION_KEY = 'aha2-beat-the-calendar'

export function num(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}
