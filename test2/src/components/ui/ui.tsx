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

export function Field({
  label,
  suffix,
  ...inputProps
}: {
  label: string
  suffix?: string
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
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
      <SourceLabel />
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
}: {
  label: string
  value: string
  onChange: (digits: string) => void
  placeholder?: string
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
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
