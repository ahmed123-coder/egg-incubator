import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.incubationSession.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Sessions GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    const incubator = await prisma.incubator.findFirst();
    if (!incubator) {
      return NextResponse.json({ error: "No incubator found" }, { status: 404 });
    }

    await prisma.incubationSession.updateMany({
      where: { incubatorId: incubator.id, isActive: true },
      data: { isActive: false, endedAt: new Date() },
    });

    const session = await prisma.incubationSession.create({
      data: {
        incubatorId: incubator.id,
        name: name || `Batch ${new Date().toLocaleDateString()}`,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Sessions POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
