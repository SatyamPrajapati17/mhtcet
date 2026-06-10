import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const cities = [...new Set(colleges.map((c) => c.city))];
    const cleanCities = cities.filter(isCleanCity);

    return NextResponse.json({ cities: cleanCities });
  } catch (error) {
    console.error("Cities fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
