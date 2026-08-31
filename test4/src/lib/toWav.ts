// MediaRecorder produces webm/opus (Chrome) or mp4/aac (Safari). The parser's
// default model only accepts `wav`, so decode the recording with the Web Audio
// API and re-encode it as 16 kHz mono 16-bit PCM WAV before upload. Each
// browser decodes its own MediaRecorder output, so this stays consistent.

type AudioCtor = typeof AudioContext

export async function blobToWav(blob: Blob, targetRate = 16000): Promise<Blob> {
  const arrayBuf = await blob.arrayBuffer()
  const Ctor: AudioCtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext
  const ctx = new Ctor()
  let decoded: AudioBuffer
  try {
    decoded = await ctx.decodeAudioData(arrayBuf)
  } finally {
    void ctx.close()
  }

  const frames = Math.max(1, Math.ceil(decoded.duration * targetRate))
  const offline = new OfflineAudioContext(1, frames, targetRate)
  const src = offline.createBufferSource()
  src.buffer = decoded
  src.connect(offline.destination)
  src.start()
  const rendered = await offline.startRendering()

  return encodeWav(rendered.getChannelData(0), targetRate)
}

function encodeWav(samples: Float32Array, rate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeStr(36, 'data')
  view.setUint32(40, samples.length * 2, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}
