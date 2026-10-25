import { createEvents, type EventAttributes } from 'ics'
import type { ContractEvent } from './contract'

/** Builds an .ics file body (all-day events). */
export function toIcs(events: ContractEvent[]): string | null {
  if (events.length === 0) return null
  const attrs: EventAttributes[] = events.map((e) => {
    const [y, m, d] = e.date.split('-').map(Number)
    return {
      title: e.title,
      description: e.description,
      start: [y, m, d],
      duration: { days: 1 },
      productId: 'kira-cetveli',
      uid: `${e.id}-${e.date}@kira-cetveli`,
    }
  })
  const { error, value } = createEvents(attrs)
  return error || !value ? null : value
}
