import { NextRequest, NextResponse } from "next/server";
import { predictColleges, type PredictionInput } from "@/lib/prediction-engine";

export async function POST(request: NextRequest) {
  try {
    const raw: Record<string, any> = await request.json();
    const percentile = raw.percentile;

    if (!percentile || percentile <= 0) {
      return NextResponse.json(
        { error: "Please provide a valid percentile value" },
        { status: 400 }
      );
    }

    // Convert single branch string to preferredBranches array
    const body: PredictionInput = {
      percentile: Number(raw.percentile) || 0,
      marks: Number(raw.marks) || 0,
      category: String(raw.category || "GOPENS"),
      gender: String(raw.gender || ""),
      homeUniversity: String(raw.homeUniversity || ""),
      tfws: Boolean(raw.tfws),
      minority: Boolean(raw.minority),
      preferredBranches: raw.branch ? [String(raw.branch)] : undefined,
      preferredColleges: raw.preferredColleges,
      city: raw.city || undefined,
      year: raw.year ? Number(raw.year) : undefined,
      capRound: raw.capRound ? Number(raw.capRound) : undefined,
    };

    const result = await predictColleges(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Failed to generate predictions" },
      { status: 500 }
    );
  }
}
