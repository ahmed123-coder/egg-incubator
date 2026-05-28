"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SensorLog {
  id: string;
  temperature: number;
  humidity: number;
  createdAt: string;
}

interface TempHumidityChartProps {
  data: SensorLog[];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TempHumidityChart({ data }: TempHumidityChartProps) {
  const chartData = data
    .slice()
    .reverse()
    .map((log) => ({
      time: formatTime(log.createdAt),
      temperature: log.temperature,
      humidity: log.humidity,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature & Humidity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="time"
                fontSize={11}
                tickLine={false}
                className="text-muted-foreground"
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="temp"
                orientation="left"
                fontSize={11}
                tickLine={false}
                className="text-muted-foreground"
                domain={["auto", "auto"]}
                label={{ value: "°C", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="humidity"
                orientation="right"
                fontSize={11}
                tickLine={false}
                className="text-muted-foreground"
                domain={[0, 100]}
                label={{ value: "%", angle: 90, position: "insideRight" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Temperature (°C)"
              />
              <Line
                yAxisId="humidity"
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
