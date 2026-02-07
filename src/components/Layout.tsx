import { useState } from 'react'
import AttendanceCalendar from './AttendanceCalendar'
import Dashboard from './Dashboard'
import Settings from './Settings'

export default function Layout() {
  const [displayMonth, setDisplayMonth] = useState(new Date())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Office Attendance Tracker
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile: Stats first, Calendar second */}
          {/* Desktop: Calendar left, Stats right */}
          <div className="order-2 md:order-1 flex-1">
            <AttendanceCalendar
              displayMonth={displayMonth}
              onMonthChange={setDisplayMonth}
            />
          </div>

          <div className="order-1 md:order-2 flex-1 space-y-6">
            <Dashboard displayMonth={displayMonth} />
            <Settings />
          </div>
        </div>
      </div>
    </div>
  )
}
