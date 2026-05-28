"use client";

import { useState, useEffect, useCallback } from "react";
import { Thermometer, Droplets, Flame, Fan, Egg } from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { TempHumidityChart } from "@/components/dashboard/temp-humidity-chart";
import { IncubatorProgress } from "@/components/dashboard/incubator-progress";
import { LatestLogs } from "@/components/dashboard/latest-logs";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePolling } from "@/hooks/use-polling";
import { POLLING_INTERVAL_MS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface DashboardData {
  incubator: { id: string; name: string };
  current: {
    temperature: number;
    humidity: number;
    heaterOn: boolean;
    fanOn: boolean;
    updatedAt: string;
  } | null;
  session: {
    id: string;
    startedAt: string;
    currentDay: number;
    remainingDays: number;
    progressPercent: number;
    daysTotal: number;
  } | null;
  sensorLogs: Array<{
    id: string;
    temperature: number;
    humidity: number;
    heaterOn: boolean;
    fanOn: boolean;
    createdAt: string;
  }>;
  settings: Record<string, string>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSeed, setNeedsSeed] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        if (res.status === 404) {
          setNeedsSeed(true);
          return;
        }
        throw new Error("Failed to fetch dashboard");
      }
      const json = await res.json();
      setData(json);
      setError(null);
      setNeedsSeed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchDashboard, POLLING_INTERVAL_MS, !needsSeed);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSeed = async () => {
    try {
      await fetch("/api/seed", { method: "POST" });
      setNeedsSeed(false);
      fetchDashboard();
    } catch {
      setError("Failed to initialize incubator");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Egg className="size-8 animate-pulse" />
          <span className="text-sm">Connecting to incubator...</span>
        </div>
      </div>
    );
  }

  if (needsSeed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Egg className="size-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Welcome to Fa9asa</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            No incubator detected. Initialize your first incubator to get started.
          </p>
          <Button onClick={handleSeed}>Initialize Incubator</Button>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-red-500">
          <span className="text-lg font-medium">Connection Error</span>
          <span className="text-sm text-muted-foreground">{error}</span>
          <Button variant="outline" onClick={fetchDashboard} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Egg className="size-5" />
            <span className="text-sm font-semibold">{data?.incubator.name ?? "Incubator"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {data?.current?.updatedAt
                ? `Updated ${new Date(data.current.updatedAt).toLocaleTimeString()}`
                : "No data"}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            title="Temperature"
            value={data?.current?.temperature.toFixed(1) ?? "---"}
            unit="°C"
            icon={Thermometer}
            status={
              data?.current?.temperature
                ? data.current.temperature > 38
                  ? "danger"
                  : data.current.temperature < 36
                    ? "warning"
                    : "success"
                : "info"
            }
          />
          <StatusCard
            title="Humidity"
            value={data?.current?.humidity.toFixed(1) ?? "---"}
            unit="%"
            icon={Droplets}
            status={
              data?.current?.humidity
                ? data.current.humidity > 70
                  ? "danger"
                  : data.current.humidity < 40
                    ? "warning"
                    : "success"
                : "info"
            }
          />
          <StatusCard
            title="Heater"
            value={data?.current?.heaterOn ? "ON" : "OFF"}
            icon={Flame}
            status={data?.current?.heaterOn ? "warning" : "info"}
          />
          <StatusCard
            title="Fan"
            value={data?.current?.fanOn ? "ON" : "OFF"}
            icon={Fan}
            status={data?.current?.fanOn ? "info" : "info"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TempHumidityChart data={data?.sensorLogs ?? []} />
          </div>
          <div>
            <IncubatorProgress
              currentDay={data?.session?.currentDay ?? 0}
              remainingDays={data?.session?.remainingDays ?? 21}
              daysTotal={data?.session?.daysTotal ?? 21}
              progressPercent={data?.session?.progressPercent ?? 0}
              startedAt={data?.session?.startedAt ?? null}
            />
          </div>
        </div>

        <LatestLogs logs={data?.sensorLogs ?? []} />
      </main>
    </div>
  );
}
