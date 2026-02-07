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
      </div>
    </div>
  )
}
