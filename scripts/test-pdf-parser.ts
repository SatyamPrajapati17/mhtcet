import { parsePDFFile } from "../src/lib/pdf-parser";
import path from "path";

async function main() {
  const pdfPath = path.join(process.cwd(), "2024ENGG_CAP1_CutOff.pdf");
  const result = await parsePDFFile(pdfPath);
  
  console.log(`=== RESULTS ===`);
  console.log(`Colleges: ${result.colleges.size}`);
  console.log(`Branches: ${result.branches.size}`);
  console.log(`Cutoff records: ${result.cutoffs.length}`);
  
  // Show first 15 records
  console.log("\n=== FIRST 15 RECORDS ===");
  for (let i = 0; i < Math.min(15, result.cutoffs.length); i++) {
    const r = result.cutoffs[i];
    console.log(`${r.collegeName} | ${r.branchName} | ${r.category} | Stage ${r.stage} | Rank: ${r.rank} | Pctl: ${r.percentile.toFixed(2)}`);
  }
  
  // Show unique categories found
  const cats = new Set(result.cutoffs.map(r => r.category));
  console.log(`\n=== UNIQUE CATEGORIES (${cats.size}) ===`);
  console.log([...cats].sort().join(", "));
  
  // Show some branches from first few colleges
  const collegeBranches = new Map<string, Set<string>>();
  for (const r of result.cutoffs.slice(0, 200)) {
    if (!collegeBranches.has(r.collegeName)) {
      collegeBranches.set(r.collegeName, new Set());
    }
    collegeBranches.get(r.collegeName)!.add(r.branchName);
  }
  console.log("\n=== SAMPLE COLLEGES & BRANCHES ===");
  for (const [college, branches] of collegeBranches) {
    console.log(`\n${college}:`);
    for (const b of branches) {
      console.log(`  - ${b}`);
    }
  }
}

main().catch(console.error);
