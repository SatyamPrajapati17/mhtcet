import fs from "fs";

const content = fs.readFileSync("MHTCET_All_CAP_Cutoffs_Combined.csv", "utf-8");
const lines = content.split("\n");

// Find the 2024 section and test parsing
let in2024 = false;
let sections_found = 0;
let colleges_found = 0;

for (let i = 0; i < lines.length; i++) {
  const rawLine = lines[i];
  const line = rawLine.trimEnd();

  // Detect section headers
  const sectionHeaderMatch = line.match(
    /^=====\s*(\d{4})(\w+)_CAP(\d+)_CutOff\s*=====$/
  );
  if (sectionHeaderMatch) {
    const year = parseInt(sectionHeaderMatch[1]);
    if (year === 2024) {
      in2024 = true;
      sections_found++;
      console.log(`=== Section ${sections_found} at line ${i}: ${line} ===`);
    } else {
      in2024 = false;
    }
    continue;
  }

  if (!in2024) continue;
  if (!line || line === "nan") continue;

  // Skip decorative headers
  if (line.length > 100 && /^[Dir]\s/.test(line)) continue;

  // Test college header regex
  const collegeMatch = line.match(/^"(\d{3,5})\s*-\s*(.+?)"$/);
  if (collegeMatch) {
    let code = collegeMatch[1].trim();
    code = code.replace(/^0+/, "") || code;
    console.log(`  [COLLEGE] Line ${i}: code="${code}" name="${collegeMatch[2].trim()}" (raw: "${collegeMatch[1]}")`);
    colleges_found++;
    if (colleges_found >= 5) break; // Just check first 5 colleges
  }
}

console.log(`\nTotal sections found: ${sections_found}`);
console.log(`Total colleges found: ${colleges_found}`);
