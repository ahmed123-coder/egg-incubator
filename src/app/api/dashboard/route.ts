import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INCUBATION_DAYS } from "@/lib/constants";

export async function GET() {
  try {
    const incubator = await prisma.incubator.findFirst({
      include: {
        sensorLogs: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
        incubationSessions: {
          where: { isActive: true },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
        settings: true,
      },
    });

    if (!incubator) {
      return NextResponse.json(
        { error: "No incubator found. Create one via /api/settings/seed." },
        { status: 404 }
      );
    }

    const latestLog = incubator.sensorLogs[0] ?? null;

    const activeSession = incubator.incubationSessions[0] ?? null;
    let currentDay = 0;
    let remainingDays = INCUBATION_DAYS;
    let progressPercent = 0;

    if (activeSession) {
      const elapsed = Date.now() - new Date(activeSession.startedAt).getTime();
      currentDay = Math.min(Math.floor(elapsed / (1000 * 60 * 60 * 24)) + 1, INCUBATION_DAYS);
      remainingDays = Math.max(INCUBATION_DAYS - currentDay, 0);
      progressPercent = (currentDay / INCUBATION_DAYS) * 100;
    }

    const sensorLogs = incubator.sensorLogs.map((log) => ({
      id: log.id,
      temperature: log.temperature,
      humidity: log.humidity,
      heaterOn: log.heaterOn,
      fanOn: log.fanOn,
      createdAt: log.createdAt.toISOString(),
    }));

    const settingsMap: Record<string, string> = {};
    for (const setting of incubator.settings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json({
      incubator: {
        id: incubator.id,
        name: incubator.name,
      },
      current: latestLog
        ? {
            temperature: latestLog.temperature,
            humidity: latestLog.humidity,
            heaterOn: latestLog.heaterOn,
            fanOn: latestLog.fanOn,
            updatedAt: latestLog.createdAt.toISOString(),
          }
        : null,
      session: activeSession
        ? {
            id: activeSession.id,
            startedAt: activeSession.startedAt.toISOString(),
            currentDay,
            remainingDays,
            progressPercent,
            daysTotal: INCUBATION_DAYS,
          }
        : null,
      sensorLogs,
      settings: settingsMap,
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
