import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [collegeCount, branchCount, cutoffCount, yearGroups] =
      await Promise.all([
        prisma.college.count(),
        prisma.branch.count(),
        prisma.cutoff.count(),
        prisma.cutoff.groupBy({
          by: ["year"],
          _count: true,
        }),
      ]);

    return NextResponse.json({
      colleges: collegeCount,
      branches: branchCount,
      cutoffs: cutoffCount,
      years: yearGroups.map((y) => ({
        year: y.year,
        count: y._count,
      })),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
