import { describe, it, expect, beforeEach } from 'vitest'
import { useAttendanceStore } from '../store/attendanceStore'

describe('attendanceStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAttendanceStore.setState({ dates: [] })
  })

  it('should toggle date - add when not present', () => {
    const { toggleDate } = useAttendanceStore.getState()

    toggleDate('2025-01-15')

    expect(useAttendanceStore.getState().dates).toContain('2025-01-15')
    expect(useAttendanceStore.getState().dates).toHaveLength(1)
  })

  it('should toggle date - remove when present', () => {
    const { toggleDate } = useAttendanceStore.getState()

    toggleDate('2025-01-15')
    expect(useAttendanceStore.getState().dates).toContain('2025-01-15')

    toggleDate('2025-01-15')
    expect(useAttendanceStore.getState().dates).not.toContain('2025-01-15')
    expect(useAttendanceStore.getState().dates).toHaveLength(0)
  })

  it('should check if date is present', () => {
    const { toggleDate, isPresent } = useAttendanceStore.getState()

    expect(isPresent('2025-01-15')).toBe(false)

    toggleDate('2025-01-15')
    expect(isPresent('2025-01-15')).toBe(true)
  })

  it('should replace all dates and deduplicate', () => {
    const { replaceAll } = useAttendanceStore.getState()

    // Set some initial dates
    useAttendanceStore.setState({ dates: ['2025-01-01', '2025-01-02'] })

    // Replace with new dates including duplicates
    replaceAll(['2025-02-01', '2025-02-02', '2025-02-01'])

    const { dates } = useAttendanceStore.getState()
    expect(dates).toHaveLength(2)
    expect(dates).toContain('2025-02-01')
    expect(dates).toContain('2025-02-02')
    expect(dates).not.toContain('2025-01-01')
  })

  it('should merge with existing dates and deduplicate', () => {
    const { mergeWith } = useAttendanceStore.getState()

    // Set some initial dates
    useAttendanceStore.setState({ dates: ['2025-01-01', '2025-01-02'] })

    // Merge with new dates including overlaps
    mergeWith(['2025-01-02', '2025-01-03', '2025-01-04'])

    const { dates } = useAttendanceStore.getState()
    expect(dates).toHaveLength(4)
    expect(dates).toContain('2025-01-01')
    expect(dates).toContain('2025-01-02')
    expect(dates).toContain('2025-01-03')
    expect(dates).toContain('2025-01-04')
  })

  it('should maintain unique dates when merging duplicates', () => {
    const { mergeWith } = useAttendanceStore.getState()

    useAttendanceStore.setState({ dates: ['2025-01-01'] })

    mergeWith(['2025-01-01', '2025-01-01', '2025-01-02'])

    const { dates } = useAttendanceStore.getState()
    expect(dates).toHaveLength(2)
  })
})
