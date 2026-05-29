import { NextRequest, NextResponse } from "next/server";
import { compareColleges } from "@/lib/prediction-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collegeIds } = body as { collegeIds: string[] };

    if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length < 2) {
      return NextResponse.json(
        { error: "Please provide at least 2 college IDs to compare" },
        { status: 400 }
      );
    }

    const result = await compareColleges(collegeIds);
    return NextResponse.json({ colleges: result });
  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json(
      { error: "Failed to compare colleges" },
      { status: 500 }
    );
  }
}
