import type { ReactNode } from 'react'
import styles from './Paper.module.css'

/** The "hesap pusulası" sheet that holds inputs and results. */
export function Paper({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.paper} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </section>
  )
}

export function Field({
  id,
  label,
  value,
  onChange,
  suffix,
  hint,
  inputMode = 'decimal',
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  suffix?: string
  hint?: string
  inputMode?: 'decimal' | 'numeric' | 'text'
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {suffix && <span>{suffix}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}

export function TextField({
  id,
  label,
  value,
  onChange,
  multiline,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  hint?: string
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          className={styles.plain}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={styles.plain}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}

export function DateField({
  id,
  label,
  value,
  onChange,
  type = 'date',
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'date' | 'month'
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className={styles.plain}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  hint?: string
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className={styles.plain}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}

/** Large result figure with optional detail rows, announced politely to screen readers. */
export function Result({
  label,
  value,
  rows,
  error,
}: {
  label: string
  value?: string
  rows?: { label: string; value: string }[]
  error?: string
}) {
  return (
    <div className={styles.result} aria-live="polite">
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          <p className={styles.resultLabel}>{label}</p>
          <p className={styles.big} data-testid="result">
            {value}
          </p>
          {rows && (
            <dl className={styles.rows}>
              {rows.map((r) => (
                <div key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </div>
  )
}
