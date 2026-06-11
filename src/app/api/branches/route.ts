import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { name: { not: "" } },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    // Deduplicate by name using Set (avoid Prisma distinct issues)
    const uniqueNames = [...new Set(branches.map((b) => b.name))];

    return NextResponse.json({ branches: uniqueNames });
  } catch (error) {
    console.error("Branches fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
