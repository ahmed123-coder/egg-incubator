import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { temperature, humidity, heaterOn, fanOn, incubatorId } = body;

    if (temperature === undefined || humidity === undefined) {
      return NextResponse.json(
        { error: "temperature and humidity are required" },
        { status: 400 }
      );
    }

    const incubator = await prisma.incubator.findFirst();

    if (!incubator) {
      return NextResponse.json(
        { error: "No incubator found. Create one first." },
        { status: 404 }
      );
    }

    const sensorLog = await prisma.sensorLog.create({
      data: {
        incubatorId: incubator.id,
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        heaterOn: heaterOn ?? false,
        fanOn: fanOn ?? false,
      },
    });

    return NextResponse.json({ success: true, id: sensorLog.id }, { status: 201 });
  } catch (error) {
    console.error("Sensor POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
