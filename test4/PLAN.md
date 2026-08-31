# Longreach Test4 — "Would You Still Approve This Today?" — implementation notes

Implements the spec in `2026-08-30 test4 spec.md` (governance gap / product
conversations / 2026-08) — Michael Schrage's "magic trick" framing. In under
three minutes the executive discovers that **their judgment has already
changed but their organization's commitment has not.** The reveal is
deterministic arithmetic on two facts the user supplies; the app never tells
the executive their decision was wrong.

Forked from `test3` (same stack, same shared UI kit). `pages/Cohort` was
replaced with `pages/Approve`; the clickable `Breadcrumb` was dropped (the
spec wants bare, standalone screens) — only the `Nav` logo bar and a small
"Start over" link remain.

## Stack

Same as `test2`/`test3`/`cards`: Vite + React + TypeScript, pnpm,
`HashRouter`, plain CSS modules, `oxlint`. State lives in React state
mirrored into `localStorage` (key `test4-state`); "Start over" wipes it.

The one addition is a **Cloudflare Worker** (`worker/`) — the only
non-static piece. It proxies OpenRouter so the API key never reaches the
browser.

## Frontend structure

```
src/pages/Approve/
  Approve.tsx        top-level screen switch (1 / 2 / 3 / 4 + YES dead-end)
  state.ts           ApproveState type, blank initial values
  parse.ts           Worker client — POST text or audio, returns ParsedCommitment
  compute.ts         reveal(): authorized − committed, days-to-review, overdue
  Screen1.tsx        the commitment — textarea + optional mic
  Screen2.tsx        the mirror — 4 editable fields + YES / NO / I'D NEED TO CHECK
  Screen2Matches.tsx YES branch — short dead-end, no Screen 3/4
  Screen3.tsx        the three facts — committed $, next review date, authority
  Screen4.tsx        the reveal — computed number + "WHAT CHANGED?" (dead end)
src/lib/useRecorder.ts   push-to-talk MediaRecorder hook (hidden if unsupported)
```

New shared bits added to `components/ui/ui.tsx`: `TextArea`, `DateField`,
`MicButton`, `BusyNote`, `BigChoiceGroup`. `lib/dates.ts` (test3-only) was
removed as an orphan.

## Flow

1. **Screen 1** — one large textarea, "Speak or type." A mic button
   (push-to-talk) records a clip; on stop it is sent to the Worker, which
   transcribes and structures it in one call. "Show me what you heard" sends
   the typed text instead. If the browser has no `MediaRecorder`, the mic is
   hidden and typing still works. On a parser error, an "Enter it by hand →"
   button jumps to a blank Screen 2.
2. **Screen 2** — the four parsed fields (`name`, `authorized`,
   `expectedOutcome`, `completion`) shown as **editable** inputs under
   "Here's what we heard." Then the one question and three large buttons.
   `YES` → Screen2Matches (dead-end). `NO` / `I'D NEED TO CHECK` → Screen 3.
3. **Screen 3** — three inputs: how much is already economically committed
   (`$`), next formal review (`date`), who can materially change it (text).
4. **Screen 4** — `reveal()` computes `authorized − economicallyCommitted`
   (clamped at 0) and `daysToReview` from today. Shows the headline, the
   three-row breakdown, "Next scheduled reconsideration: N days", the
   verbatim authority, then "Your mind changed before your governance did."
   One button, **WHAT CHANGED?**, reveals a single line ("That's where Test 5
   begins.") and stops — per the spec, the demo ends here.

### Edge cases (deliberately light)

- `economicallyCommitted >= authorized` → headline swaps to "Nothing remains
  economically governable — this decision is fully locked in."; breakdown
  still shown with `Still governable = $0`.
- Review date in the past → "Next scheduled reconsideration: overdue by N
  days".

## The Worker (`worker/`)

`POST /` or `/parse`, body `{ text }` **or**
`{ audio: { data: <base64>, mime } }`. One OpenRouter chat call with
`response_format: json_schema` and `reasoning: { enabled: false }`; returns
`{ transcript, name, authorized, expectedOutcome, completion }` with
`authorized` normalized to digit-only whole dollars. `transcript` is
meaningful only for the audio path.

Deployed at `https://longreach-test4.longreach.workers.dev` (accepts POST on
both `/` and `/parse`).

- **Model:** `google/gemini-2.5-flash` (`MODEL` var in `wrangler.jsonc`).
  ~$0.0001–0.0004 per call. It does verbatim audio transcription, tolerates
  most audio formats, and returns in ~1.5s. Cheaper swap:
  `google/gemini-2.5-flash-lite`.
- **Why not free tier:** the OpenRouter free models available in Aug 2026 do
  not work for this. `google/*-exp:free` returns 404 (withdrawn);
  `thinkingmachines/inkling*:free` is gated to "agentic harnesses";
  `nvidia/nemotron-3-nano-omni:free` is the only free model that accepts
  audio, but it **hallucinates on audio** — it echoes the prompt's examples
  instead of transcribing — and returns `502 ResourceExhausted` under load.
  A confidently wrong mirror is worse than an error, so this needs a paid
  model.
- **Audio also needs ≥ $0.50 OpenRouter balance** — the API refuses audio
  input below that ("requires at least $0.50 in balance for audio"). Text
  works at any balance.
- **Client-side WAV.** `MediaRecorder` emits webm/opus (Chrome) or mp4/aac
  (Safari); `src/lib/toWav.ts` decodes the clip via the Web Audio API and
  re-encodes it as 16 kHz mono PCM WAV before upload, so the format the
  Worker forwards is always `wav`.
- **Key:** `OPENROUTER_API_KEY`, a Worker secret. Never in the repo, never
  sent to the browser.
- **Abuse guard:** `Origin` allowlist (`ALLOWED_ORIGINS` var) + CORS
  preflight. The proxy URL is public, so also set a low spend cap on the
  OpenRouter key. Turnstile is a later add if needed.

### Deploy the Worker (one-time, needs a Cloudflare account)

```bash
cd test4/worker
pnpm install
pnpm dlx wrangler login
pnpm dlx wrangler secret put OPENROUTER_API_KEY   # paste the sk-or-... key
pnpm dlx wrangler deploy
```

Local dev: copy `.dev.vars.example` to `.dev.vars`, add the key, run
`pnpm dev` (serves on `http://localhost:8787`).

### Point the frontend at the Worker

- **Prod:** set the GitHub Actions repository **variable** `TEST4_PARSE_URL`
  to the deployed URL, e.g.
  `https://longreach-test4.<your-subdomain>.workers.dev/parse`. The Pages
  build passes it as `VITE_PARSE_URL`. If unset, `parse.ts` falls back to the
  `PROD_PARSE_URL` constant — edit that constant to match your subdomain.
- **Local:** copy `test4/.env.example` to `test4/.env`
  (`VITE_PARSE_URL=http://localhost:8787/parse`).

## Deploy (frontend)

Wired into `.github/workflows/deploy.yml` and the root `_config.yml`
`exclude:` list, same pattern as `test3` (plus `test4/worker` excluded from
Jekyll). Deploys to `https://www.longreach.ai/test4/` alongside the others,
which stay unaffected.

## Verification

`pnpm build`, `pnpm run lint`, and `tsc` pass for the frontend; the Worker
passes `tsc --noEmit`.

**Worker, live (`longreach-test4.longreach.workers.dev`):** verified against
`google/gemini-2.5-flash` with the secret and credits in place.
- Text path: correct structured JSON in ~0.7–1.2s for the Project Atlas
  sentence and verbose / terse / vague variants; missing facts return empty
  strings.
- Audio path (WAV clips generated with `say` + `afconvert`): verbatim
  transcript plus correct fields on two distinct commitments in ~1.5s —
  including one that has nothing in common with the prompt, confirming it
  transcribes rather than echoes.
- CORS preflight passes; non-allowlisted `Origin` → 403; empty / fieldless
  body → 400.

**Frontend end-to-end still to drive in a browser:** text path → mirror → NO
→ three facts → reveal number matches hand arithmetic; the mic path (records
→ `toWav` → Worker); the YES dead-end; both edge cases; "Start over".
