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
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  suffix?: string
  hint?: string
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
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
