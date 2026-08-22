export type CohortRecord = {
  name: string
  authorized: string
  criticalAssumption: string
  assumptionCategory: 'adoption-utilization' | 'other'
  reconsiderationCondition: string
  rejectedAlternative: string
  alternativePreserved: boolean
  firstEvidence: string
  // null means the commitment never triggered formal reconsideration ("No trigger").
  reconsiderationDays: number | null
  // Only meaningful when triggered and the alternative was not preserved.
  returnedToAlternative: boolean
  outcome: string
}

export const COHORT: CohortRecord[] = [
  {
    name: 'Customer Service Automation',
    authorized: '$24M',
    criticalAssumption: 'Customer adoption reaches 40%',
    assumptionCategory: 'adoption-utilization',
    reconsiderationCondition: 'Adoption below 25%',
    rejectedAlternative: 'Managed-service provider',
    alternativePreserved: false,
    firstEvidence: 'Adoption reached only 18%',
    reconsiderationDays: 47,
    returnedToAlternative: true,
    outcome: 'Scope reduced',
  },
  {
    name: 'Cloud Migration',
    authorized: '$38M',
    criticalAssumption: 'Migration savings exceed 20%',
    assumptionCategory: 'other',
    reconsiderationCondition: 'Savings below 12%',
    rejectedAlternative: 'Hybrid architecture',
    alternativePreserved: true,
    firstEvidence: 'Savings revised to 9%',
    reconsiderationDays: 34,
    returnedToAlternative: false,
    outcome: 'Hybrid alternative partially adopted',
  },
  {
    name: 'Internal AI Platform',
    authorized: '$17M',
    criticalAssumption: 'Internal utilization exceeds 50%',
    assumptionCategory: 'adoption-utilization',
    reconsiderationCondition: 'Utilization below 30%',
    rejectedAlternative: 'External AI platform',
    alternativePreserved: false,
    firstEvidence: 'Utilization reached 21%',
    reconsiderationDays: 61,
    returnedToAlternative: true,
    outcome: 'External platform later adopted',
  },
  {
    name: 'Data Platform Modernization',
    authorized: '$29M',
    criticalAssumption: 'Operating-cost reduction exceeds 15%',
    assumptionCategory: 'other',
    reconsiderationCondition: 'Below 10%',
    rejectedAlternative: 'Extend existing platform',
    alternativePreserved: true,
    firstEvidence: 'Cost reduction reached 13%',
    reconsiderationDays: null,
    returnedToAlternative: false,
    outcome: 'Continued',
  },
  {
    name: 'Enterprise SaaS Consolidation',
    authorized: '$21M',
    criticalAssumption: 'Seat utilization exceeds 75%',
    assumptionCategory: 'adoption-utilization',
    reconsiderationCondition: 'Below 60%',
    rejectedAlternative: 'Retain multiple vendors',
    alternativePreserved: false,
    firstEvidence: 'Utilization reached 52%',
    reconsiderationDays: 39,
    returnedToAlternative: false,
    outcome: 'Contract renegotiated',
  },
  {
    name: 'AI Developer Tooling',
    authorized: '$14M',
    criticalAssumption: 'Developer adoption exceeds 60%',
    assumptionCategory: 'adoption-utilization',
    reconsiderationCondition: 'Below 40%',
    rejectedAlternative: 'Smaller targeted deployment',
    alternativePreserved: true,
    firstEvidence: 'Adoption reached 44%',
    reconsiderationDays: null,
    returnedToAlternative: false,
    outcome: 'Continued',
  },
]

// The fixed alternative Screen 3A / Screen 4 offer to preserve for the demo's
// current commitment (drawn from the cohort's AI Developer Tooling record).
export const CANDIDATE_ALTERNATIVE = 'Smaller targeted deployment'

function triggered(record: CohortRecord): boolean {
  return record.reconsiderationDays !== null
}

export function recurringAssumptionFinding(): { count: number; total: number } {
  const count = COHORT.filter((r) => r.assumptionCategory === 'adoption-utilization').length
  return { count, total: COHORT.length }
}

export function reconsiderationLatencyFinding(): { averageDays: number; recordCount: number } {
  const days = COHORT.filter(triggered).map((r) => r.reconsiderationDays as number)
  const averageDays = Math.round(days.reduce((sum, d) => sum + d, 0) / days.length)
  return { averageDays, recordCount: days.length }
}

export function lostAlternativeFinding(): { returned: number; eligible: number } {
  const eligible = COHORT.filter((r) => triggered(r) && !r.alternativePreserved)
  const returned = eligible.filter((r) => r.returnedToAlternative)
  return { returned: returned.length, eligible: eligible.length }
}
