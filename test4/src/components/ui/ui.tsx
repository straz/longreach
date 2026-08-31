import { useEffect, useRef } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import styles from './Step.module.css'

export function StepShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>{children}</div>
    </div>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className={styles.eyebrow}>{children}</div>
}

export function Title({ children }: { children: ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>
}

export function PresenterLine({ children }: { children: ReactNode }) {
  return <p className={styles.presenterLine}>{children}</p>
}

export function Question({ children }: { children: ReactNode }) {
  return <p className={styles.question}>{children}</p>
}

export function SourceLabel() {
  return <div className={styles.source}>SOURCE: PROVIDED BY EXECUTIVE</div>
}

export function SimulatedLabel({ children }: { children: ReactNode }) {
  return <div className={styles.simulated}>{children}</div>
}

export function HelpIcon({ text }: { text: string }) {
  return (
    <span className={styles.helpIcon} tabIndex={0}>
      i
      <span className={styles.helpTooltip} role="tooltip">
        {text}
      </span>
    </span>
  )
}

function FieldLabel({ label, help }: { label: string; help?: string }) {
  return (
    <label className={styles.fieldLabel}>
      {label}
      {help && <HelpIcon text={help} />}
    </label>
  )
}

export function Field({
  label,
  suffix,
  help,
  ...inputProps
}: {
  label: string
  suffix?: string
  help?: string
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={styles.fieldGroup}>
      <FieldLabel label={label} help={help} />
      {suffix ? (
        <div className={styles.suffixRow}>
          <input className={styles.fieldInput} {...inputProps} />
          <span className={styles.suffix}>{suffix}</span>
        </div>
      ) : (
        <input className={styles.fieldInput} {...inputProps} />
      )}
      <SourceLabel />
    </div>
  )
}

export function SimulatedField({
  label,
  suffix,
  help,
  ...inputProps
}: {
  label: string
  suffix?: string
  help?: string
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={styles.fieldGroup}>
      <FieldLabel label={label} help={help} />
      {suffix ? (
        <div className={styles.suffixRow}>
          <input className={styles.fieldInput} {...inputProps} />
          <span className={styles.suffix}>{suffix}</span>
        </div>
      ) : (
        <input className={styles.fieldInput} {...inputProps} />
      )}
      <SimulatedLabel>SIMULATED — NOT VERIFIED</SimulatedLabel>
    </div>
  )
}

export function digitsOnly(raw: string): string {
  return raw.replace(/[^0-9]/g, '')
}

export function formatUsdInput(digits: string): string {
  if (!digits) return ''
  const n = parseInt(digits, 10)
  if (!Number.isFinite(n)) return ''
  return `$${n.toLocaleString('en-US')}`
}

export function DollarField({
  label,
  value,
  onChange,
  placeholder,
  help,
}: {
  label: string
  value: string
  onChange: (digits: string) => void
  placeholder?: string
  help?: string
}) {
  return (
    <div className={styles.fieldGroup}>
      <FieldLabel label={label} help={help} />
      <input
        className={styles.fieldInput}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={formatUsdInput(value)}
        onChange={(e) => onChange(digitsOnly(e.target.value))}
      />
      <SourceLabel />
    </div>
  )
}

export function WandField({
  label,
  suffix,
  onReset,
  ...inputProps
}: {
  label: string
  suffix?: string
  onReset: () => void
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={styles.wandBlock}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{label}</label>
        {suffix ? (
          <div className={styles.suffixRow}>
            <input className={styles.fieldInput} {...inputProps} />
            <span className={styles.suffix}>{suffix}</span>
          </div>
        ) : (
          <input className={styles.fieldInput} {...inputProps} />
        )}
        <div className={styles.suffixRow}>
          <SimulatedLabel>SIMULATED — NOT VERIFIED</SimulatedLabel>
          <button type="button" className={styles.resetLink} onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export function FactCard({ children }: { children: ReactNode }) {
  return <dl className={styles.factCard}>{children}</dl>
}

export function FactRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.factRow}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function BigNumber({ children }: { children: ReactNode }) {
  return <p className={styles.bigNumber}>{children}</p>
}

export function Headline({ met, children }: { met: boolean; children: ReactNode }) {
  return (
    <p className={`${styles.headline} ${met ? styles.headlineMet : styles.headlineNotMet}`}>
      {children}
    </p>
  )
}

export function BodyText({ children }: { children: ReactNode }) {
  return <p className={styles.bodyText}>{children}</p>
}

export function MutedText({ children }: { children: ReactNode }) {
  return <p className={styles.mutedText}>{children}</p>
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>
}

export function Button({
  children,
  variant = 'primary',
  ...props
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={variant === 'primary' ? styles.button : `${styles.button} ${styles.buttonSecondary}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function formatDollars(n: number): string {
  if (!Number.isFinite(n)) return '$0'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`
  }
  return `${sign}$${abs.toLocaleString()}`
}

export function formatDollarsFull(n: number): string {
  if (!Number.isFinite(n)) return '$0'
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US')}`
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className={styles.errorText}>{children}</p>
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className={styles.sectionHeading}>{children}</h2>
}

export function Milestone({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.milestone}>
      <div className={styles.milestoneLabel}>{label}</div>
      <div className={styles.milestoneBody}>{children}</div>
    </div>
  )
}

export function ChoiceGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string | null
  onChange: (v: string) => void
}) {
  return (
    <div className={styles.choiceGroup}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={
            value === opt.value ? `${styles.choiceButton} ${styles.choiceButtonActive}` : styles.choiceButton
          }
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function TextArea({
  label,
  leadingIcon,
  ...props
}: { label?: string; leadingIcon?: ReactNode } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={styles.fieldGroup}>
      {label && <label className={styles.fieldLabel}>{label}</label>}
      <div className={styles.textAreaWrap}>
        {leadingIcon && <span className={styles.textAreaIcon}>{leadingIcon}</span>}
        <textarea
          className={leadingIcon ? `${styles.textArea} ${styles.textAreaInset}` : styles.textArea}
          {...props}
        />
      </div>
    </div>
  )
}

export function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10.6 2.9l2.5 2.5M3 13l.7-2.6 6.9-6.9a1.2 1.2 0 0 1 1.7 0l1 1a1.2 1.2 0 0 1 0 1.7l-6.9 6.9L3 13z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="5.75"
        y="1.75"
        width="4.5"
        height="8"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.25M5.75 14.25h4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function InputAdornment({ children }: { children: ReactNode }) {
  return <span className={styles.inputAdornment}>{children}</span>
}

export function Quote({ children }: { children: ReactNode }) {
  return <blockquote className={styles.quote}>{children}</blockquote>
}

export function StartOverLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.startOverLink} onClick={onClick}>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M10 3l-5 5 5 5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Start over
    </button>
  )
}

export function DateField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      <input type="date" className={styles.fieldInput} {...props} />
      <SourceLabel />
    </div>
  )
}

export function RecordButton({
  status,
  onClick,
}: {
  status: 'idle' | 'recording'
  onClick: () => void
}) {
  const recording = status === 'recording'
  return (
    <button
      type="button"
      className={
        recording ? `${styles.recordButton} ${styles.recordButtonActive}` : styles.recordButton
      }
      onClick={onClick}
      aria-label={recording ? 'Stop recording' : 'Start recording'}
    >
      <svg className={styles.recordIcon} width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
        {recording ? (
          <rect x="3" y="3" width="10" height="10" rx="1.5" fill="currentColor" />
        ) : (
          <circle cx="8" cy="8" r="6" fill="currentColor" />
        )}
      </svg>
      {recording ? 'Stop' : 'Record'}
    </button>
  )
}

const WAVE_BARS = 10

export function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!analyser || !container) return
    const bars = Array.from(container.children) as HTMLElement[]
    const buf = new Uint8Array(analyser.frequencyBinCount)
    const span = Math.max(1, Math.floor((analyser.frequencyBinCount * 0.6) / bars.length))
    let raf = 0

    const draw = () => {
      analyser.getByteFrequencyData(buf)
      for (let i = 0; i < bars.length; i++) {
        let sum = 0
        for (let j = 0; j < span; j++) sum += buf[i * span + j] ?? 0
        const level = sum / span / 255
        const scale = Math.max(0.08, Math.min(1, level * 1.7))
        bars[i].style.transform = `scaleY(${scale.toFixed(3)})`
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [analyser])

  return (
    <div className={styles.waveform} ref={ref} aria-hidden="true">
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <span key={i} className={styles.waveBar} />
      ))}
    </div>
  )
}

export function BusyNote({ children }: { children: ReactNode }) {
  return <p className={styles.busyNote}>{children}</p>
}

export function BigChoiceGroup({ options }: { options: { label: string; onClick: () => void }[] }) {
  return (
    <div className={styles.bigChoiceGroup}>
      {options.map((opt) => (
        <button key={opt.label} type="button" className={styles.bigChoice} onClick={opt.onClick}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}
