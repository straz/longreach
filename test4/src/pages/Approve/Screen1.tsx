import { useState } from 'react'
import styles from '../../components/ui/Step.module.css'
import {
  Actions,
  BusyNote,
  Button,
  ErrorText,
  InputAdornment,
  MicIcon,
  PencilIcon,
  PresenterLine,
  RecordButton,
  StepShell,
  TextArea,
  Title,
  Waveform,
} from '../../components/ui/ui'
import { useRecorder } from '../../lib/useRecorder'
import { parseCommitment, type ParsedCommitment } from './parse'
import type { ApproveState } from './state'

const EXAMPLE =
  'We approved $18 million for Project Atlas last November based on 20% growth, and expect to finish deployment next June.'

export function Screen1({
  state,
  setState,
}: {
  state: ApproveState
  setState: (s: ApproveState) => void
}) {
  const [busy, setBusy] = useState<null | 'listening' | 'reading'>(null)
  const [error, setError] = useState('')

  function applyParse(parsed: ParsedCommitment, utterance: string) {
    setState({
      ...state,
      utterance: utterance || state.utterance,
      name: parsed.name,
      authorized: parsed.authorized,
      expectedOutcome: parsed.expectedOutcome,
      completion: parsed.completion,
      verdict: null,
      screen: 2,
    })
  }

  const recorder = useRecorder(async (clip) => {
    setError('')
    setBusy('listening')
    try {
      const parsed = await parseCommitment({ audio: clip })
      applyParse(parsed, parsed.transcript)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setBusy(null)
    }
  })

  const recording = recorder.status === 'recording'
  const working = busy !== null || recording

  async function submitText() {
    if (working || state.utterance.trim() === '') return
    setError('')
    setBusy('reading')
    try {
      const parsed = await parseCommitment({ text: state.utterance })
      applyParse(parsed, state.utterance)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setBusy(null)
    }
  }

  const typedReady = state.utterance.trim() !== '' && !working

  return (
    <StepShell>
      <Title>Tell us about one financial commitment your organization has already made.</Title>
      <PresenterLine>Speak or type. Thirty seconds is plenty.</PresenterLine>

      <TextArea
        leadingIcon={<PencilIcon />}
        value={state.utterance}
        onChange={(e) => setState({ ...state, utterance: e.target.value })}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            void submitText()
          }
        }}
      placeholder={`{for example} \n${EXAMPLE}`}
        disabled={working}
      />

      {recorder.status !== 'unsupported' && (
        <>
          <div className={styles.micRow}>
            <InputAdornment>
              <MicIcon />
            </InputAdornment>
            <RecordButton
              status={recording ? 'recording' : 'idle'}
              onClick={() => (recording ? recorder.stop() : recorder.start())}
            />
            {recording && <Waveform analyser={recorder.analyser} />}
          </div>
          {recording && (
            <BusyNote>Listening — pause when you're done and it reads it back on its own.</BusyNote>
          )}
        </>
      )}

      {busy !== null && <BusyNote>Reading that back…</BusyNote>}

      {typedReady && (
        <Actions>
          <Button variant="secondary" onClick={submitText}>
            Continue →
          </Button>
        </Actions>
      )}

      {error && (
        <>
          <ErrorText>{error}</ErrorText>
          <Button
            variant="secondary"
            onClick={() => setState({ ...state, verdict: null, screen: 2 })}
          >
            Enter it by hand →
          </Button>
        </>
      )}
    </StepShell>
  )
}
