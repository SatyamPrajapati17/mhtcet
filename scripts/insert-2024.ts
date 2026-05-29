import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { parsePDFFile } from "./pdf-parser";

const prisma = new PrismaClient();

async function main() {
  const pdfDir = process.cwd();
  const pdfFiles = [
    "2024ENGG_CAP1_CutOff.pdf",
    "2024ENGG_CAP2_CutOff.pdf",
    "2024ENGG_CAP3_CutOff.pdf",
  ];

  console.log("📄 Parsing 2024 PDFs...");
  const allCutoffs: any[] = [];

  for (const file of pdfFiles) {
    const filePath = path.join(pdfDir, file);
    console.log(`   Processing ${file}...`);
    const result = await parsePDFFile(filePath);
    allCutoffs.push(...result.cutoffs);
    console.log(`   Got ${result.cutoffs.length} records from ${file}`);
  }

  console.log(`\n📊 Total 2024 records parsed: ${allCutoffs.length}`);

  // Get existing colleges and branches
  const dbColleges = await prisma.college.findMany({ select: { id: true, code: true } });
  const dbBranches = await prisma.branch.findMany({ select: { id: true, code: true } });

  const collegeMap = new Map(dbColleges.map(c => [c.code, c.id]));
  const branchMap = new Map(dbBranches.map(c => [c.code, c.id]));

  console.log(`   DB has ${collegeMap.size} colleges, ${branchMap.size} branches`);

  // Insert cutoffs in batches
  console.log("\n📊 Inserting 2024 cutoffs...");
  const BATCH_SIZE = 500;
  let inserted = 0;
  let errors = 0;
  let skipped = 0;

  for (let i = 0; i < allCutoffs.length; i += BATCH_SIZE) {
    const batch = allCutoffs.slice(i, i + BATCH_SIZE);
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
        console.error(`  Batch error at ${i}:`, e.message);
        errors += records.length;
      }
    }

    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`  Progress: ${inserted}/${allCutoffs.length}`);
    }
  }

  // Verify
  const apShah = await prisma.college.findFirst({ where: { code: "3475" } });
  if (apShah) {
    const yrs = await prisma.cutoff.groupBy({
      where: { collegeId: apShah.id },
      by: ["year"],
      _count: true,
      orderBy: { year: "desc" },
    });
    console.log(`\n✅ A.P. Shah data by year: ${JSON.stringify(yrs)}`);

    const cnt2024 = await prisma.cutoff.count({
      where: { collegeId: apShah.id, year: 2024, capRound: 3, category: { contains: "GOPENS" } },
    });
    console.log(`   GOPENS CAP3 2024: ${cnt2024} records`);
  }

  console.log(`\n✅ Complete! Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
