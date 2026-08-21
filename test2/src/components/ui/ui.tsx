import type { InputHTMLAttributes, ReactNode } from 'react'
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
