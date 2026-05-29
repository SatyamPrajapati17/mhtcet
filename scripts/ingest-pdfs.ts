import { PrismaClient } from "@prisma/client";
import { parseAllPDFs } from "../src/lib/pdf-parser";
import { slugify } from "../src/lib/utils";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const pdfDir = process.cwd();

  console.log("=== MHT CET PDF Data Ingestion ===\n");

  // Parse all PDFs
  const { cutoffs, colleges: collegeMap, branches: branchMap } = await parseAllPDFs(pdfDir);

  console.log(`\n=== PARSING SUMMARY ===`);
  console.log(`Total records parsed: ${cutoffs.length}`);
  console.log(`Unique colleges: ${collegeMap.size}`);
  console.log(`Unique branches: ${branchMap.size}`);

  // Check unique categories
  const catSet = new Set(cutoffs.map(c => c.category));
  console.log(`Unique categories: ${[...catSet].sort().join(", ")}`);

  if (cutoffs.length === 0) {
    console.error("No cutoff records found. Aborting ingestion.");
    process.exit(1);
  }

  // Clear existing data
  console.log("\nClearing existing data...");
  await prisma.cutoff.deleteMany();
  await prisma.seatMatrix.deleteMany();
  await prisma.college.deleteMany();
  await prisma.branch.deleteMany();
  console.log("Existing data cleared.");

  // Insert colleges
  console.log("\nInserting colleges...");
  const collegeRecords: Record<string, string> = {};
  const usedSlugs = new Set<string>();
  let collegeInsertCount = 0;

  for (const [code, info] of collegeMap) {
    let slug = slugify(`${code}-${info.name}`);
    let suffix = 1;
    const originalSlug = slug;
    while (usedSlugs.has(slug)) {
      slug = `${originalSlug}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(slug);

    const college = await prisma.college.create({
      data: {
        code,
        name: info.name,
        slug,
        city: info.name.split(",").pop()?.trim() || "",
      },
    });
    collegeRecords[code] = college.id;
    collegeInsertCount++;
  }
  console.log(`Inserted ${collegeInsertCount} colleges`);

  // Insert branches
  console.log("\nInserting branches...");
  const branchRecords: Record<string, string> = {};
  let branchInsertCount = 0;

  for (const [code, info] of branchMap) {
    const existing = await prisma.branch.findUnique({ where: { code } });
    if (!existing) {
      const branch = await prisma.branch.create({
        data: { code, name: info.name },
      });
      branchRecords[code] = branch.id;
      branchInsertCount++;
    } else {
      branchRecords[code] = existing.id;
    }
  }
  console.log(`Processed ${branchInsertCount} new branches (${Object.keys(branchRecords).length} total)`);

  // Insert cutoffs in batches
  console.log("\nInserting cutoffs...");
  const BATCH_SIZE = 1000;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < cutoffs.length; i += BATCH_SIZE) {
    const batch = cutoffs.slice(i, i + BATCH_SIZE);
    const records: any[] = [];

    for (const cut of batch) {
      const collegeId = collegeRecords[cut.collegeCode];
      const branchId = branchRecords[cut.branchCode];

      if (!collegeId || !branchId) {
        errors++;
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
      await prisma.cutoff.createMany({ data: records });
      inserted += records.length;
    }

    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`  Progress: ${inserted}/${cutoffs.length} records inserted`);
    }
  }

  console.log(`\n=== INGESTION COMPLETE ===`);
  console.log(`Records inserted: ${inserted}`);
  console.log(`Errors: ${errors}`);
  console.log(`Colleges: ${collegeInsertCount}`);
  console.log(`Branches: ${branchInsertCount}`);
  console.log(`Years: 2022, 2023, 2024`);
  console.log(`CAP Rounds: 1, 2, 3`);
}

main()
  .catch((e) => {
    console.error("Fatal error during ingestion:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
