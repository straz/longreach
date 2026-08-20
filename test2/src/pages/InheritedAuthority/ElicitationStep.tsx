import { Actions, Button, Eyebrow, Field, Question, StepShell } from '../../components/ui/ui'

export function ElicitationStep({
  eyebrow,
  question,
  label,
  suffix,
  value,
  onChange,
  onContinue,
  type = 'text',
}: {
  eyebrow: string
  question: string
  label: string
  suffix?: string
  value: string
  onChange: (v: string) => void
  onContinue: () => void
  type?: string
}) {
  return (
    <StepShell>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Question>{question}</Question>
      <Field
        label={label}
        suffix={suffix}
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Actions>
        <Button disabled={!value.trim()} onClick={onContinue}>
          Continue
        </Button>
      </Actions>
    </StepShell>
  )
}
