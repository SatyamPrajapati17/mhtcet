import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Branch Name Normalization ───
// Map of raw branch names → canonical names to merge duplicates
const BRANCH_NAME_ALIASES: Record<string, string> = {
  // Agriculture variant
  "Agriculture Engineering": "Agricultural Engineering",

  // AI variants (with/without parenthetical AI)
  "Artificial Intelligence (AI) and Data Science": "Artificial Intelligence and Data Science",

  // & vs "and" variants
  "Mechanical & Automation Engineering": "Mechanical and Automation Engineering",

  // Normalize common abbreviations
  "Electronics and Telecommunication Engg": "Electronics and Telecommunication Engineering",
};

// Normalize a branch name by applying alias mapping and standardizing formatting
function normalizeBranchName(name: string): string {
  // Step 1: Check alias mapping first
  const aliased = BRANCH_NAME_ALIASES[name];
  if (aliased) return aliased;

  // Step 2: Fix spacing before parentheses (e.g., "Engineering(Cyber" → "Engineering (Cyber")
  let normalized = name;
  normalized = normalized.replace(/(\w)\(/g, "$1 (");

  // Step 3: Normalize " & " to " and "
  normalized = normalized.replace(/\s*&\s*/g, " and ");

  // Step 4: Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      where: { name: { not: "" } },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    // Normalize names, then deduplicate
    const seen = new Set<string>();
    const uniqueNames = branches
      .map((b) => normalizeBranchName(b.name))
      .filter((name) => {
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .sort();

    return NextResponse.json({ branches: uniqueNames });
  } catch (error) {
    console.error("Branches fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
