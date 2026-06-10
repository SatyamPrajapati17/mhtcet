import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Strip leading zeros from a code string */
function stripLeadingZeros(code: string): string {
  const stripped = code.replace(/^0+/, "");
  return stripped || code; // if all zeros, return original
}

/**
 * Simple CSV line parser that handles quoted fields.
 * Splits a single CSV line into an array of field values.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Read a CSV file and return all rows as arrays of field values.
 * Skips the header row.
 */
function readCSVRows(filePath: string): { header: string[]; rows: string[][] } {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  // Filter out completely empty lines
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

  if (nonEmptyLines.length === 0) {
    return { header: [], rows: [] };
  }

  const header = parseCSVLine(nonEmptyLines[0]);
  const rows: string[][] = [];

  for (let i = 1; i < nonEmptyLines.length; i++) {
    const fields = parseCSVLine(nonEmptyLines[i]);
    if (fields.length >= header.length) {
      rows.push(fields);
    }
  }

  return { header, rows };
}

// ─── Data Structures ────────────────────────────────────────────────────────

interface Record_2022_2023 {
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  year: number;
  capRound: number;
  category: string;
  stage: string;
  rank: number;
  percentile: number;
  seatLevel: string;
}

interface Record_2024 {
  capRound: number;
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  category: string;
  rank: number;
  percentile: number;
  seatLevel: string;
  statusType: string;
}

type ParsedRecord = Record_2022_2023 | Record_2024;

// ─── File Processing ────────────────────────────────────────────────────────

function detectFormat(header: string[]): "2022" | "2024" | "unknown" {
  const h = header.join(",");
  if (h.includes("collegeCode") && h.includes("collegeName") && h.includes("branchCode")) {
    return "2022";
  }
  if (h.includes("CAP_Round") && h.includes("Institute_Code") && h.includes("Course_Code")) {
    return "2024";
  }
  // Try heuristic: if first field contains "CAP" it's likely 2024
  if (header[0]?.includes("CAP")) {
    return "2024";
  }
  return "unknown";
}

function parse2022Rows(rows: string[][]): Record_2022_2023[] {
  return rows.map((f) => ({
    collegeCode: f[0],
    collegeName: f[1],
    branchCode: f[2],
    branchName: f[3],
    year: parseInt(f[4], 10),
    capRound: parseInt(f[5], 10),
    category: f[6],
    stage: f[7],
    rank: parseInt(f[8], 10),
    percentile: parseFloat(f[9]),
    seatLevel: f[10] || "",
  }));
}

function parse2024Rows(rows: string[][]): Record_2024[] {
  const result: Record_2024[] = [];
  for (const f of rows) {
    // f[0] = CAP_Round (e.g. "CAP1"), f[1] = Institute_Code, f[2] = Institute_Name,
    // f[3] = Course_Code, f[4] = Course_Name, f[5] = Category,
    // f[6] = Merit_No, f[7] = Percentile, f[8] = Section, f[9] = Status_Type, f[10] = Page_No
    const capRoundStr = f[0] || "";
    const capRound = parseInt(capRoundStr.replace("CAP", ""), 10) || 0;

    const collegeCode = stripLeadingZeros(f[1] || "");
    const collegeName = f[2] || "";
    const branchCode = stripLeadingZeros(f[3] || "");
    const branchName = f[4] || "";
    const category = f[5] || "";
    const rank = parseInt(f[6], 10) || 0;
    const percentile = parseFloat(f[7]) || 0;
    const section = f[8] || "";
    const statusType = f[9] || "";

    if (collegeCode && branchCode && category && rank > 0) {
      result.push({
        capRound,
        collegeCode,
        collegeName,
        branchCode,
        branchName,
        category,
        rank,
        percentile,
        seatLevel: section,
        statusType,
      });
    }
  }
  return result;
}

function processFile(filePath: string): {
  records: ParsedRecord[];
  count: number;
  fileName: string;
} {
  const fileName = path.basename(filePath);
  process.stdout.write(`  📖 Reading ${fileName}... `);

  const { header, rows } = readCSVRows(filePath);
  const format = detectFormat(header);

  let records: ParsedRecord[] = [];
  if (format === "2022") {
    records = parse2022Rows(rows);
  } else if (format === "2024") {
    records = parse2024Rows(rows);
  } else {
    console.log(`⚠️  Unknown format, skipping`);
    return { records: [], count: 0, fileName };
  }

  console.log(`${records.length} rows`);
  return { records, count: records.length, fileName };
}

// ─── DB Ingestion ───────────────────────────────────────────────────────────

interface NormalizedCutoff {
  year: number;
  capRound: number;
  stage: string;
  collegeCode: string;
  collegeName: string;
  branchCode: string;
  branchName: string;
  category: string;
  rank: number;
  percentile: number;
  seatLevel: string;
}

function normalizeRecords(records: ParsedRecord[]): NormalizedCutoff[] {
  return records.map((r) => {
    if ("year" in r) {
      // 2022/2023 format
      return {
        year: r.year,
        capRound: r.capRound,
        stage: r.stage,
        collegeCode: r.collegeCode,
        collegeName: r.collegeName,
        branchCode: r.branchCode,
        branchName: r.branchName,
        category: r.category,
        rank: r.rank,
        percentile: r.percentile,
        seatLevel: r.seatLevel,
      };
    } else {
      // 2024 format — no stage column, default to empty
      return {
        year: 2024,
        capRound: r.capRound,
        stage: "",
        collegeCode: r.collegeCode,
        collegeName: r.collegeName,
        branchCode: r.branchCode,
        branchName: r.branchName,
        category: r.category,
        rank: r.rank,
        percentile: r.percentile,
        seatLevel: r.seatLevel,
      };
    }
  });
}

async function ingestToDatabase(cutoffs: NormalizedCutoff[]) {
  console.log("\n🏛️  Upserting colleges...");

  // Collect unique colleges
  const collegeMap = new Map<string, { code: string; name: string }>();
  for (const c of cutoffs) {
    if (!collegeMap.has(c.collegeCode)) {
      collegeMap.set(c.collegeCode, { code: c.collegeCode, name: c.collegeName });
    }
  }
  console.log(`   Found ${collegeMap.size} unique colleges`);

  const collegeIdMap = new Map<string, string>();
  const usedSlugs = new Set<string>();
  let collegeCount = 0;

  for (const [code, info] of collegeMap) {
    let slug = slugify(`${code}-${info.name}`);

    // Ensure slug uniqueness (in case of name collision)
    let suffix = 1;
    const originalSlug = slug;
    while (usedSlugs.has(slug)) {
      slug = `${originalSlug}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(slug);

    // Try to find by code first (code is not @unique, but should be unique in practice)
    let college = await prisma.college.findFirst({ where: { code } });

    if (college) {
      // Update existing college — use its existing ID
      college = await prisma.college.update({
        where: { id: college.id },
        data: {
          name: info.name,
          slug,
          city: info.name.split(",").pop()?.trim() || "",
        },
      });
    } else {
      // Create new college
      college = await prisma.college.create({
        data: {
          code,
          name: info.name,
          slug,
          city: info.name.split(",").pop()?.trim() || "",
        },
      });
    }

    collegeIdMap.set(code, college.id);
    collegeCount++;
  }
  console.log(`   Upserted ${collegeCount} colleges`);

  // Also handle colleges that might already be in DB but not in CSV
  const existingColleges = await prisma.college.findMany({ select: { id: true, code: true } });
  for (const ec of existingColleges) {
    if (!collegeIdMap.has(ec.code)) {
      collegeIdMap.set(ec.code, ec.id);
    }
  }

  console.log("\n📚  Upserting branches...");
  const branchMap = new Map<string, { code: string; name: string }>();
  for (const c of cutoffs) {
    if (!branchMap.has(c.branchCode)) {
      branchMap.set(c.branchCode, { code: c.branchCode, name: c.branchName });
    }
  }
  console.log(`   Found ${branchMap.size} unique branches`);

  const branchIdMap = new Map<string, string>();
  let branchCount = 0;

  for (const [code, info] of branchMap) {
    const branch = await prisma.branch.upsert({
      where: { code },
      update: { name: info.name },
      create: { code, name: info.name },
    });
    branchIdMap.set(code, branch.id);
    branchCount++;
  }
  console.log(`   Upserted ${branchCount} branches`);

  // Also handle existing branches not in CSV
  const existingBranches = await prisma.branch.findMany({ select: { id: true, code: true } });
  for (const eb of existingBranches) {
    if (!branchIdMap.has(eb.code)) {
      branchIdMap.set(eb.code, eb.id);
    }
  }

  // Cutoff model lacks a unique constraint (only `id` is unique), so upsert isn't usable.
  // Instead, delete all and re-insert fresh — same effect as upsert on re-run.
  // The skipDuplicates: true flag on createMany provides an extra safety net.
  console.log("\n🗑️  Clearing existing cutoffs...");
  const deleted = await prisma.cutoff.deleteMany();
  console.log(`   Deleted ${deleted.count} existing cutoff records`);

  console.log("\n📊  Inserting cutoffs in batches of 500...");
  const BATCH_SIZE = 500;
  let inserted = 0;
  let errors = 0;
  let skipped = 0;

  for (let i = 0; i < cutoffs.length; i += BATCH_SIZE) {
    const batch = cutoffs.slice(i, i + BATCH_SIZE);
    const records: Array<{
      year: number;
      capRound: number;
      stage: string;
      collegeId: string;
      branchId: string;
      category: string;
      openingRank: number;
      closingRank: number;
      openingPercentile: number;
      closingPercentile: number;
    }> = [];

    for (const cut of batch) {
      const collegeId = collegeIdMap.get(cut.collegeCode);
      const branchId = branchIdMap.get(cut.branchCode);

      if (!collegeId || !branchId) {
        skipped++;
        continue;
      }

      records.push({
        year: cut.year,
        capRound: cut.capRound,
        stage: cut.stage,
        collegeId,
        branchId,
        category: cut.category,
        openingRank: cut.rank,
        closingRank: cut.rank,
        openingPercentile: cut.percentile,
        closingPercentile: cut.percentile,
      });
    }

    if (records.length > 0) {
      try {
        await prisma.cutoff.createMany({
          data: records,
          skipDuplicates: true,
        });
        inserted += records.length;
      } catch (e: any) {
        console.error(`   ❌ Batch error at ${i}: ${e.message?.substring(0, 200)}`);
        errors += records.length;
      }
    }

    if ((i / BATCH_SIZE) % 10 === 0 && i > 0) {
      process.stdout.write(`      ${inserted}/${cutoffs.length} records...\n`);
    }
  }

  // Final verification
  const totalInDB = await prisma.cutoff.count();

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📤  Upload complete — ${inserted} rows inserted`);
  console.log(`✅  INGESTION COMPLETE!`);
  console.log(`${"=".repeat(50)}`);
  console.log(`   Total records from CSVs:   ${cutoffs.length}`);
  console.log(`   Colleges upserted:         ${collegeCount}`);
  console.log(`   Branches upserted:         ${branchCount}`);
  console.log(`   Cutoffs inserted:          ${inserted}`);
  console.log(`   Skipped (no match):        ${skipped}`);
  console.log(`   Errors:                    ${errors}`);
  console.log(`   Total cutoffs in DB:       ${totalInDB}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(50));
  console.log("📁  CET CUTOFF CSV INGESTION");
  console.log("=".repeat(50));

  // Verify DB connection
  try {
    await prisma.$connect();
    console.log("✅  Database connected\n");
  } catch (e: any) {
    console.error("❌  Database connection failed:", e.message);
    console.log("   Make sure DATABASE_URL and DIRECT_URL are set in .env");
    process.exit(1);
  }

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

  console.log("📂  Processing CSV files...\n");

  let totalRows = 0;
  let fileCount = 0;
  let allRecords: ParsedRecord[] = [];

  for (const file of csvFiles) {
    const filePath = path.join(csvDir, file);

    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found: ${file}, skipping`);
      continue;
    }

    const result = processFile(filePath);
    if (result.count > 0) {
      totalRows += result.count;
      fileCount++;
      allRecords.push(...result.records);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊  CSV EXTRACTION SUMMARY`);
  console.log(`${"=".repeat(50)}`);
  console.log(`   Files processed:    ${fileCount}/7`);
  console.log(`   Total rows parsed:  ${totalRows}`);
  console.log(`   Total records:      ${allRecords.length}`);

  if (allRecords.length === 0) {
    console.log("\n⚠️  No records found. Nothing to ingest.");
    await prisma.$disconnect();
    return;
  }

  const normalized = normalizeRecords(allRecords);
  console.log(`\n   Normalized records: ${normalized.length}`);

  await ingestToDatabase(normalized);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("\n❌  Fatal error:", e);
  process.exit(1);
});
