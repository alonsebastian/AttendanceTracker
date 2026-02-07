import { subWeeks, startOfMonth, endOfMonth } from 'date-fns'

/**
 * Format a Date object to YYYY-MM-DD local string
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse YYYY-MM-DD string to Date object using local timezone
 * Avoids UTC timezone bug from `new Date("YYYY-MM-DD")`
 */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Count attendance dates within the given calendar month
 */
export function countForMonth(dates: string[], displayMonth: Date): number {
  const monthStart = startOfMonth(displayMonth)
  const monthEnd = endOfMonth(displayMonth)

  return dates.filter((dateKey) => {
    const date = parseDateKey(dateKey)
    return date >= monthStart && date <= monthEnd
  }).length
}

/**
 * Count attendance dates in the last 13 weeks (91 days) from today
 * The 91st day is included, the 92nd day is excluded
 */
export function countRolling13Weeks(
  dates: string[],
  today: Date = new Date()
): number {
  // Set to start of day to avoid time-of-day issues
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startDate = subWeeks(todayStart, 13)

  return dates.filter((dateKey) => {
    const date = parseDateKey(dateKey)
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return dateStart >= startDate && dateStart <= todayStart
  }).length
}
