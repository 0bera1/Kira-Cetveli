import styles from './RulerGauge.module.css'

const MAX = 60

/** Horizontal ruler with a triangle marker positioned at the given percentage. */
export function RulerGauge({ value }: { value: number | null }) {
  const clamped = value === null ? 0 : Math.max(0, Math.min(MAX, value))
  const left = `${(clamped / MAX) * 100}%`
  return (
    <div className={styles.gauge} aria-hidden="true">
      <div className={styles.marker} style={{ left, opacity: value === null ? 0 : 1 }} />
      <div className={styles.scale} />
      <div className={styles.labels}>
        {[0, 10, 20, 30, 40, 50, 60].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  )
}
