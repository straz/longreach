import { digitsOnly } from '../../components/ui/ui'
import { blobToWav } from '../../lib/toWav'

// The deployed Cloudflare Worker. Override at build time with VITE_PARSE_URL
// (see .env.example); the production default here lets the GitHub Pages build
// work with no extra config.
const PROD_PARSE_URL = 'https://longreach-test4.longreach.workers.dev/parse'

// `||`, not `??`: an unset GitHub Actions variable expands to an empty string,
// not undefined, and fetch('') would POST to the page itself (405 on Pages).
export const PARSE_URL: string = import.meta.env.VITE_PARSE_URL || PROD_PARSE_URL

export type ParsedCommitment = {
  transcript: string
  name: string
  authorized: string // digits only
  expectedOutcome: string
  completion: string
}

type ParseInput = { text: string } | { audio: Blob }

export async function parseCommitment(input: ParseInput): Promise<ParsedCommitment> {
  let body: string
  if ('text' in input) {
    body = JSON.stringify({ text: input.text })
  } else {
    const wav = await blobToWav(input.audio)
    const data = await blobToBase64(wav)
    body = JSON.stringify({ audio: { data, mime: 'audio/wav' } })
  }

  const res = await fetch(PARSE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  })
  if (!res.ok) {
    throw new Error(`The parser is unavailable (${res.status}). Try again, or enter it by hand.`)
  }

  const raw = (await res.json()) as Partial<ParsedCommitment>
  return {
    transcript: raw.transcript?.trim() ?? '',
    name: raw.name?.trim() ?? '',
    authorized: digitsOnly(raw.authorized ?? ''),
    expectedOutcome: raw.expectedOutcome?.trim() ?? '',
    completion: raw.completion?.trim() ?? '',
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the recording.'))
    reader.onload = () => {
      const result = String(reader.result)
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.readAsDataURL(blob)
  })
}
