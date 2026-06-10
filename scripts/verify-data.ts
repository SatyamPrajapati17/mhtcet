import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { fields.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  fields.push(current.trim());
  return fields;
}

async function main() {
  console.log("=".repeat(60));
  console.log("🔍 DATA VERIFICATION: CSV vs DATABASE");
  console.log("=".repeat(60));

  // 1. Database overview
  const totalCutoffs = await prisma.cutoff.count();
  const totalColleges = await prisma.college.count();
  const totalBranches = await prisma.branch.count();
  console.log(`\n📊 DATABASE OVERVIEW:`);
  console.log(`   Colleges: ${totalColleges}`);
  console.log(`   Branches: ${totalBranches}`);
  console.log(`   Cutoffs:  ${totalCutoffs}`);

  // 2. Count by year in database
  const byYearDB = await prisma.cutoff.groupBy({ by: ["year"], _count: true, orderBy: { year: "asc" } });
  console.log(`\n📊 CUTOFFS BY YEAR (DB):`);
  for (const y of byYearDB) {
    console.log(`   ${y.year}: ${y._count}`);
  }

  // 3. Count by year from CSV files
  console.log(`\n📊 COUNTING CSV ROWS BY YEAR:`);
  const csvDir = path.join(process.cwd(), "csv");
  const csvFiles = [
    "2022ENGG_CAP1_CutOff.csv",
    "2022ENGG_CAP2_CutOff.csv",
    "2022ENGG_CAP3_CutOff.csv",
    "2023ENGG_CAP1_CutOff.csv",
    "2023ENGG_CAP2_CutOff.csv",
    "2023ENGG_CAP3_CutOff.csv",
    "2024_CET_Engineering_Cutoff_All.csv",
  ];

  let csvYearCounts: Record<number, number> = {};
  let csvCategoryCounts: Record<string, number> = {};
  let totalCsvRows = 0;

  for (const file of csvFiles) {
    const filePath = path.join(csvDir, file);
    if (!fs.existsSync(filePath)) { console.log(`   ⚠️  Not found: ${file}`); continue; }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/);
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    
    // First line is header
    if (nonEmptyLines.length === 0) continue;
    
    const header = parseCSVLine(nonEmptyLines[0]);
    const is2024Format = header[0]?.includes("CAP") || header[0] === "CAP_Round";
    
    let fileRows = 0;
    let year = 0;
    if (is2024Format) {
      year = 2024;
    } else if (file.includes("2022")) {
      year = 2022;
    } else if (file.includes("2023")) {
      year = 2023;
    }

    for (let i = 1; i < nonEmptyLines.length; i++) {
      const fields = parseCSVLine(nonEmptyLines[i]);
      if (fields.length < 6) continue;

      let category = "";
      if (is2024Format) {
        // 2024: CAP_Round, Institute_Code, Institute_Name, Course_Code, Course_Name, Category, ...
        category = fields[5] || "";
      } else {
        // 2022/2023: collegeCode, collegeName, branchCode, branchName, year, capRound, category, ...
        category = fields[6] || "";
      }

      csvCategoryCounts[category] = (csvCategoryCounts[category] || 0) + 1;
      fileRows++;
      totalCsvRows++;
    }
    
    if (year > 0) {
      csvYearCounts[year] = (csvYearCounts[year] || 0) + fileRows;
    }
    console.log(`   ${file}: ${fileRows} rows${year > 0 ? ` (${year})` : ""}`);
  }

  console.log(`\n📊 YEAR COMPARISON (DB vs CSV):`);
  for (const y of byYearDB) {
    const csv = csvYearCounts[y.year] || 0;
    const diff = y._count - csv;
    const status = diff === 0 ? "✅" : "⚠️";
    console.log(`   ${status} ${y.year}: DB=${y._count}  CSV=${csv}  Diff=${diff >= 0 ? "+" : ""}${diff}`);
  }
  
  // Check for years in CSV not in DB
  for (const [year, count] of Object.entries(csvYearCounts)) {
    if (!byYearDB.find(y => y.year === parseInt(year))) {
      console.log(`   ⚠️  ${year}: 0 in DB, ${count} in CSV`);
    }
  }
  
  const totalCSV = Object.values(csvYearCounts).reduce((a, b) => a + b, 0);
  console.log(`\n   Total: DB=${totalCutoffs}  CSV=${totalCSV}  Match=${totalCutoffs === totalCSV ? "✅" : "⚠️"}`);

  // 4. All categories comparison
  console.log(`\n📊 ALL CATEGORIES (DB vs CSV):`);
  const byCatDB = await prisma.cutoff.groupBy({
    by: ["category"],
    _count: true,
    orderBy: { _count: { category: "desc" } },
  });
  
  let allCategoriesMatch = true;
  for (const c of byCatDB) {
    const csvCount = csvCategoryCounts[c.category] || 0;
    const diff = c._count - csvCount;
    const status = diff === 0 ? "✅" : "⚠️";
    if (diff !== 0) allCategoriesMatch = false;
    console.log(`   ${status} ${c.category.padEnd(10)} DB=${String(c._count).padEnd(7)} CSV=${String(csvCount).padEnd(7)}`);
  }
  
  // Check categories in CSV but not in DB
  console.log(`\n📊 CATEGORIES IN CSV BUT NOT IN DB:`);
  const dbCats = new Set(byCatDB.map(c => c.category));
  let missingCats = 0;
  for (const [cat, count] of Object.entries(csvCategoryCounts).sort((a, b) => b[1] - a[1])) {
    if (!dbCats.has(cat)) {
      console.log(`   ⚠️  ${cat}: ${count} rows in CSV, 0 in DB`);
      missingCats++;
    }
  }
  if (missingCats === 0) console.log(`   ✅ All CSV categories present in DB`);

  // 5. Frontend category check
  const frontendCats = ["GOPENS", "GSCS", "GSTS", "GVJS", "GNT1S", "GNT2S", "GNT3S", "GOBCS", "EWS"];
  console.log(`\n📊 FRONTEND CATEGORY CHECK (DB vs CSV):`);
  for (const cat of frontendCats) {
    const dbCount = await prisma.cutoff.count({ where: { category: cat } });
    const csvCount = csvCategoryCounts[cat] || 0;
    const diff = dbCount - csvCount;
    const status = diff === 0 ? "✅" : "⚠️";
    console.log(`   ${status} ${cat.padEnd(10)} DB=${String(dbCount).padEnd(7)} CSV=${String(csvCount).padEnd(7)}`);
  }

  // 6. Opening vs closing percentile check
  console.log(`\n📊 OPENING vs CLOSING PERCENTILE:`);
  const sample = await prisma.cutoff.findMany({
    take: 10,
    select: { openingPercentile: true, closingPercentile: true, openingRank: true, closingRank: true },
  });
  const allSame = sample.every(r => r.openingPercentile === r.closingPercentile);
  console.log(`   All same (sample of 10): ${allSame}`);
  console.log(`   Sample: ${JSON.stringify(sample.slice(0, 3))}`);
  if (allSame) {
    console.log(`   ℹ️  DB has single values (not ranges) - prediction engine was updated to handle this`);
  }

  // 7. Specific college check
  console.log(`\n📊 SPECIFIC COLLEGE CHECK:`);
  const college = await prisma.college.findFirst({ where: { code: "1002" } });
  if (college) {
    const byYear = await prisma.cutoff.groupBy({
      where: { collegeId: college.id },
      by: ["year", "capRound"],
      _count: true,
      orderBy: [{ year: "asc" }, { capRound: "asc" }],
    });
    console.log(`   GCOE Amravati (${college.name}):`);
    let totalGCOE = 0;
    for (const y of byYear) {
      console.log(`     Year ${y.year} CAP${y.capRound}: ${y._count} records`);
      totalGCOE += y._count;
    }
    console.log(`     Total: ${totalGCOE} records`);
  }

  // Final summary
  const allMatch = totalCutoffs === totalCSV && allCategoriesMatch;
  console.log(`\n${allMatch ? "✅" : "⚠️"} VERDICT: ${allMatch ? "ALL DATA MATCHES" : "DISCREPANCIES FOUND"}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
