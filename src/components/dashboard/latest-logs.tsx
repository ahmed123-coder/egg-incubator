import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface SensorLog {
  id: string;
  temperature: number;
  humidity: number;
  heaterOn: boolean;
  fanOn: boolean;
  createdAt: string;
}

interface LatestLogsProps {
  logs: SensorLog[];
}

export function LatestLogs({ logs }: LatestLogsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Readings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Time</th>
                <th className="pb-2 pr-4 font-medium">Temp (°C)</th>
                <th className="pb-2 pr-4 font-medium">Humidity (%)</th>
                <th className="pb-2 pr-4 font-medium">Heater</th>
                <th className="pb-2 font-medium">Fan</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No readings yet
                  </td>
                </tr>
              ) : (
                logs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 tabular-nums text-muted-foreground">
                      {formatDateTime(new Date(log.createdAt))}
                    </td>
                    <td className="py-2 pr-4 tabular-nums font-medium">
                      {log.temperature.toFixed(1)}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{log.humidity.toFixed(1)}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={log.heaterOn ? "default" : "secondary"}>
                        {log.heaterOn ? "ON" : "OFF"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Badge variant={log.fanOn ? "default" : "secondary"}>
                        {log.fanOn ? "ON" : "OFF"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
