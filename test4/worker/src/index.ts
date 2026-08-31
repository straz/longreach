// Longreach Test4 — commitment parser proxy.
//
// Accepts POST /parse with { text } or { audio: { data: <base64>, mime } } and
// returns the described "existing financial commitment" as structured JSON.
// The OpenRouter API key stays server-side as a Worker secret and is never
// exposed to the browser.

export interface Env {
  OPENROUTER_API_KEY: string
  ALLOWED_ORIGINS?: string
  MODEL?: string
}

const DEFAULT_ALLOWED = [
  'https://www.longreach.ai',
  'https://longreach.ai',
  'http://localhost:5173',
  'http://localhost:4173',
]

// Fast, does verbatim audio transcription, format-tolerant. ~$0.0001-0.0004
// per call. The OpenRouter free models available in Aug 2026 are not usable
// here: nemotron-omni:free hallucinates on audio (echoes the prompt instead
// of transcribing) and returns 502 ResourceExhausted under load; the better
// free multimodal models are gated to "agentic harnesses". Cheaper swap:
// 'google/gemini-2.5-flash-lite'.
const DEFAULT_MODEL = 'google/gemini-2.5-flash'

const SYSTEM_PROMPT = `You convert an executive's spoken or written description of ONE existing financial commitment into structured JSON.
Base every field only on THIS input. Extract only what is stated or clearly implied. Use an empty string for anything not stated. Do not invent a project name, amount, outcome, or date, and do not carry over values from any example.
- name: short name of the commitment or project as given. If unnamed, a brief noun phrase describing it.
- authorized: the total authorized amount as a whole number of US dollars, digits only, no symbols or commas. Example mapping only: "seven and a half million dollars" -> "7500000".
- expectedOutcome: the main expected result or business case, in a few words.
- completion: the expected completion or deployment date, in the words used (e.g. "end of next year", "March 2026").
- transcript: for audio input, your verbatim transcription of what was said; for text input, an empty string.
Respond with only the JSON object.`

const JSON_SCHEMA = {
  name: 'commitment',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      name: { type: 'string' },
      authorized: { type: 'string' },
      expectedOutcome: { type: 'string' },
      completion: { type: 'string' },
      transcript: { type: 'string' },
    },
    required: ['name', 'authorized', 'expectedOutcome', 'completion', 'transcript'],
  },
}

type Payload = { text?: string; audio?: { data: string; mime: string } }

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const allowed =
      env.ALLOWED_ORIGINS?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? DEFAULT_ALLOWED
    const origin = req.headers.get('Origin')
    const cors = corsHeaders(origin, allowed)

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(req.url)
    if (req.method !== 'POST' || (url.pathname !== '/parse' && url.pathname !== '/')) {
      return json({ error: 'Not found' }, 404, cors)
    }
    if (origin && !allowed.includes(origin)) {
      return json({ error: 'Origin not allowed' }, 403, cors)
    }

    let payload: Payload
    try {
      payload = (await req.json()) as Payload
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, cors)
    }

    const userContent = buildUserContent(payload)
    if (!userContent) {
      return json({ error: 'Provide `text` or `audio`.' }, 400, cors)
    }

    let orRes: Response
    try {
      orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'content-type': 'application/json',
          'HTTP-Referer': 'https://www.longreach.ai/test4/',
          'X-Title': 'Longreach Test4',
        },
        body: JSON.stringify({
          model: env.MODEL || DEFAULT_MODEL,
          temperature: 0,
          // The default free model is a reasoning model; left on, it is slow
          // (~10s) and sometimes spends its whole budget thinking and returns
          // empty content. Disabling it is ~5x faster and reliable. Ignored by
          // models that have no reasoning mode.
          reasoning: { enabled: false },
          response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent },
          ],
        }),
      })
    } catch {
      return json({ error: 'Upstream request failed' }, 502, cors)
    }

    if (!orRes.ok) {
      const detail = await orRes.text()
      return json({ error: 'Model call failed', status: orRes.status, detail: detail.slice(0, 500) }, 502, cors)
    }

    const data = (await orRes.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content ?? ''
    const parsed = extractJson(content)
    if (!parsed) {
      return json({ error: 'Could not parse model output', raw: content.slice(0, 500) }, 502, cors)
    }

    return json(
      {
        transcript: asString(parsed.transcript),
        name: asString(parsed.name),
        authorized: asDigits(parsed.authorized),
        expectedOutcome: asString(parsed.expectedOutcome),
        completion: asString(parsed.completion),
      },
      200,
      cors,
    )
  },
}

function buildUserContent(payload: Payload): unknown {
  if (payload.text && payload.text.trim()) {
    return payload.text.trim()
  }
  if (payload.audio?.data) {
    const format = (payload.audio.mime.split(';')[0].split('/')[1] || 'webm').toLowerCase()
    return [
      { type: 'text', text: 'Transcribe this audio, then extract the commitment.' },
      { type: 'input_audio', input_audio: { data: payload.audio.data, format } },
    ]
  }
  return null
}

function extractJson(s: string): Record<string, unknown> | null {
  const cleaned = s.replace(/```(?:json)?/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return null
  }
}

function asString(v: unknown): string {
  if (typeof v === 'string') return v.trim()
  return v == null ? '' : String(v)
}

function asDigits(v: unknown): string {
  return asString(v).replace(/[^0-9]/g, '')
}

function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> {
  const ok = origin != null && allowed.includes(origin)
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0] ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  })
}
