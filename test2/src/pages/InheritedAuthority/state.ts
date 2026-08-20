export type InheritedAuthorityState = {
  step: number
  commitment: string
  capitalAuthorized: string
  capitalDeployed: string
  assumptionText: string
  currentEvidencePct: string
  reconsiderBelowPct: string
  authorityHolder: string
  simulatedEvidencePct: string
}

export const initialInheritedAuthorityState: InheritedAuthorityState = {
  step: 0,
  commitment: '',
  capitalAuthorized: '',
  capitalDeployed: '',
  assumptionText: '',
  currentEvidencePct: '',
  reconsiderBelowPct: '',
  authorityHolder: '',
  simulatedEvidencePct: '',
}

export const SESSION_KEY = 'aha1-inherited-authority'

export function num(s: string): number {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}
