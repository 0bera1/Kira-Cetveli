import { useId, useState } from 'react'
import type { RateOption } from '../lib/rent/cpi'
import { Icon } from './Icon'
import { RateTable } from './RateTable'
import styles from './RateDrawer.module.css'

/** Collapsible "last 12 months" table. Picking a month applies it and closes the drawer. */
export function RateDrawer({
  options,
  selected,
  onSelect,
}: {
  options: RateOption[]
  selected: string
  onSelect: (renewalMonth: string) => void
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  if (options.length === 0) return null
  return (
    <div className={styles.drawer}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Son 12 ayın oranları</span>
        <span className={styles.chevron} data-open={open}>
          <Icon name="chevron" size={18} />
        </span>
      </button>
      <div id={panelId} className={styles.panel} hidden={!open}>
        <RateTable
          options={options}
          selected={selected}
          onSelect={(month) => {
            onSelect(month)
            setOpen(false)
          }}
        />
      </div>
    </div>
  )
}
