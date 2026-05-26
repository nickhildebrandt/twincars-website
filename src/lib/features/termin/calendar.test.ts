/**
 * Tests for the booking-calendar pure date helpers.
 * Keep these timezone-stable by passing fixed `Date` instances rather
 * than relying on the system clock.
 */

import { describe, expect, it } from 'vitest'
import {
  buildMonthGrid,
  endOfDay,
  formatGermanDate,
  formatTime,
  shiftMonth,
  startOfDay,
  toIsoDate
} from './calendar'

describe('toIsoDate', () => {
  it('formats a date as YYYY-MM-DD in local time', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toIsoDate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('startOfDay / endOfDay', () => {
  const ref = new Date(2026, 5, 17, 14, 30, 0, 0)

  it('startOfDay returns midnight', () => {
    const s = startOfDay(ref)
    expect(s.getHours()).toBe(0)
    expect(s.getMinutes()).toBe(0)
    expect(s.getSeconds()).toBe(0)
    expect(s.getMilliseconds()).toBe(0)
    expect(s.getDate()).toBe(17)
  })

  it('endOfDay returns 23:59:59.999', () => {
    const e = endOfDay(ref)
    expect(e.getHours()).toBe(23)
    expect(e.getMinutes()).toBe(59)
    expect(e.getSeconds()).toBe(59)
    expect(e.getMilliseconds()).toBe(999)
  })
})

describe('shiftMonth', () => {
  it('rolls month forward', () => {
    expect(shiftMonth(2026, 0, 1)).toEqual({ year: 2026, month: 1 })
  })
  it('rolls year over at december', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 })
  })
  it('rolls year back at january', () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 })
  })
  it('handles deltas larger than a year', () => {
    expect(shiftMonth(2026, 5, 13)).toEqual({ year: 2027, month: 6 })
  })
})

describe('buildMonthGrid', () => {
  it('starts the grid on Monday', () => {
    // June 2026 — 1st of June is a Monday
    const today = new Date(2026, 5, 15)
    const grid = buildMonthGrid(2026, 5, today)
    expect(grid[0].iso).toBe('2026-06-01')
  })

  it('includes leading days from the previous month when the 1st is not Monday', () => {
    // January 2026 — 1st is a Thursday
    const grid = buildMonthGrid(2026, 0, new Date(2026, 0, 15))
    // First three cells should be Dec 29, 30, 31
    expect(grid[0].iso).toBe('2025-12-29')
    expect(grid[0].inMonth).toBe(false)
    expect(grid[3].iso).toBe('2026-01-01')
    expect(grid[3].inMonth).toBe(true)
  })

  it('marks today and past days', () => {
    const today = new Date(2026, 5, 15)
    const grid = buildMonthGrid(2026, 5, today)
    const todayCell = grid.find((c) => c.iso === '2026-06-15')
    const yesterdayCell = grid.find((c) => c.iso === '2026-06-14')
    expect(todayCell?.isToday).toBe(true)
    expect(yesterdayCell?.isPast).toBe(true)
    expect(todayCell?.isPast).toBe(false)
  })

  it('marks Sundays', () => {
    const grid = buildMonthGrid(2026, 5, new Date(2026, 5, 1))
    const sun = grid.find((c) => c.iso === '2026-06-07')
    expect(sun?.isSunday).toBe(true)
  })

  it('always returns a multiple of 7 cells', () => {
    for (let m = 0; m < 12; m++) {
      const grid = buildMonthGrid(2026, m, new Date(2026, m, 15))
      expect(grid.length % 7).toBe(0)
      expect(grid.length).toBeGreaterThanOrEqual(28)
      expect(grid.length).toBeLessThanOrEqual(42)
    }
  })
})

describe('formatGermanDate', () => {
  it('formats with German weekday', () => {
    // 2026-06-15 is a Monday
    expect(formatGermanDate('2026-06-15')).toBe('Mo, 15.06.2026')
  })
})

describe('formatTime', () => {
  it('formats an ISO timestamp as HH:MM', () => {
    const iso = new Date(2026, 5, 15, 9, 5).toISOString()
    expect(formatTime(iso)).toBe('09:05')
  })
})
