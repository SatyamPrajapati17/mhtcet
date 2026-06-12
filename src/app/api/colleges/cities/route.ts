import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Suburb to Parent City Mapping ───
// Same mapping used in prediction-engine.ts for city filter expansion
// Suburbs/areas are mapped to their parent cities so "Andheri" shows as "Mumbai"
const CITY_SUBURBS: Record<string, string[]> = {
  "Navi Mumbai": ["Panvel", "Vashi", "Nerul", "Airoli", "Ghansoli", "Belapur", "Kharghar", "Kamothe", "Kalamboli", "New Panvel"],
  "Mumbai": ["Andheri", "Bhayander", "Bhiwandi", "Kandivali", "Matunga", "Boisar", "Palghar"],
  "Pune": ["Pimpri", "Chinchwad", "Haveli", "Pisoli", "Ravet", "Sasewadi", "Talegaon", "Wagholi", "Avasari Khurd"],
  "Sangli": ["Miraj"],
  "Amravati": ["Badnera", "Shegaon"],
  "Nashik": ["Nepti", "Nadurbar"],
  "Kalyan": ["Dombivli", "Ulhasnagar", "Ambernath", "Badlapur"],
  "Kolhapur": ["Ichalkaranji", "Panhala"],
  "Solapur": ["Barshi"],
  "Nagpur": ["Ramtek", "Wardha"],
};

// Build reverse lookup: suburb (lowercased) → parent city
const SUBURB_TO_PARENT: Record<string, string> = {};
for (const [parent, suburbs] of Object.entries(CITY_SUBURBS)) {
  for (const suburb of suburbs) {
    SUBURB_TO_PARENT[suburb.toLowerCase()] = parent;
  }
}

// Known institution substrings to filter out
const BAD_CITY_PATTERNS = [
  /^\d+$/,                     // Pure numbers
  /^(dist|district|tal|taluk|tq|tehsil)\b/i,  // District/Tehsil prefixes
  /\binstitute\b/i,            // Contains "institute"
  /\bcollege\b/i,              // Contains "college"
  /\buniversity\b/i,           // Contains "university"
  /\bcampus\b/i,               // Contains "campus"
  /\bengineering\b/i,          // Contains "engineering"
  /\btechnology\b/i,           // Contains "technology"
  /\bgroup\s+of\b/i,           // "Group of" institutions
  /\bmanagement\b/i,           // Contains "management"
  /\bacademy\b/i,              // Contains "academy"
  /\beducation\b/i,            // Contains "education"
  /\bsociety\b/i,              // Contains "society"
  /\btrust\b/i,                // Contains "trust"
  /\bschool\b/i,               // Contains "school"
  /\bcentre\b/i,               // Contains "centre"
  /\bcenter\b/i,               // Contains "center"
];

function isCleanCity(city: string): boolean {
  if (!city || city.trim().length === 0) return false;
  return !BAD_CITY_PATTERNS.some((pattern) => pattern.test(city));
}

export async function GET() {
  try {
    const colleges = await prisma.college.findMany({
      where: { city: { not: "" } },
      select: { city: true },
      orderBy: { city: "asc" },
    });

    // Get all unique city names
    const cities = [...new Set(colleges.map((c) => c.city))];

    // Step 1: Filter out bad patterns
    const cleanCities = cities.filter(isCleanCity);

    // Step 2: Normalize suburbs to their parent cities
    // e.g., "Andheri" → "Mumbai", "Panvel" → "Navi Mumbai"
    const normalized = cleanCities.map((city) => {
      const lower = city.toLowerCase();
      const parent = SUBURB_TO_PARENT[lower];
      return parent || city; // Map to parent city, or keep as-is
    });

    // Step 3: Deduplicate after normalization
    const uniqueCities = [...new Set(normalized)].sort();

    return NextResponse.json({ cities: uniqueCities });
  } catch (error) {
    console.error("Cities fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
