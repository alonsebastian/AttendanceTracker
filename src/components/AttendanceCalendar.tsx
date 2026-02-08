import { Calendar } from '@/components/ui/calendar';
import { useAttendanceStore } from '@/store/attendanceStore';
import { formatDateKey, parseDateKey } from '@/lib/dateUtils';
import { toast } from 'sonner';

interface AttendanceCalendarProps {
  displayMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function AttendanceCalendar({
  displayMonth,
  onMonthChange,
}: AttendanceCalendarProps) {
  const { dates, toggleDate } = useAttendanceStore();

  // Convert string dates to Date objects for react-day-picker
  const selectedDates = dates.map(parseDateKey);

  const handleDayClick = async (day: Date | undefined) => {
    if (day) {
      try {
        await toggleDate(formatDateKey(day));
      } catch (error) {
        // Error toast is shown automatically (store already rolled back)
        toast.error('Failed to update attendance. Please try again.');
        console.error('Toggle error:', error);
      }
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4">
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
  );
}
