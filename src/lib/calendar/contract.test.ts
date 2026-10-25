import { describe, expect, it } from 'vitest'
import { contractEvents, toIcs } from './contract'

describe('contract events', () => {
  it('creates anniversaries, reminders and the end date', () => {
    const ev = contractEvents({ start: '2025-03-15', end: '2027-03-15', reminderDays: 30 })!
    expect(ev.map((e) => [e.id, e.date])).toEqual([
      ['reminder-1', '2026-02-13'],
      ['anniversary-1', '2026-03-15'],
      ['end', '2027-03-15'],
    ])
  })
  it('clamps leap-day anniversaries', () => {
    const ev = contractEvents({ start: '2024-02-29', end: '2029-01-01', reminderDays: 0 })!
    expect(ev.find((e) => e.id === 'anniversary-1')!.date).toBe('2025-02-28')
    expect(ev.find((e) => e.id === 'anniversary-4')!.date).toBe('2028-02-29')
  })
  it('handles reminders crossing the year boundary', () => {
    const ev = contractEvents({ start: '2025-01-10', end: '2026-06-01', reminderDays: 20 })!
    expect(ev.find((e) => e.id === 'reminder-1')!.date).toBe('2025-12-21')
  })
  it('rejects invalid input', () => {
    expect(contractEvents({ start: '', end: '', reminderDays: 30 })).toBeNull()
    expect(contractEvents({ start: '2025-02-30', end: '', reminderDays: 30 })).toBeNull()
    expect(contractEvents({ start: '2025-01-01', end: '2024-01-01', reminderDays: 30 })).toBeNull()
    expect(contractEvents({ start: '2025-01-01', end: '', reminderDays: -1 })).toBeNull()
  })
  it('produces a valid ics body', () => {
    const ev = contractEvents({ start: '2025-03-15', end: '2027-03-15', reminderDays: 30 })!
    const ics = toIcs(ev)!
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(3)
    expect(ics).toContain('DTSTART;VALUE=DATE:20260315')
    expect(toIcs([])).toBeNull()
  })
})
