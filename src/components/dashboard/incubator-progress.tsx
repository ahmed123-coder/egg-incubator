import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IncubatorProgressProps {
  currentDay: number;
  remainingDays: number;
  daysTotal: number;
  progressPercent: number;
  startedAt: string | null;
}

export function IncubatorProgress({
  currentDay,
  remainingDays,
  daysTotal,
  progressPercent,
  startedAt,
}: IncubatorProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incubation Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Day {currentDay} of {daysTotal}</span>
          <span className="font-medium">{remainingDays} days remaining</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Start: {startedAt ? new Date(startedAt).toLocaleDateString() : "N/A"}</span>
          <span>End: {startedAt ? new Date(new Date(startedAt).getTime() + daysTotal * 86400000).toLocaleDateString() : "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
