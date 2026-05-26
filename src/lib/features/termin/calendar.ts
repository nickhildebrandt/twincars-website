/**
 * @file Pure date helpers for the appointment-booking calendar.
 *
 * No DOM access. No imports beyond `Date` — these run identically in the
 * browser and during SSR so tests can exercise them in isolation.
 *
 * All "calendar dates" here are local (workshop) time. ISO strings cross
 * the wire to the Twincars Manager API, but the user-facing calendar
 * thinks in days, not in timezones.
 */

/** Days of the week (Mon → Sun) as labels for the calendar header. */
export const WEEKDAY_LABELS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as const

/** German month names in display order (Jan → Dez). */
export const MONTH_LABELS_DE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'
] as const

/** A single cell in the rendered calendar grid. */
export interface CalendarCell {
  /** ISO `YYYY-MM-DD` (workshop-local). */
  iso: string
  /** Day-of-month, 1–31. */
  day: number
  /** Whether the cell belongs to the displayed month (vs. leading/trailing). */
  inMonth: boolean
  /** True if the cell represents "today" in workshop-local time. */
  isToday: boolean
  /** True if the cell is in the past (and therefore not selectable). */
  isPast: boolean
  /** True if the cell falls on Sunday (when the workshop is closed). */
  isSunday: boolean
}

/**
 * Pads a number to two digits with a leading zero.
 *
 * @param n  Integer to format.
 * @returns  Two-character zero-padded string.
 */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/**
 * Formats a `Date` as `YYYY-MM-DD` in *local* time. Avoids
 * `toISOString()` because that converts to UTC and shifts the day for
 * Berlin during DST.
 *
 * @param d  Date to format.
 * @returns  ISO calendar date string in local time.
 */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/**
 * Returns the local-time start of the given day (00:00:00.000).
 *
 * @param d  Any moment within the desired day.
 * @returns  A new `Date` at midnight in local time.
 */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

/**
 * Returns the local-time end of the given day (23:59:59.999).
 *
 * @param d  Any moment within the desired day.
 * @returns  A new `Date` just before midnight in local time.
 */
export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

/**
 * Builds the grid of cells for the given (year, month) view.
 *
 * Always returns either 35 or 42 cells (5 or 6 weeks), starting on
 * Monday. Leading days of the previous month and trailing days of the
 * next month are included so the grid is rectangular.
 *
 * @param year   Four-digit year of the month to render.
 * @param month  Zero-based month (0 = January).
 * @param today  Reference date for "is today" / "is past" classification.
 * @returns      Ordered list of cells (Mon-first, top-left to bottom-right).
 */
export function buildMonthGrid(
  year: number,
  month: number,
  today: Date
): CalendarCell[] {
  const first = new Date(year, month, 1)
  // JS getDay(): 0 = Sun, 1 = Mon, …, 6 = Sat. We want Monday-first index.
  const leading = (first.getDay() + 6) % 7

  const last = new Date(year, month + 1, 0).getDate()
  const totalRaw = leading + last
  const rows = Math.ceil(totalRaw / 7)
  const total = rows * 7

  const todayIso = toIsoDate(today)
  const todayMs = startOfDay(today).getTime()

  const cells: CalendarCell[] = []
  for (let i = 0; i < total; i++) {
    const dayNum = i - leading + 1
    const cellDate = new Date(year, month, dayNum)
    const inMonth = dayNum >= 1 && dayNum <= last
    const iso = toIsoDate(cellDate)
    const dow = cellDate.getDay()
    cells.push({
      iso,
      day: cellDate.getDate(),
      inMonth,
      isToday: iso === todayIso,
      isPast: cellDate.getTime() < todayMs,
      isSunday: dow === 0
    })
  }
  return cells
}

/**
 * Adds the given number of months to a `(year, month)` pair, normalising
 * negative or out-of-range months.
 *
 * @param year   Year part of the input.
 * @param month  Zero-based month (0 = January).
 * @param delta  Number of months to add (may be negative).
 * @returns      `{ year, month }` of the resulting view.
 */
export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

/**
 * Formats an ISO calendar date for German display, e.g. `Mo, 03.06.`.
 *
 * @param iso  ISO `YYYY-MM-DD` string.
 * @returns    Short German label.
 */
export function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dow = WEEKDAY_LABELS_DE[(date.getDay() + 6) % 7]
  return `${dow}, ${pad2(d)}.${pad2(m)}.${y}`
}

/**
 * Formats an ISO timestamp as `HH:MM` in local time.
 *
 * @param iso  ISO timestamp (any timezone offset).
 * @returns    Two-digit hour:minute string.
 */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
