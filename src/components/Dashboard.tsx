import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendanceStore } from '@/store/attendanceStore';
import { countForMonth, countRolling13Weeks } from '@/lib/dateUtils';

interface DashboardProps {
  displayMonth: Date;
}

export default function Dashboard({ displayMonth }: DashboardProps) {
  const { dates, isLoading } = useAttendanceStore();

  const monthCount = countForMonth(dates, displayMonth);
  const rolling13WeeksCount = countRolling13Weeks(dates);

  const monthName = displayMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 mt-2 animate-pulse" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rolling 13 Weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-40 mt-2 animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{monthCount}</div>
          <p className="text-sm text-muted-foreground mt-1">{monthName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rolling 13 Weeks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{rolling13WeeksCount}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Last 91 days from today
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
