import { addDays, addYears, format, isValid, parseISO } from 'date-fns'
import { createEvents, type EventAttributes } from 'ics'

export interface ContractEvent {
  id: string
  title: string
  /** ISO date YYYY-MM-DD */
  date: string
  description: string
}

export interface ContractInput {
  /** Contract start date, ISO. */
  start: string
  /** Contract end date, ISO (optional). Anniversaries are generated before it. */
  end: string
  /** Days before each anniversary for the notice reminder. A convenience, not a legal deadline. */
  reminderDays: number
}

const iso = (d: Date) => format(d, 'yyyy-MM-dd')

function parse(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = parseISO(value)
  return isValid(d) ? d : null
}

export const MAX_YEARS = 10

/** Anniversaries, reminder dates and the end date for a contract. Returns null for invalid input. */
export function contractEvents(input: ContractInput): ContractEvent[] | null {
  const start = parse(input.start)
  if (!start) return null
  if (!Number.isInteger(input.reminderDays) || input.reminderDays < 0 || input.reminderDays > 365)
    return null
  let end: Date | null = null
  if (input.end) {
    end = parse(input.end)
    if (!end || end <= start) return null
  }
  const events: ContractEvent[] = []
  for (let n = 1; n <= MAX_YEARS; n++) {
    const anniversary = addYears(start, n)
    if (end && anniversary >= end) break
    if (!end && n > 3) break
    events.push({
      id: `reminder-${n}`,
      title: `Kira artış bildirimi hatırlatması (${n}. yıl)`,
      date: iso(addDays(anniversary, -input.reminderDays)),
      description: `Sözleşme yıldönümü ${iso(anniversary)}. Güncel TÜFE oranını kontrol edin ve yazılı bildirimi hazırlayın. Bu bir hatırlatmadır, hukuki süre değildir.`,
    })
    events.push({
      id: `anniversary-${n}`,
      title: `Kira sözleşmesi yıldönümü (${n}. yıl)`,
      date: iso(anniversary),
      description:
        'Yeni kira yılı başlıyor. Kira artışı için TÜFE 12 aylık ortalamayı kontrol edin.',
    })
  }
  if (end) {
    events.push({
      id: 'end',
      title: 'Kira sözleşmesi bitişi',
      date: iso(end),
      description:
        'Sözleşme sona eriyor. Yenileme veya tahliye için gerekli adımları kontrol edin.',
    })
  }
  return events.sort((a, b) => a.date.localeCompare(b.date))
}

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
