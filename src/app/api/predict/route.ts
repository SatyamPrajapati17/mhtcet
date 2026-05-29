import { NextRequest, NextResponse } from "next/server";
import { predictColleges, type PredictionInput } from "@/lib/prediction-engine";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const percentile = raw.percentile;

    if (!percentile || percentile <= 0) {
      return NextResponse.json(
        { error: "Please provide a valid percentile value" },
        { status: 400 }
      );
    }

    // Convert single branch string to preferredBranches array
    const body: PredictionInput = {
      ...raw,
      preferredBranches: raw.branch ? [raw.branch] : undefined,
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
