import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { parsePDFFile } from "./pdf-parser";

const prisma = new PrismaClient();

const PDF_DIR = process.cwd();
const PDF_FILES = [
  "2022ENGG_CAP1_CutOff.pdf",
  "2022ENGG_CAP2_CutOff.pdf",
  "2022ENGG_CAP3_CutOff.pdf",
  "2023ENGG_CAP1_CutOff.pdf",
  "2023ENGG_CAP2_CutOff.pdf",
  "2023ENGG_CAP3_CutOff.pdf",
  "2024ENGG_CAP1_CutOff.pdf",
  "2024ENGG_CAP2_CutOff.pdf",
  "2024ENGG_CAP3_CutOff.pdf",
];

async function main() {
  console.log("🚀 MHT CET PDF Data Ingestion\n");

  // Verify all PDFs exist
  for (const file of PDF_FILES) {
    const filePath = path.join(PDF_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ PDF file not found: ${filePath}`);
      process.exit(1);
    }
  }

  // Parse all PDFs
  console.log("📄 Parsing all 9 PDF files...\n");
  const allCutoffs: Array<import("./pdf-parser").ParsedCutoff> = [];
  const allColleges = new Map<string, { name: string; code: string }>();
  const allBranches = new Map<string, { name: string; code: string }>();

  for (const file of PDF_FILES) {
    const filePath = path.join(PDF_DIR, file);
    const result = await parsePDFFile(filePath);
    allCutoffs.push(...result.cutoffs);

    // Merge colleges and branches
    for (const [code, info] of result.colleges) {
      if (!allColleges.has(code)) {
        allColleges.set(code, info);
      }
    }
    for (const [code, info] of result.branches) {
      if (!allBranches.has(code)) {
        allBranches.set(code, info);
      }
    }
  }

  console.log(`\n=== Total across all PDFs ===`);
  console.log(`  Colleges: ${allColleges.size}`);
  console.log(`  Branches: ${allBranches.size}`);
  console.log(`  Cutoff records: ${allCutoffs.length}`);

  // Show unique categories
  const categories = [...new Set(allCutoffs.map((c) => c.category))].sort();
  console.log(`\n  Unique categories (${categories.length}):`);
  categories.forEach((c) => console.log(`    - ${c}`));

  // Confirm with user before clearing data
  // (Skipping confirmation - user explicitly asked for this)

  // Clear existing data
  console.log("\n🗑️  Clearing existing data...");
  await prisma.cutoff.deleteMany();
  await prisma.seatMatrix.deleteMany();
  await prisma.college.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.studentProfile.deleteMany();
  console.log("  ✅ Old data cleared");

  // Insert colleges
  console.log("\n🏛️  Inserting colleges...");
  const collegeRecords: Record<string, string> = {};
  const usedSlugs = new Set<string>();

  let collegeCount = 0;
  for (const [code, info] of allColleges) {
    let slug = info.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 60);
    slug = `${code}-${slug}`;

    // Ensure uniqueness
    let uniqueSlug = slug;
    let suffix = 1;
    while (usedSlugs.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${suffix}`;
      suffix++;
    }
    usedSlugs.add(uniqueSlug);

    const college = await prisma.college.create({
      data: {
        code,
        name: info.name,
        slug: uniqueSlug,
        city: info.name.includes(",") ? info.name.split(",").pop()?.trim() || "" : "",
      },
    });
    collegeRecords[code] = college.id;
    collegeCount++;
  }
  console.log(`  ✅ Inserted ${collegeCount} colleges`);

  // Insert branches
  console.log("\n🔬 Inserting branches...");
  const branchRecords: Record<string, string> = {};
  let branchCount = 0;
  for (const [code, info] of allBranches) {
    // Check if branch already exists
    const existing = await prisma.branch.findUnique({ where: { code } });
    if (existing) {
      branchRecords[code] = existing.id;
    } else {
      const branch = await prisma.branch.create({
        data: { code, name: info.name },
      });
      branchRecords[code] = branch.id;
      branchCount++;
    }
  }
  console.log(`  ✅ Inserted ${branchCount} branches (${Object.keys(branchRecords).length} total)`);

  // Insert cutoffs in batches
  console.log("\n📊 Inserting cutoffs...");
  const BATCH_SIZE = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < allCutoffs.length; i += BATCH_SIZE) {
    const batch = allCutoffs.slice(i, i + BATCH_SIZE);
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
      try {
        await prisma.cutoff.createMany({ data: records });
        inserted += records.length;
      } catch (e) {
        console.error(`  Batch error at ${i}:`, e);
        errors += records.length;
      }
    }

    if ((i / BATCH_SIZE) % 5 === 0) {
      console.log(`  Progress: ${inserted}/${allCutoffs.length} records`);
    }
  }

  // Summary
  console.log(`\n✅ Ingestion Complete!`);
  console.log(`  Colleges: ${collegeCount}`);
  console.log(`  Branches: ${branchCount}`);
  console.log(`  Cutoffs: ${inserted}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Source PDFs: ${PDF_FILES.length} files (Years 2022-2024, CAP Rounds 1-3)`);
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
