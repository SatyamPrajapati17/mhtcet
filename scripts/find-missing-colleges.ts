import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Read CSV and extract all college header lines quickly
  const content = fs.readFileSync("MHTCET_All_CAP_Cutoffs_Combined.csv", "utf-8");
  
  // Use regex to find all quoted college codes
  const regex = /"(\d{3,5})\s*-\s*(.+?)"/g;
  const csvColleges = new Map<string, string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    let code = match[1].replace(/^0+/, "") || match[1];
    const name = match[2].trim();
    if (code.length >= 3 && code.length <= 5 && !csvColleges.has(code)) {
      csvColleges.set(code, name);
    }
  }

  console.log(`CSV unique college codes: ${csvColleges.size}`);

  // 2. Get DB colleges
  const dbCols = await prisma.college.findMany({ select: { code: true, name: true } });
  const dbCodes = new Set(dbCols.map(c => c.code));
  console.log(`DB college codes: ${dbCodes.size}`);

  // 3. Find missing
  const missing = [...csvColleges.entries()]
    .filter(([code]) => !dbCodes.has(code))
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  console.log(`\nColleges in CSV but NOT in DB: ${missing.length}`);
  missing.forEach(([code, name]) => {
    const city = name.includes(",") ? name.split(",").pop()?.trim() || "" : "";
    console.log(`  ${code} - ${name} [${city}]`);
  });

  // 4. Check for colleges in DB but NOT in CSV (shouldn't happen but check)
  const extra = dbCols.filter(c => !csvColleges.has(c.code));
  if (extra.length > 0) {
    console.log(`\nColleges in DB but NOT in CSV: ${extra.length}`);
    extra.slice(0, 10).forEach(c => console.log(`  ${c.code} - ${c.name}`));
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
