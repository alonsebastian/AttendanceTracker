import { useState, useEffect } from 'react';
import AttendanceCalendar from './AttendanceCalendar';
import Dashboard from './Dashboard';
import Settings from './Settings';
import ThemeToggle from './ThemeToggle';
import { UserMenu } from './UserMenu';
import { useThemeStore } from '@/store/themeStore';
import { useAttendanceStore } from '@/store/attendanceStore';
import { useAttendance } from '@/services/ServiceContext';
import { LoadingSkeleton } from './LoadingSkeleton';

export default function Layout() {
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const { theme } = useThemeStore();
  const { setRepository, hydrate, isLoading } = useAttendanceStore();
  const attendance = useAttendance();

  // Initialize repository and load data on mount
  useEffect(() => {
    setRepository(attendance);
    hydrate();
  }, [attendance, setRepository, hydrate]);

  // Apply dark class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Office Attendance Tracker
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-8">
            {/* Mobile: Calendar (order-1), Desktop: Left column (row-span-2) */}
            <div className="order-1 md:row-span-2">
              <AttendanceCalendar
                displayMonth={displayMonth}
                onMonthChange={setDisplayMonth}
              />
            </div>

            {/* Mobile: Dashboard (order-2), Desktop: Right top */}
            <div className="order-2">
              <Dashboard displayMonth={displayMonth} />
            </div>

            {/* Mobile: Settings (order-3), Desktop: Right bottom */}
            <div className="order-3">
              <Settings />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
