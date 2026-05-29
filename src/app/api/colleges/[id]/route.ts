import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const college = await prisma.college.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        cutoffs: {
          include: {
            branch: true,
          },
          orderBy: [{ branch: { name: "asc" } }, { year: "desc" }, { capRound: "desc" }],
        },
      },
    });

    if (!college) {
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    // Group cutoffs by branch
    const branchGroups: Record<string, any> = {};
    for (const cutoff of college.cutoffs) {
      const key = cutoff.branch.name;
      if (!branchGroups[key]) {
        branchGroups[key] = {
          branchId: cutoff.branchId,
          branchName: cutoff.branch.name,
          branchCode: cutoff.branch.code,
          cutoffs: [],
        };
      }
      branchGroups[key].cutoffs.push({
        year: cutoff.year,
        capRound: cutoff.capRound,
        category: cutoff.category,
        openingPercentile: cutoff.openingPercentile,
        closingPercentile: cutoff.closingPercentile,
        openingRank: cutoff.openingRank,
        closingRank: cutoff.closingRank,
      });
    }

    return NextResponse.json({
      id: college.id,
      code: college.code,
      name: college.name,
      slug: college.slug,
      city: college.city,
      status: college.status,
      university: college.university,
      fees: college.fees,
      naacGrade: college.naacGrade,
      nirfRank: college.nirfRank,
      branches: Object.values(branchGroups),
    });
  } catch (error) {
    console.error("College detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch college details" },
      { status: 500 }
    );
  }
}
