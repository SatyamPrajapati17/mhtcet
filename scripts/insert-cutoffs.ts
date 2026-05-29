import { PrismaClient } from "@prisma/client";
import { parseCSVFile } from "../src/lib/csv-parser";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(process.cwd(), "MHTCET_All_CAP_Cutoffs_Combined.csv");
  console.log("📄 Parsing CSV file...");
  
  const { cutoffs } = parseCSVFile(csvPath);
  console.log(`   Parsed ${cutoffs.length} cutoff records from CSV`);

  // Get all existing colleges and branches from DB
  console.log("\n🔍 Looking up existing colleges and branches...");
  const dbColleges = await prisma.college.findMany({ select: { id: true, code: true } });
  const dbBranches = await prisma.branch.findMany({ select: { id: true, code: true } });

  const collegeMap = new Map(dbColleges.map(c => [c.code, c.id]));
  const branchMap = new Map(dbBranches.map(c => [c.code, c.id]));

  console.log(`   Found ${collegeMap.size} colleges and ${branchMap.size} branches in DB`);

  // Insert cutoffs in batches
  console.log("\n📊 Inserting cutoffs...");
  const BATCH_SIZE = 500;
  let inserted = 0;
  let errors = 0;
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
        await prisma.cutoff.createMany({ data: records });
        inserted += records.length;
      } catch (e: any) {
        console.error(`  Batch error at ${i}:`, e.message);
        errors += records.length;
      }
    }

    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`  Progress: ${inserted}/${cutoffs.length} records`);
    }
  }

  // Verify
  const totalCutoffs = await prisma.cutoff.count();
  console.log(`\n✅ Complete!`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped (no match): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total in DB: ${totalCutoffs}`);

  // Check Thane / AP Shah specifically
  const apShah = await prisma.college.findFirst({ where: { code: "3475" } });
  if (apShah) {
    const apCutoffs = await prisma.cutoff.count({ where: { collegeId: apShah.id } });
    console.log(`\n  A.P. Shah Institute of Technology: ${apCutoffs} cutoff records`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
