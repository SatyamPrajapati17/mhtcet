import { prisma } from "./prisma";

export type PredictionInput = {
  percentile: number;
  marks: number;
  category: string;
  gender: string;
  homeUniversity: string;
  tfws: boolean;
  minority: boolean;
  preferredBranches?: string[];
  preferredColleges?: string[];
  city?: string;
  year?: number;
  capRound?: number;
};

export type PredictionResult = {
  collegeId: string;
  collegeName: string;
  collegeSlug: string;
  branchId: string;
  branchName: string;
  category: string;
  closingPercentile: number;
  openingPercentile: number;
  closingRank: number;
  openingRank: number;
  year: number;
  capRound: number;
  level: "dream" | "moderate" | "safe" | "no-chance";
  score: number;
};

function calculateScore(
  percentile: number,
  closingPercentile: number,
  openingPercentile: number
): number {
  // Score: how close the user's percentile is to the cutoff range
  // Higher is better for dream/moderate classification
  if (percentile >= closingPercentile) {
    // Above closing - Safe
    return 100;
  } else if (percentile >= openingPercentile && percentile < closingPercentile) {
    // Within range - Moderate
    const range = closingPercentile - openingPercentile;
    if (range === 0) return 60;
    return 60 + ((percentile - openingPercentile) / range) * 30;
  } else {
    // Below opening - Dream or no chance
    const gap = openingPercentile - percentile;
    if (gap <= 5) {
      // Within 5 percentile - Dream
      return 30 + (1 - gap / 5) * 20;
    }
    // Too far - No chance
    return Math.max(0, 10 - gap * 2);
  }
}

function classifyLevel(
  percentile: number,
  closingPercentile: number,
  openingPercentile: number,
  score: number
): "dream" | "moderate" | "safe" | "no-chance" {
  if (score >= 80) return "safe";
  if (score >= 50) return "moderate";
  if (score >= 20) return "dream";
  return "no-chance";
}

export async function predictColleges(
  input: PredictionInput
): Promise<{
  safe: PredictionResult[];
  moderate: PredictionResult[];
  dream: PredictionResult[];
  noChance: PredictionResult[];
  metadata: {
    totalPredictions: number;
    inputPercentile: number;
    inputCategory: string;
    year: number;
    capRound: number;
  };
}> {
  const year = input.year || 2024;
  const capRound = input.capRound || 3;
  const category = input.category || "GOPENS";

  const cutoffRows = await prisma.cutoff.findMany({
    where: {
      year,
      capRound,
      category: {
        contains: category,
      },
    },
    include: {
      college: true,
      branch: true,
    },
    orderBy: {
      closingPercentile: "desc",
    },
  });

  const results: PredictionResult[] = [];
  const seen = new Set<string>();

  for (const row of cutoffRows) {
    const key = `${row.collegeId}-${row.branchId}`;
    if (seen.has(key) && results.length > 500) continue;
    seen.add(key);

    const score = calculateScore(
      input.percentile,
      row.closingPercentile,
      row.openingPercentile
    );
    const level = classifyLevel(
      input.percentile,
      row.closingPercentile,
      row.openingPercentile,
      score
    );

    // Apply filters
    if (
      input.preferredBranches &&
      input.preferredBranches.length > 0 &&
      !input.preferredBranches.some(
        (b) =>
          row.branch.name.toLowerCase().includes(b.toLowerCase()) ||
          row.branch.code.toLowerCase().includes(b.toLowerCase())
      )
    ) {
      continue;
    }

    // Apply city filter
    if (input.city && row.college.city.toLowerCase() !== input.city.toLowerCase()) {
      continue;
    }

    results.push({
      collegeId: row.collegeId,
      collegeName: row.college.name,
      collegeSlug: row.college.slug,
      branchId: row.branchId,
      branchName: row.branch.name,
      category: row.category,
      closingPercentile: row.closingPercentile,
      openingPercentile: row.openingPercentile,
      closingRank: row.closingRank,
      openingRank: row.openingRank,
      year: row.year,
      capRound: row.capRound,
      level,
      score,
    });
  }

  results.sort((a, b) => b.score - a.score);

  // Limit top results
  const topResults = results.slice(0, 500);

  const safe = topResults.filter((r) => r.level === "safe");
  const moderate = topResults
    .filter((r) => r.level === "moderate");
  const dream = topResults.filter((r) => r.level === "dream");
  const noChance = topResults
    .filter((r) => r.level === "no-chance");

  return {
    safe,
    moderate,
    dream,
    noChance,
    metadata: {
      totalPredictions: results.length,
      inputPercentile: input.percentile,
      inputCategory: category,
      year,
      capRound,
    },
  };
}

export async function compareColleges(
  collegeIds: string[]
): Promise<
  {
    college: { id: string; name: string; slug: string; city: string; fees: number; naacGrade: string; nirfRank: number };
    cutoffs: {
      year: number;
      capRound: number;
      category: string;
      branchName: string;
      closingPercentile: number;
      openingPercentile: number;
    }[];
  }[]
> {
  const colleges = await prisma.college.findMany({
    where: { id: { in: collegeIds } },
    include: {
      cutoffs: {
        include: { branch: true },
        orderBy: [{ year: "desc" }, { capRound: "desc" }],
        take: 30,
      },
    },
  });

  return colleges.map((c) => ({
    college: {
      id: c.id,
      name: c.name,
      slug: c.slug,
      city: c.city,
      fees: c.fees,
      naacGrade: c.naacGrade,
      nirfRank: c.nirfRank,
    },
    cutoffs: c.cutoffs.map((cut) => ({
      year: cut.year,
      capRound: cut.capRound,
      category: cut.category,
      branchName: cut.branch.name,
      closingPercentile: cut.closingPercentile,
      openingPercentile: cut.openingPercentile,
    })),
  }));
}
