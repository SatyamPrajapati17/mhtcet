import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { name: { not: "" } },
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ branches: branches.map((b) => b.name) });
  } catch (error) {
    console.error("Branches fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
