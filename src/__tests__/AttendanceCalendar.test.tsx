import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AttendanceCalendar from '../components/AttendanceCalendar'

describe('AttendanceCalendar', () => {
  const defaultProps = {
    displayMonth: new Date(2026, 1, 1), // February 2026
    onMonthChange: () => {},
  }

  describe('Calendar Grid Layout', () => {
    it('should render all 7 day-of-week headers', () => {
      render(<AttendanceCalendar {...defaultProps} />)

      // Check that all weekday abbreviations are present
      const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

      weekdays.forEach((day) => {
        const dayElement = screen.getByText(day)
        expect(dayElement).toBeInTheDocument()
      })
    })

    it('should have proper grid structure with weekdays row', () => {
      const { container } = render(<AttendanceCalendar {...defaultProps} />)

      // Find the table header row
      const headRow = container.querySelector('thead tr')
      expect(headRow).toBeInTheDocument()

      // Should have 7 header cells (one for each day of the week)
      const headerCells = headRow?.querySelectorAll('th')
      expect(headerCells).toHaveLength(7)
    })

    it('should have rdp-weekdays class on header row', () => {
      const { container } = render(<AttendanceCalendar {...defaultProps} />)

      const headRow = container.querySelector('thead tr')
      expect(headRow?.className).toContain('rdp-weekdays')
    })

    it('should have rdp-weekday class on header cells', () => {
      const { container } = render(<AttendanceCalendar {...defaultProps} />)

      const headerCells = container.querySelectorAll('thead tr th')

      // Each header cell should have rdp-weekday class (styled by CSS)
      headerCells.forEach((cell) => {
        expect(cell.className).toContain('rdp-weekday')
      })
    })

    it('should have rdp-week class on body rows', () => {
      const { container } = render(<AttendanceCalendar {...defaultProps} />)

      const bodyRows = container.querySelectorAll('tbody tr')
      expect(bodyRows.length).toBeGreaterThan(0)

      // Each body row should have rdp-week class (styled by CSS)
      bodyRows.forEach((row) => {
        expect(row.className).toContain('rdp-week')
      })
    })

    it('should render day buttons in calendar grid', () => {
      render(<AttendanceCalendar {...defaultProps} />)

      // February 2026 should show days 1-28
      const dayOne = screen.getByRole('button', {
        name: 'Sunday, February 1st, 2026',
      })
      expect(dayOne).toBeInTheDocument()

      const dayFourteen = screen.getByRole('button', {
        name: 'Saturday, February 14th, 2026',
      })
      expect(dayFourteen).toBeInTheDocument()

      const dayTwentyEight = screen.getByRole('button', {
        name: 'Saturday, February 28th, 2026',
      })
      expect(dayTwentyEight).toBeInTheDocument()
    })

    it('should have consistent column count (7 cells per row)', () => {
      const { container } = render(<AttendanceCalendar {...defaultProps} />)

      // Check header row
      const headerCells = container.querySelectorAll('thead tr th')
      expect(headerCells).toHaveLength(7)

      // Check each body row has 7 cells
      const bodyRows = container.querySelectorAll('tbody tr')
      bodyRows.forEach((row) => {
        const cells = row.querySelectorAll('td')
        expect(cells).toHaveLength(7)
      })
    })

    it('should allow day buttons to fill available space', () => {
      const { container } = render(<AttendanceCalendar {...defaultProps} />)

      const dayButtons = container.querySelectorAll('.rdp-day_button')
      expect(dayButtons.length).toBeGreaterThan(0)

      // Verify buttons exist and are rendered (width styling is applied via CSS)
      // The actual width calculation happens in the browser, not in the test environment
      dayButtons.forEach((button) => {
        expect(button).toBeInTheDocument()
        // Check that the button has the rdp-day_button class which applies the responsive width
        expect(button.className).toContain('rdp-day_button')
      })
    })
  })

  describe('Visual Regression Checks', () => {
    it('should apply custom calendar styling class', () => {
      const { container } = render(<AttendanceCalendar {...defaultProps} />)

      const calendarContainer = container.querySelector('.attendance-calendar')
      expect(calendarContainer).toBeInTheDocument()
    })

    it('should render within a card container', () => {
      const { container } = render(<AttendanceCalendar {...defaultProps} />)

      const card = container.querySelector('.bg-card.rounded-xl.shadow-sm.border')
      expect(card).toBeInTheDocument()
    })
  })
})
