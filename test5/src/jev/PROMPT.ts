// The prompt intended for a real Jev integration, kept verbatim from
// docs/README.md §"Intended real Jev prompt" because the spec asks for it to
// live in a clearly documented constant.
//
// Unused in v1, which is mock-only. When the remote recognizer is built, note
// that Jev returns typed judgments rather than text: the first three outputs
// map onto two `choice` questions and one `score`, and the two summaries are
// derived in code from the matched template and content/routing.yml's
// contextSummaries rather than generated. See docs/PLAN.md §6.3.

export const JEV_RECOGNIZER_PROMPT = `You are a Longreach input recognizer.

Classify the submitted context. Do not evaluate whether the decision was good,
bad, correct, incorrect, prudent, or imprudent. Do not provide advice.

Return valid JSON only.

1. Choose one primary commitment category:
- market_expansion
- technology_transformation
- acquisition_integration
- capital_expansion
- investment_allocation
- strategic_other

2. Choose one evidence-shift category:
- economics
- demand
- cost
- schedule
- execution
- customer_retention
- regulatory
- unclear

3. Score decision-condition clarity from 1 to 10:
1 = almost no usable commitment or condition context
10 = a clearly described commitment and a concrete condition that could warrant refresh

4. Write:
- commitment_summary: <=20 words
- context_summary: <=20 words

Text:
{{USER_TEXT}}
`
