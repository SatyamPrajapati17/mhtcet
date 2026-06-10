import { PrismaClient } from "@prisma/client";
import { parseCSVFile } from "../src/lib/csv-parser";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  // Step 1: Parse CSV
  console.log("📄 Parsing CSV...");
  const csvPath = path.join(process.cwd(), "MHTCET_All_CAP_Cutoffs_Combined.csv");
  const { cutoffs, colleges: collegeMap, branches: branchMap } = parseCSVFile(csvPath);
  console.log(`   Colleges: ${collegeMap.size}, Branches: ${branchMap.size}, Cutoffs: ${cutoffs.length}`);

  // Step 2: Check existing data in DB
  const dbColleges = await prisma.college.findMany({ select: { id: true, code: true } });
  const dbBranches = await prisma.branch.findMany({ select: { id: true, code: true } });
  
  const collegeLookup = new Map(dbColleges.map(c => [c.code, c.id]));
  const branchLookup = new Map(dbBranches.map(c => [c.code, c.id]));

  console.log(`\n📊 DB State: ${dbColleges.length} colleges, ${dbBranches.length} branches`);

  // Step 3: Insert missing branches
  const uniqueBranchCodes = new Set(cutoffs.map(c => c.branchCode));
  const missingBranchCodes = [...uniqueBranchCodes].filter(c => !branchLookup.has(c));
  
  if (missingBranchCodes.length > 0) {
    console.log(`\n🔧 Inserting ${missingBranchCodes.length} missing branches...`);
    let count = 0;
    for (const code of missingBranchCodes) {
      const info = branchMap.get(code);
      if (info) {
        try {
          await prisma.branch.create({ data: { code, name: info.name } });
          count++;
        } catch (e: any) {
          // Skip if exists
        }
      } else {
        // Create with code as name if branch info not in map
        try {
          await prisma.branch.create({ data: { code, name: `Branch ${code}` } });
          count++;
        } catch (e: any) {}
      }
    }
    console.log(`   Inserted ${count} branches`);

    // Reload branch lookup
    const updatedBranches = await prisma.branch.findMany({ select: { id: true, code: true } });
    branchLookup.clear();
    for (const b of updatedBranches) branchLookup.set(b.code, b.id);
  }

  console.log(`   Total branches now: ${branchLookup.size}`);

  // Step 4: Clear old cutoffs and insert new ones
  const existingCutoffs = await prisma.cutoff.count();
  if (existingCutoffs > 0) {
    console.log(`\n🗑️  Clearing ${existingCutoffs} existing cutoffs...`);
    await prisma.cutoff.deleteMany();
  }

  console.log(`\n📊 Inserting ${cutoffs.length} cutoffs...`);
  const BATCH_SIZE = 500;
  let inserted = 0;
  let skipped = 0;
  let lastPct = 0;

  for (let i = 0; i < cutoffs.length; i += BATCH_SIZE) {
    const batch = cutoffs.slice(i, i + BATCH_SIZE);
    const records: any[] = [];

    for (const cut of batch) {
      const collegeId = collegeLookup.get(cut.collegeCode);
      const branchId = branchLookup.get(cut.branchCode);

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
        console.error(`   Error at ${i}: ${e.message?.substring(0, 100)}`);
      }
    }

    const pct = Math.floor((inserted / cutoffs.length) * 100);
    if (pct >= lastPct + 10) {
      lastPct = pct;
      console.log(`   ${inserted}/${cutoffs.length} (${pct}%)`);
    }
  }

  console.log(`\n✅ COMPLETE!`);
  console.log(`   Colleges: ${dbColleges.length}`);
  console.log(`   Branches: ${branchLookup.size}`);
  console.log(`   Cutoffs inserted: ${inserted}`);
  console.log(`   Skipped: ${skipped}`);

  const finalCount = await prisma.cutoff.count();
  console.log(`   Total in DB: ${finalCount}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
