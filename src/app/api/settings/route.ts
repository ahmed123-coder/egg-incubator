import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const incubator = await prisma.incubator.findFirst({
      include: { settings: true },
    });

    if (!incubator) {
      return NextResponse.json({ error: "No incubator found" }, { status: 404 });
    }

    const settings: Record<string, string> = {};
    for (const s of incubator.settings) {
      settings[s.key] = s.value;
    }

    return NextResponse.json({ settings, incubatorId: incubator.id });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    let incubator = await prisma.incubator.findFirst();
    if (!incubator) {
      incubator = await prisma.incubator.create({ data: {} });
    }

    const setting = await prisma.setting.upsert({
      where: { incubatorId_key: { incubatorId: incubator.id, key } },
      update: { value: String(value) },
      create: {
        incubatorId: incubator.id,
        key,
        value: String(value),
      },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
