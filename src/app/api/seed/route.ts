import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TEMPERATURE_C, DEFAULT_HUMIDITY_PCT } from "@/lib/constants";

export async function POST() {
  try {
    const existing = await prisma.incubator.findFirst();
    if (existing) {
      return NextResponse.json({ message: "Already seeded", incubatorId: existing.id });
    }

    const incubator = await prisma.incubator.create({
      data: {
        name: "Main Incubator",
      },
    });

    await prisma.setting.createMany({
      data: [
        { incubatorId: incubator.id, key: "targetTemperature", value: String(DEFAULT_TEMPERATURE_C) },
        { incubatorId: incubator.id, key: "targetHumidity", value: String(DEFAULT_HUMIDITY_PCT) },
        { incubatorId: incubator.id, key: "incubationDays", value: "21" },
      ],
    });

    await prisma.incubationSession.create({
      data: {
        incubatorId: incubator.id,
        name: "First Batch",
      },
    });

    return NextResponse.json({
      message: "Incubator seeded successfully",
      incubatorId: incubator.id,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
