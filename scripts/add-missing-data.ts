import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// City normalization map: messy variants → standard district names
const CITY_NORMALIZE: Record<string, string> = {
  "nashik." : "Nashik",
  "nashik": "Nashik",
  "(nashik)": "Nashik",
  "adgaon nashik": "Nashik",
  "aginashik": "Nashik",
  "chincholi dist. nashik": "Nashik",
  "datanagar tal-shirol dist kolhapur": "Kolhapur",
  "dist wardha": "Wardha",
  "dist-pune": "Pune",
  "dist. nandurbar": "Nandurbar",
  "dist.ahmednagar": "Ahmednagar",
  "dist.thane": "Thane",
  "dist thane": "Thane",
  "thane (e)": "Thane",
  "mumbai": "Mumbai",
  "navi mumbai": "Navi Mumbai",
  "kharghar navi mumbai": "Navi Mumbai",
  "new panvel": "Panvel",
  "pune.": "Pune",
  "pune": "Pune",
  "narhe (ambegaon)": "Pune",
  "pisoli": "Pune",
  "wagholi": "Pune",
  "ravet": "Pune",
  "talegaon": "Pune",
  "lonavala": "Pune",
  "sasewadi": "Pune",
  "baramati dist.pune": "Baramati",
  "malegaon-baramati": "Baramati",
  "bota sangamner": "Sangamner",
  "solapur": "Solapur",
  "solapur(north)": "Solapur",
  "kolhapur.": "Kolhapur",
  "kolhapur": "Kolhapur",
  "panhala": "Kolhapur",
  "gadhinglaj": "Gadhinglaj",
  "satara.": "Satara",
  "satara": "Satara",
  "sangli.": "Sangli",
  "sangli": "Sangli",
  "aurangabad": "Aurangabad",
  "amravati": "Amravati",
  "nagpur": "Nagpur",
  "ramtek": "Nagpur",
  "sevagram": "Wardha",
  "ahmednagar": "Ahmednagar",
  "ahmednagar.": "Ahmednagar",
  "akola": "Akola",
  "ambejogai": "Ambejogai",
  "beed": "Beed",
  "bhandara": "Bhandara",
  "bhusawal": "Bhusawal",
  "buldhana": "Buldhana",
  "chandrapur": "Chandrapur",
  "dhule": "Dhule",
  "jalgaon": "Jalgaon",
  "faizpur": "Jalgaon",
  "jalna": "Jalna",
  "kankavli": "Kankavli",
  "karad": "Karad",
  "latur": "Latur",
  "latur.": "Latur",
  "nanded": "Nanded",
  "nanded.": "Nanded",
  "nandurbar": "Nandurbar",
  "osmanabad": "Osmanabad",
  "palghar": "Palghar",
  "parbhani": "Parbhani",
  "ratnagiri": "Ratnagiri",
  "ratnagiri.": "Ratnagiri",
  "sangola": "Sangola",
  "shegaon": "Shegaon",
  "shegaon.": "Shegaon",
  "shirpur": "Shirpur",
  "sindhudurg.": "Sindhudurg",
  "washim": "Washim",
  "yavatmal": "Yavatmal",
  "wardha": "Wardha",
  "lonere": "Lonere",
  "karjat": "Karjat",
  "panvel": "Panvel",
  "vasai": "Vasai",
  "virar": "Virar",
  "badlapur(w)": "Badlapur",
  "bhayinder (e) western rly": "Mumbai",
  "andheri": "Mumbai",
  "boisar": "Boisar",
  "sakoli": "Sakoli",
  "pusad": "Pusad",
  "kopargaon": "Kopargaon",
  "sangamner": "Sangamner",
  "shirgaon": "Shirgaon",
  "tuljapur": "Tuljapur",
  "barsi": "Barshi",
  "pandharpur": "Pandharpur",
  "warananagar": "Warananagar",
  "miraj": "Miraj",
  "ichalkaranji.": "Ichalkaranji",
  "yadrav(ichalkaranji)": "Ichalkaranji",
  "shahapur": "Shahapur",
  "bhor": "Bhor",
  "haveli": "Pune",
  "tal. haveli": "Pune",
  "tal. indapur": "Indapur",
  "khalapur dist raigad": "Khalapur",
  "tal. khalapur. dist. raigad": "Khalapur",
  "raigad.": "Raigad",
  "kuran": "Kuran",
  "nile": "Nile",
  "ambaravati": "Amravati",
  "badravati": "Amravati",
};

// Important Maharashtra districts for the dropdown (in order of prominence)
const IMPORTANT_DISTRICTS = [
  "Mumbai", "Thane", "Pune", "Nashik", "Nagpur", "Aurangabad",
  "Navi Mumbai", "Solapur", "Kolhapur", "Amravati", "Ahmednagar",
  "Jalgaon", "Nanded", "Latur", "Dhule", "Nandurbar",
  "Chandrapur", "Wardha", "Sangli", "Satara", "Ratnagiri",
  "Akola", "Buldhana", "Parbhani", "Beed", "Osmanabad",
  "Jalna", "Palghar", "Raigad", "Sindhudurg", "Yavatmal",
  "Washim", "Hingoli", "Gondia", "Bhandara", "Gadchiroli",
  "Panvel", "Karjat", "Vasai", "Virar", "Badlapur",
  "Shirpur", "Baramati", "Karad", "Kankavli",
];

function normalizeCity(raw: string): string {
  const key = raw.toLowerCase().trim().replace(/\s+/g, " ");
  return CITY_NORMALIZE[key] || raw;
}

async function main() {
  console.log("🔍 Step 1: Parsing CSV to find all data...");
  
  const content = fs.readFileSync("MHTCET_All_CAP_Cutoffs_Combined.csv", "utf-8");
  
  // Parse college headers from CSV
  const collegeRegex = /"(\d{3,5})\s*-\s*(.+?)"/g;
  const csvColleges = new Map<string, { name: string; city: string }>();
  let match;
  while ((match = collegeRegex.exec(content)) !== null) {
    let code = match[1].replace(/^0+/, "") || match[1];
    const name = match[2].trim();
    if (code.length >= 3 && code.length <= 5 && !csvColleges.has(code)) {
      const rawCity = name.includes(",") ? name.split(",").pop()?.trim() || "" : "";
      csvColleges.set(code, { name, city: normalizeCity(rawCity) });
    }
  }
  console.log(`   Parsed ${csvColleges.size} unique colleges from CSV`);

  // Step 2: Get current DB state
  const dbCols = await prisma.college.findMany({ select: { code: true, id: true, city: true } });
  const dbCodes = new Set(dbCols.map(c => c.code));
  const dbColMap = new Map(dbCols.map(c => [c.code, c]));
  const dbBranches = await prisma.branch.findMany({ select: { code: true, id: true } });
  const dbBranchMap = new Map(dbBranches.map(b => [b.code, b.id]));

  console.log(`   DB has ${dbCodes.size} colleges, ${dbBranchMap.size} branches`);

  // Step 3: Add missing colleges
  const missingColleges = [...csvColleges.entries()]
    .filter(([code]) => !dbCodes.has(code))
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  console.log(`\n📚 Step 3: Adding ${missingColleges.length} missing colleges...`);

  const usedSlugs = new Set<string>();
  const existingSlugs = await prisma.college.findMany({ select: { slug: true } });
  existingSlugs.forEach(c => usedSlugs.add(c.slug));

  for (const [code, info] of missingColleges) {
    let slug = info.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 60);
    slug = `${code}-${slug}`;

    let uniqueSlug = slug;
    let suffix = 1;
    while (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(uniqueSlug);

    await prisma.college.create({
      data: {
        code,
        name: info.name,
        slug: uniqueSlug,
        city: info.city,
      },
    });
    console.log(`   ✅ Added ${code} - ${info.name} [${info.city}]`);
  }

  // Step 4: Find and add any missing branches from the cutoff data
  // First, parse all cutoff data from CSV to find branch codes
  console.log(`\n🔬 Step 4: Finding missing branches...`);
  
  // Use the CSV parser to get all cutoff records
  const { parseCSVFile } = require("../src/lib/csv-parser");
  const { cutoffs } = parseCSVFile("MHTCET_All_CAP_Cutoffs_Combined.csv");
  
  // Find branch codes not in DB
  const csvBranchCodes = new Set(cutoffs.map(c => c.branchCode));
  const missingBranchCodes = [...csvBranchCodes].filter(code => !dbBranchMap.has(code));
  
  console.log(`   Found ${missingBranchCodes.length} missing branch codes`);

  if (missingBranchCodes.length > 0) {
    let addedBranches = 0;
    for (const code of missingBranchCodes) {
      // Get the branch name from the first cutoff record with this code
      const cutoff = cutoffs.find(c => c.branchCode === code);
      const name = cutoff?.branchName || "Unknown";
      try {
        await prisma.branch.create({ data: { code, name } });
        dbBranchMap.set(code, (await prisma.branch.findUnique({ where: { code } }))!.id);
        addedBranches++;
      } catch (e: any) {
        console.error(`   ❌ Failed to add branch ${code} - ${name}: ${e.message}`);
      }
    }
    console.log(`   ✅ Added ${addedBranches} new branches`);
  }

  // Step 5: Now insert the missing cutoff records
  console.log(`\n📊 Step 5: Inserting missing cutoff records...`);

  // Refresh maps
  const allColleges = await prisma.college.findMany({ select: { id: true, code: true } });
  const allBranches = await prisma.branch.findMany({ select: { id: true, code: true } });
  const collegeMap = new Map(allColleges.map(c => [c.code, c.id]));
  const branchMap = new Map(allBranches.map(b => [b.code, b.id]));

  const BATCH_SIZE = 500;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < cutoffs.length; i += BATCH_SIZE) {
    const batch = cutoffs.slice(i, i + BATCH_SIZE);
    const records: any[] = [];

    for (const cut of batch) {
      const collegeId = collegeMap.get(cut.collegeCode);
      const branchId = branchMap.get(cut.branchCode);

      if (!collegeId || !branchId) {
        skipped++;
        continue;
      }

      records.push({
        year: cut.year,
        capRound: cut.capRound,
        collegeId,
        branchId,
        category: cut.category,
        stage: cut.stage,
        openingRank: cut.rank,
        closingRank: cut.rank,
        openingPercentile: cut.percentile,
        closingPercentile: cut.percentile,
      });
    }

    if (records.length > 0) {
      try {
        await prisma.cutoff.createMany({ data: records, skipDuplicates: true });
        inserted += records.length;
      } catch (e: any) {
        console.error(`   Batch error at ${i}: ${e.message}`);
      }
    }
  }

  console.log(`   ✅ Inserted: ${inserted}, Skipped: ${skipped}`);

  // Step 6: Clean up city names for ALL colleges
  console.log(`\n🏙️ Step 6: Normalizing city names...`);
  let updated = 0;
  for (const col of dbCols) {
    const normalized = normalizeCity(col.city);
    if (normalized !== col.city) {
      await prisma.college.update({ where: { id: col.id }, data: { city: normalized } });
      updated++;
    }
  }
  // Update newly added colleges' cities too
  const newDbCols = await prisma.college.findMany({ select: { id: true, code: true, city: true } });
  for (const col of newDbCols) {
    const normalized = normalizeCity(col.city);
    if (normalized !== col.city) {
      await prisma.college.update({ where: { id: col.id }, data: { city: normalized } });
      updated++;
    }
  }
  console.log(`   ✅ Normalized ${updated} city names`);

  // Step 7: Update colleges with empty cities using CSV data
  console.log(`\n🗺️ Step 7: Filling empty cities from CSV data...`);
  let filled = 0;
  const allColsNow = await prisma.college.findMany({ select: { id: true, code: true, city: true } });
  for (const col of allColsNow) {
    if (!col.city) {
      const csvInfo = csvColleges.get(col.code);
      if (csvInfo?.city) {
        await prisma.college.update({ where: { id: col.id }, data: { city: csvInfo.city } });
        filled++;
      }
    }
  }
  console.log(`   ✅ Filled ${filled} empty cities from CSV data`);

  // Summary
  const finalColleges = await prisma.college.count();
  const finalBranches = await prisma.branch.count();
  const finalCutoffs = await prisma.cutoff.count();
  const finalCities = await prisma.college.findMany({
    where: { city: { not: "" } },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  
  console.log(`\n📊 Final Summary:`);
  console.log(`   Colleges: ${finalColleges}`);
  console.log(`   Branches: ${finalBranches}`);
  console.log(`   Cutoffs: ${finalCutoffs}`);
  console.log(`   Clean cities: ${finalCities.length}`);
  console.log(`   Important districts list: ${IMPORTANT_DISTRICTS.length}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
