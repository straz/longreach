import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'recording' | 'unsupported'

type AudioCtor = typeof AudioContext

function supported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'MediaRecorder' in window &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  )
}

// Speech RMS is well above room tone; once the person has spoken and then
// stays below it for SILENCE_MS, we assume they are done and stop on our own.
const SPEECH_RMS = 0.035
const SILENCE_MS = 5000
const MAX_MS = 45_000

// Push-to-talk recorder with a live analyser for the waveform and automatic
// stop on a trailing silence, so the caller never has to gate on a button.
export function useRecorder(onClip: (clip: Blob) => void) {
  const [status, setStatus] = useState<RecorderStatus>(supported() ? 'idle' : 'unsupported')
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const onClipRef = useRef(onClip)
  onClipRef.current = onClip

  const teardown = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void ctxRef.current?.close()
    ctxRef.current = null
    setAnalyser(null)
  }, [])

  const stop = useCallback(() => {
    recRef.current?.stop()
    recRef.current = null
  }, [])

  const start = useCallback(async () => {
    if (!supported()) {
      setStatus('unsupported')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const Ctor: AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext
      const ctx = new Ctor()
      ctxRef.current = ctx
      const an = ctx.createAnalyser()
      an.fftSize = 1024
      an.smoothingTimeConstant = 0.75
      ctx.createMediaStreamSource(stream).connect(an)
      setAnalyser(an)

      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const type = rec.mimeType || 'audio/webm'
        teardown()
        setStatus('idle')
        onClipRef.current(new Blob(chunksRef.current, { type }))
      }
      rec.start()
      recRef.current = rec
      setStatus('recording')

      const buf = new Uint8Array(an.fftSize)
      const startedAt = performance.now()
      let spoke = false
      let silenceAt: number | null = null
      const tick = () => {
        an.getByteTimeDomainData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / buf.length)
        const now = performance.now()

        if (rms > SPEECH_RMS) {
          spoke = true
          silenceAt = null
        } else if (spoke) {
          silenceAt ??= now
          if (now - silenceAt > SILENCE_MS) {
            stop()
            return
          }
        }
        if (now - startedAt > MAX_MS) {
          stop()
          return
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch {
      teardown()
      setStatus('unsupported')
    }
  }, [stop, teardown])

  useEffect(
    () => () => {
      recRef.current?.stop()
      teardown()
    },
    [teardown],
  )

  return { status, start, stop, analyser }
}
