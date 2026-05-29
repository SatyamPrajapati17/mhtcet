import { PrismaClient } from "@prisma/client";
import { parseCSVFile } from "../src/lib/csv-parser";
import { slugify } from "../src/lib/utils";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(process.cwd(), "MHTCET_All_CAP_Cutoffs_Combined.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    console.log("Please place the CSV file in the project root directory.");
    process.exit(1);
  }

  console.log("Parsing CSV file...");
  const { cutoffs, colleges: collegeMap, branches: branchMap } = parseCSVFile(csvPath);
  console.log(`Parsed ${cutoffs.length} cutoff records`);
  console.log(`Found ${collegeMap.size} colleges`);
  console.log(`Found ${branchMap.size} branches`);

  // Clear existing data
  console.log("\nClearing existing data...");
  await prisma.cutoff.deleteMany();
  await prisma.seatMatrix.deleteMany();
  await prisma.college.deleteMany();
  await prisma.branch.deleteMany();

  // Insert colleges
  console.log("\nInserting colleges...");
  const collegeRecords: Record<string, string> = {};
  const usedSlugs = new Set<string>();

  for (const [code, info] of collegeMap) {
    let slug = slugify(`${code}-${info.name}`);

    // Ensure slug uniqueness
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
  }
  console.log(`Inserted ${Object.keys(collegeRecords).length} colleges`);

  // Insert branches
  console.log("\nInserting branches...");
  const branchRecords: Record<string, string> = {};
  let branchCount = 0;
  for (const [code, info] of branchMap) {
    const existing = await prisma.branch.findUnique({
      where: { code },
    });
    if (!existing) {
      const branch = await prisma.branch.create({
        data: {
          code,
          name: info.name,
        },
      });
      branchRecords[code] = branch.id;
      branchCount++;
    } else {
      branchRecords[code] = existing.id;
    }
  }
  console.log(`Processed ${branchCount} new branches (${Object.keys(branchRecords).length} total)`);

  // Insert cutoffs in batches
  console.log("\nInserting cutoffs...");
  const BATCH_SIZE = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < cutoffs.length; i += BATCH_SIZE) {
    const batch = cutoffs.slice(i, i + BATCH_SIZE);
    const records = [];

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
      await prisma.cutoff.createMany({
        data: records,
      });
      inserted += records.length;
    }

    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`  Progress: ${inserted}/${cutoffs.length} records inserted`);
    }
  }

  console.log(`\n✅ Ingestion complete!`);
  console.log(`  Records inserted: ${inserted}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Colleges: ${Object.keys(collegeRecords).length}`);
  console.log(`  Branches: ${Object.keys(branchRecords).length}`);
}

main()
  .catch((e) => {
    console.error("Error during ingestion:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
