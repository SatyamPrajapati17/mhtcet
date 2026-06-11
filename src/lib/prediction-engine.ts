import { prisma } from "./prisma";

export type PredictionInput = {
  percentile: number;
  marks?: number;
  category: string;
  gender?: string;
  homeUniversity?: string;
  tfws?: boolean;
  minority?: boolean;
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

// Mapping of parent cities to their known suburbs/areas
// When a user selects a parent city, also search its suburbs
const CITY_SUBURBS: Record<string, string[]> = {
  "Navi Mumbai": ["Panvel", "Vashi", "Nerul", "Airoli", "Ghansoli", "Belapur", "Kharghar", "Kamothe", "Kalamboli", "New Panvel"],
  "Mumbai": ["Andheri", "Bhayander", "Bhiwandi", "Kandivali", "Matunga", "Boisar", "Palghar"],
  "Pune": ["Pimpri", "Chinchwad", "Haveli", "Pisoli", "Ravet", "Sasewadi", "Talegaon", "Wagholi", "Avasari Khurd"],
  "Sangli": ["Miraj"],
  "Amravati": ["Badnera", "Shegaon"],
  "Nashik": ["Nepti", "Nashik", "Nadurbar"],
  "Kalyan": ["Dombivli", "Ulhasnagar"],
  "Kolhapur": ["Ichalkaranji", "Panhala"],
  "Solapur": ["Barshi"],
  "Nagpur": ["Ramtek", "Wardha"],
};

// Build reverse lookup: suburb → parent city
const SUBURB_TO_PARENT: Record<string, string> = {};
for (const [parent, suburbs] of Object.entries(CITY_SUBURBS)) {
  for (const suburb of suburbs) {
    SUBURB_TO_PARENT[suburb.toLowerCase()] = parent.toLowerCase();
  }
}

// Cache for the category variants mapping
let categoryVariantsCache: Promise<Map<string, string[]>> | null = null;

/**
 * Build a mapping from any category to all its seat-level variants.
 * 
 * Categories in the DB follow pattern: {prefix}{base}{seat_level}
 * where seat_level ∈ {S (State), H (Home University), O (Other)}
 * 
 * E.g., "GOPENS" → ["GOPENS", "GOPENH", "GOPENO"]
 *       "GSCS"  → ["GSCS", "GSCH", "GSCO"]
 *       "TFWS"  → ["TFWS"] (no seat-level variants)
 */
async function buildCategoryVariants(): Promise<Map<string, string[]>> {
  // Fetch all categories (avoid Prisma distinct issues, deduplicate in JS)
  const rows = await prisma.cutoff.findMany({
    select: { category: true },
  });

  const seen = new Set<string>();
  const allCategories = rows
    .map((r) => r.category)
    .filter((cat) => {
      if (seen.has(cat)) return false;
      seen.add(cat);
      return true;
    });
  
  const groups = new Map<string, string[]>();

  // Group by base category (strip trailing S/H/O if applicable)
  for (const cat of allCategories) {
    const lastChar = cat.slice(-1);
    const base =
      lastChar === "S" || lastChar === "H" || lastChar === "O"
        ? cat.slice(0, -1)
        : cat;
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base)!.push(cat);
  }

  const result = new Map<string, string[]>();

  for (const [base, variants] of groups) {
    if (variants.length >= 2 && base.length >= 4) {
      // This has seat-level variants - map each variant to ALL variants
      for (const v of variants) {
        result.set(v, variants);
      }
    } else {
      // Single variant - no expansion
      for (const v of variants) {
        result.set(v, [v]);
      }
    }
  }

  return result;
}

async function getCategoryVariants(category: string): Promise<string[]> {
  if (!categoryVariantsCache) {
    categoryVariantsCache = buildCategoryVariants();
  }
  const map = await categoryVariantsCache;
  return map.get(category) || [category];
}

/**
 * Calculate prediction score based on user percentile vs cutoff data.
 *
 * The CSV data stores a single rank/percentile per row, so opening === closing
 * for every record. We use proximity-based scoring:
 * - If >= closing percentile => Safe (you beat the cutoff, score 80-100)
 * - If within ~2% below => Moderate (close, might get in, score 60-80)
 * - If within ~5% below => Dream (worth a shot, score 25-50)
 * - Otherwise => No Chance (score 0-15)
 */
function calculateScore(
  percentile: number,
  closingPercentile: number,
  _openingPercentile: number
): number {
  const gap = closingPercentile - percentile;

  if (gap <= 0) {
    // At or above cutoff => Safe
    // Higher score when cutoff is closest to user's percentile (most relevant)
    // gap is negative here, so closing - percentile < 0 means user is above
    // e.g., gap=-0.4 => score=99.6, gap=-80 => score=80
    return Math.max(80, 100 + gap);
  } else if (gap <= 2) {
    // Within 2% below cutoff => Moderate
    return 60 + (1 - gap / 2) * 20;
  } else if (gap <= 5) {
    // Within 2-5% below cutoff => Dream
    return 25 + (1 - (gap - 2) / 3) * 25;
  } else {
    // More than 5% below cutoff => No Chance
    return Math.max(0, 15 - (gap - 5) * 3);
  }
}

function classifyLevel(score: number): "dream" | "moderate" | "safe" | "no-chance" {
  if (score >= 75) return "safe";
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
    inputGender: string | null;
    year: number;
    capRound: number;
    availableYears?: number[];
  };
}> {
  const year = input.year || 2024;
  const capRound = input.capRound || 0;  // 0 means all rounds
  const category = input.category || "GOPENS";

  // Build category filter: expand selected category to all seat-level variants
  // e.g., "GOPENS" → ["GOPENS", "GOPENH", "GOPENO"]
  const categoriesToMatch = await getCategoryVariants(category);

  // If user is Female, also include the Ladies variant (e.g., "GOPENS" -> also include "LOPENS")
  if (input.gender === "Female" && category.startsWith("G")) {
    const ladiesCategory = "L" + category.slice(1);
    if (ladiesCategory !== category) {
      const ladiesVariants = await getCategoryVariants(ladiesCategory);
      for (const v of ladiesVariants) {
        if (!categoriesToMatch.includes(v)) {
          categoriesToMatch.push(v);
        }
      }
    }
  }

  // If TFWS is checked, also include TFWS category
  if (input.tfws) {
    const tfwsVariants = await getCategoryVariants("TFWS");
    for (const v of tfwsVariants) {
      if (!categoriesToMatch.includes(v)) {
        categoriesToMatch.push(v);
      }
    }
  }

  // If minority is checked, also include MI (Minority Institute) category
  if (input.minority) {
    if (!categoriesToMatch.includes("MI")) {
      categoriesToMatch.push("MI");
    }
  }

  // Build the where clause - if capRound is 0, fetch all rounds
  const whereClause: any = {
    year,
    category: {
      in: categoriesToMatch,
    },
  };
  if (capRound > 0) {
    whereClause.capRound = capRound;
  }

  const cutoffRows = await prisma.cutoff.findMany({
    where: whereClause,
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
    // Deduplicate: same college + branch + category may have multiple stages (I, II)
    // Keep only the first occurrence (highest closingPercentile due to ORDER BY)
    const key = `${row.collegeId}-${row.branchId}-${row.category}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const score = calculateScore(
      input.percentile,
      row.closingPercentile,
      row.openingPercentile
    );
    const level = classifyLevel(score);

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

    // Apply city filter with suburb expansion
    // If user selected "Navi Mumbai", also match colleges in "Panvel", "Vashi", etc.
    if (input.city) {
      const userCity = input.city.toLowerCase();
      const collegeCity = row.college.city.toLowerCase();
      
      // Direct match or college city is a known suburb of selected city
      const isMatchingCity =
        collegeCity === userCity ||
        SUBURB_TO_PARENT[collegeCity] === userCity ||
        // Also check if college city is listed as a suburb of the selected city
        (CITY_SUBURBS[input.city] &&
          CITY_SUBURBS[input.city].some(
            (s) => s.toLowerCase() === collegeCity
          ));
      
      if (!isMatchingCity) {
        continue;
      }
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

  // If no results, check which years have data for this category
  // so the UI can show a helpful message
  let availableYears: number[] = [];
  if (results.length === 0) {
    // Fetch available years (avoid Prisma distinct issues)
    const yearRows = await prisma.cutoff.findMany({
      where: {
        category: { in: categoriesToMatch },
      },
      select: { year: true },
    });
    const yearSet = new Set(yearRows.map((r) => r.year));
    availableYears = [...yearSet].sort((a, b) => a - b);
  }

  return {
    safe,
    moderate,
    dream,
    noChance,
    metadata: {
      totalPredictions: results.length,
      inputPercentile: input.percentile,
      inputCategory: category,
      inputGender: input.gender || null,
      year,
      capRound,
      availableYears,
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
