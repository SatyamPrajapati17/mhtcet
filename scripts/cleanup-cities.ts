import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Title case helper
function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/[\s/]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Known city name variants mapped to canonical names
const KNOWN_CITIES = new Set([
  "mumbai", "pune", "nagpur", "thane", "nashik", "aurangabad",
  "solapur", "kolhapur", "amravati", "akola", "dhule", "jalgaon",
  "latur", "sangli", "satara", "wardha", "yavatmal", "ratnagiri",
  "nanded", "parbhani", "hingoli", "beed", "jalna", "buldhana",
  "washim", "bhandara", "gondia", "chandrapur", "gadchiroli",
  "nandurbar", "palghar", "ahmednagar", "osmanabad", "sindhudurg",
  "raigad", "karad", "baramati", "pimpri", "chinchwad", "shegaon",
  "kopargaon", "nerul", "andheri", "kandivali", "matunga",
  "vashi", "ghansoli", "belapur", "airoli", "panvel", "kalyan",
  "dombivli", "ulhasnagar", "badlapur", "ambarnath", "bhiwandi",
  "vasai", "virar",  "navi mumbai", "barsi", "ichalkaranji",
  "sindhi", "bhayander", "pandharpur",
  "ambernath", "kharghar", "kamothe", "kalamboli",
]);

// Institution name patterns that are NOT cities
const INSTITUTION_PATTERNS = [
  /^sanjay\s+ghodawat/i,
  /institute/i,
  /college/i,
  /university/i,
  /technology/i,
  /engineering/i,
  /academy/i,
  /school/i,
  /sanstha/i,
  /vidyalaya/i,
  /mahavidyalaya/i,
];

function extractCity(raw: string): string {
  const s = raw.trim();
  if (!s) return "";

  // Direct known city
  const lower = s.toLowerCase();
  if (KNOWN_CITIES.has(lower)) return toTitleCase(s);

  // Strip trailing period
  let cleaned = s.replace(/\.+$/, "").trim();

  // Handle "Dist X" pattern
  const distMatch = cleaned.match(
    /^(?:dist\.?\s*|district\s+)(.+)$/i
  );
  if (distMatch) {
    const extracted = distMatch[1].trim();
    const extLower = extracted.toLowerCase();
    if (KNOWN_CITIES.has(extLower)) return toTitleCase(extracted);
  }

  // Handle "Tal X" or "Tal. X" pattern  
  const talMatch = cleaned.match(/^tal\.?\s+(.+)$/i);
  if (talMatch) {
    const extracted = talMatch[1].trim();
    const extLower = extracted.toLowerCase();
    if (KNOWN_CITIES.has(extLower)) return toTitleCase(extracted);
  }

  // Handle "X Dist Y" pattern (city name followed by district)
  const distSuffixMatch = cleaned.match(
    /^(.+?)\s+dist(?:rict)?\.?\s+.+$/i
  );
  if (distSuffixMatch) {
    const extracted = distSuffixMatch[1].trim();
    const extLower = extracted.toLowerCase();
    if (KNOWN_CITIES.has(extLower)) return toTitleCase(extracted);
  }

  // Handle "X Tal Y Dist Z" full address
  const complexMatch = cleaned.match(
    /^(.+?)\s+tal\.?\s+.+$/i
  );
  if (complexMatch) {
    const extracted = complexMatch[1].trim();
    const extLower = extracted.toLowerCase();
    if (KNOWN_CITIES.has(extLower)) return toTitleCase(extracted);
  }

  // Handle institution names that contain known cities
  for (const city of KNOWN_CITIES) {
    if (lower.includes(city)) {
      return toTitleCase(city);
    }
  }

  // If it has a comma, take last part (city after comma)
  if (cleaned.includes(",")) {
    const parts = cleaned.split(",").map((p) => p.trim());
    const last = parts[parts.length - 1];
    const lastLower = last.toLowerCase();
    if (KNOWN_CITIES.has(lastLower)) return toTitleCase(last);
  }

  // Pure numbers = garbage
  if (/^\d+$/.test(cleaned)) return "";

  // Contains "Taluk" or similar = garbage
  if (/taluk|tq|tehsil/i.test(cleaned)) return "";

  // Institution name = garbage
  for (const pattern of INSTITUTION_PATTERNS) {
    if (pattern.test(cleaned)) return "";
  }

  return toTitleCase(cleaned);
}

async function main() {
  console.log("=".repeat(50));
  console.log("🏙️  CITY DATA CLEANUP (v2)");
  console.log("=".repeat(50));

  const colleges = await prisma.college.findMany({
    select: { id: true, name: true, city: true },
  });

  let fixed = 0;
  let emptied = 0;
  let skipped = 0;
  const changes: Array<{ name: string; old: string; newCity: string }> = [];

  for (const college of colleges) {
    const oldCity = college.city || "";
    if (!oldCity.trim()) {
      skipped++;
      continue;
    }

    const newCity = extractCity(oldCity);
    if (newCity !== oldCity) {
      if (newCity === "") {
        emptied++;
      } else {
        fixed++;
      }
      changes.push({ name: college.name, old: oldCity, newCity: newCity || "(empty)" });

      await prisma.college.update({
        where: { id: college.id },
        data: { city: newCity },
      });
    }
  }

  console.log(`\n📋 CHANGES (${changes.length} total):`);
  for (const ch of changes) {
    const marker = ch.newCity === "(empty)" ? "🗑️" : "✅";
    console.log(`   ${marker} "${ch.old}" → "${ch.newCity}"`);
  }

  console.log(`\n✅  COMPLETE:`);
  console.log(`   Fixed:  ${fixed}`);
  console.log(`   Emptied: ${emptied}`);
  console.log(`   Skipped: ${skipped}`);

  // Final unique city list
  const cities = await prisma.college.findMany({
    where: { city: { not: "" } },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  console.log(`\n📊 Unique cities after cleanup: ${cities.length}`);
  for (const c of cities) {
    const cnt = await prisma.college.count({ where: { city: c.city } });
    console.log(`   ${c.city.padEnd(20)} ${cnt} colleges`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
