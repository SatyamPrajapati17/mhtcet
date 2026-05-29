import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const colleges = await prisma.college.findMany({
      where: { city: { not: "" } },
      select: { city: true },
      orderBy: { city: "asc" },
    });

    const cities = [...new Set(colleges.map((c) => c.city))];

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Cities fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
