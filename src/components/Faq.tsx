import { useId, useState } from 'react'
import { Icon } from './Icon'
import styles from './Faq.module.css'

export interface FaqItem {
  q: string
  a: string
}

export function Faq({
  items,
  title = 'Sık sorulan sorular',
}: {
  items: FaqItem[]
  title?: string
}) {
  const base = useId()
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className={styles.faq} aria-label={title}>
      <h2>{title}</h2>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={it.q} className={styles.item}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${base}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{it.q}</span>
                <Icon name={isOpen ? 'minus' : 'plus'} size={18} />
              </button>
            </h3>
            <p id={`${base}-${i}`} hidden={!isOpen}>
              {it.a}
            </p>
          </div>
        )
      })}
    </section>
  )
}
