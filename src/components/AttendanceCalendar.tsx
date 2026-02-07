import { Calendar } from '@/components/ui/calendar'
import { useAttendanceStore } from '@/store/attendanceStore'
import { formatDateKey, parseDateKey } from '@/lib/dateUtils'

interface AttendanceCalendarProps {
  displayMonth: Date
  onMonthChange: (date: Date) => void
}

export default function AttendanceCalendar({
  displayMonth,
  onMonthChange,
}: AttendanceCalendarProps) {
  const { dates, toggleDate } = useAttendanceStore()

  // Convert string dates to Date objects for react-day-picker
  const selectedDates = dates.map(parseDateKey)

  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      toggleDate(formatDateKey(day))
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onDayClick={handleDayClick}
        month={displayMonth}
        onMonthChange={onMonthChange}
        modifiersClassNames={{
          selected: 'attendance-selected',
        }}
        className="attendance-calendar"
      />
    </div>
  )
}
