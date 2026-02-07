import { describe, it, expect } from 'vitest'
import {
  formatDateKey,
  parseDateKey,
  countForMonth,
  countRolling13Weeks,
} from '../lib/dateUtils'

describe('dateUtils', () => {
  describe('formatDateKey', () => {
    it('should format date to YYYY-MM-DD string', () => {
      const date = new Date(2025, 0, 15) // January 15, 2025
      expect(formatDateKey(date)).toBe('2025-01-15')
    })

    it('should pad single-digit months and days', () => {
      const date = new Date(2025, 4, 5) // May 5, 2025
      expect(formatDateKey(date)).toBe('2025-05-05')
    })
  })

  describe('parseDateKey', () => {
    it('should parse YYYY-MM-DD string to Date', () => {
      const date = parseDateKey('2025-01-15')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(0) // January = 0
      expect(date.getDate()).toBe(15)
    })

    it('should handle dates with leading zeros', () => {
      const date = parseDateKey('2025-05-05')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(4) // May = 4
      expect(date.getDate()).toBe(5)
    })
  })

  describe('formatDateKey and parseDateKey round-trip', () => {
    it('should maintain date integrity through round-trip', () => {
      const original = new Date(2025, 5, 20) // June 20, 2025
      const key = formatDateKey(original)
      const parsed = parseDateKey(key)

      expect(parsed.getFullYear()).toBe(original.getFullYear())
      expect(parsed.getMonth()).toBe(original.getMonth())
      expect(parsed.getDate()).toBe(original.getDate())
    })
  })

  describe('countForMonth', () => {
    it('should count dates in the given month', () => {
      const dates = [
        '2025-01-10',
        '2025-01-15',
        '2025-01-20',
        '2025-02-05',
        '2025-02-10',
      ]
      const displayMonth = new Date(2025, 0, 1) // January 2025

      expect(countForMonth(dates, displayMonth)).toBe(3)
    })

    it('should handle month boundaries correctly', () => {
      const dates = [
        '2025-01-31', // Last day of January
        '2025-02-01', // First day of February
      ]
      const januaryMonth = new Date(2025, 0, 15)
      const februaryMonth = new Date(2025, 1, 15)

      expect(countForMonth(dates, januaryMonth)).toBe(1)
      expect(countForMonth(dates, februaryMonth)).toBe(1)
    })

    it('should return 0 when no dates in month', () => {
      const dates = ['2025-01-10', '2025-03-10']
      const displayMonth = new Date(2025, 1, 1) // February 2025

      expect(countForMonth(dates, displayMonth)).toBe(0)
    })
  })

  describe('countRolling13Weeks', () => {
    it('should count dates in last 91 days', () => {
      const today = new Date(2025, 0, 31) // January 31, 2025
      // 91 days back = November 1, 2024

      const dates = [
        '2024-11-01', // Exactly 91 days ago - INCLUDED
        '2024-11-15',
        '2025-01-15',
        '2025-01-31', // Today - INCLUDED
      ]

      expect(countRolling13Weeks(dates, today)).toBe(4)
    })

    it('should exclude dates older than 91 days', () => {
      const today = new Date(2025, 0, 31) // January 31, 2025
      // 91 days back = November 1, 2024
      // 92 days back = October 31, 2024 - EXCLUDED

      const dates = [
        '2024-10-31', // 92 days ago - EXCLUDED
        '2024-11-01', // 91 days ago - INCLUDED
        '2025-01-31', // Today - INCLUDED
      ]

      expect(countRolling13Weeks(dates, today)).toBe(2)
    })

    it('should handle dates in the future', () => {
      const today = new Date(2025, 0, 15) // January 15, 2025

      const dates = [
        '2025-01-01',
        '2025-01-20', // Future - EXCLUDED
        '2025-02-01', // Future - EXCLUDED
      ]

      expect(countRolling13Weeks(dates, today)).toBe(1)
    })

    it('should use current date when today param not provided', () => {
      // This test just verifies the function runs without error
      // when no today param is provided
      const dates = ['2025-01-01']
      const count = countRolling13Weeks(dates)
      expect(typeof count).toBe('number')
    })

    it('should handle empty dates array', () => {
      const today = new Date(2025, 0, 15)
      expect(countRolling13Weeks([], today)).toBe(0)
    })
  })
})
