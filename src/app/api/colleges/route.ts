import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { code: { contains: query } },
        { city: { contains: query } },
      ];
    }
    if (city) {
      where.city = city;
    }

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { cutoffs: true },
          },
        },
      }),
      prisma.college.count({ where }),
    ]);

    return NextResponse.json({
      colleges: colleges.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        slug: c.slug,
        city: c.city,
        status: c.status,
        cutoffCount: c._count.cutoffs,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Colleges fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}
