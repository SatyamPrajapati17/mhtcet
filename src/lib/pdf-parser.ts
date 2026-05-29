import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

export interface ParsedCutoff {
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
}

// All known full category codes in MHT CET (sorted longest-first for greedy matching)
const CATEGORY_TOKENS = [
  // State Level (ending with S)
  "SDEFOPENS", "SDEFOBCS", "SDEFSCS", "SPWDOPENS", "SPWDOBCS", "PWDROBCS",
  "DEFOPENS", "DEFOBCS", "DEFSCS", "DEFRSCS", "DEFRNT1S",
  "PWDOPENS", "PWDOBCS",
  "GOPENS", "GSCS", "GSTS", "GVJS", "GNT1S", "GNT2S", "GNT3S", "GOBCS", "GSEBCS",
  "LOPENS", "LSCS", "LSTS", "LVJS", "LNT1S", "LNT2S", "LNT3S", "LOBCS", "LSEBCS",
  // Home University (ending with H)
  "PWDOPENH", "PWDOBCH", "PWDROBCH",
  "DEFOPENH", "DEFOBCH",
  "GOPENH", "GSCH", "GSTH", "GVJH", "GNT1H", "GNT2H", "GNT3H", "GOBCH", "GSEBCH",
  "LOPENH", "LSCH", "LSTH", "LVJH", "LNT1H", "LNT2H", "LNT3H", "LOBCH", "LSEBCH",
  // Other University (ending with O)
  "PWDOPENO", "PWDOBCO", "PWDROBCO",
  "DEFOPENO", "DEFOBCO",
  "GOPENO", "GSCO", "GSTO", "GVJO", "GNT1O", "GNT2O", "GNT3O", "GOBCO", "GSEBCO",
  "LOPENO", "LSCO", "LSTO", "LVJO", "LNT1O", "LNT2O", "LNT3O", "LOBCO", "LSEBCO",
  // Special codes (no prefix/suffix pattern)
  "SPWDOPEN", "SPWDOBC", "PWDOPEN", "PWDOBC", "PWDROBC",
  "SDEFOPEN", "SDEFOBC", "DEFOPEN", "DEFOBC", "DEFSC", "DEFRSC",
  "GOPENS", "LOPENS",
  "TFWS", "EWS", "MITFWS", "ORPHAN", "RSC",
  // Fallback catches for any remaining compound patterns (without suffix)
  "GOPEN", "GSC", "GST", "GVJ", "GNT1", "GNT2", "GNT3", "GOBC", "GSEBC",
  "LOPEN", "LSC", "LST", "LVJ", "LNT1", "LNT2", "LNT3", "LOBC", "LSEBC",
].sort((a, b) => b.length - a.length);

function splitCategoryString(s: string): string[] {
  const result: string[] = [];
  let remaining = s;

  while (remaining.length > 0) {
    let matched = false;
    for (const token of CATEGORY_TOKENS) {
      if (remaining.startsWith(token)) {
        result.push(token);
        remaining = remaining.slice(token.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (remaining.length > 0) {
        result.push(remaining);
      }
      break;
    }
  }

  return result;
}

export async function parsePDFFile(filePath: string): Promise<{
  cutoffs: ParsedCutoff[];
  colleges: Map<string, { name: string; code: string }>;
  branches: Map<string, { name: string; code: string }>;
}> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text;
  const lines = text.split("\n");

  // Extract year and cap round from filename
  const fileName = path.basename(filePath, ".pdf");
  const fileMatch = fileName.match(/(\d{4})ENGG_CAP(\d+)/);
  if (!fileMatch) throw new Error(`Cannot parse year/cap from filename: ${fileName}`);
  const currentYear = parseInt(fileMatch[1]);
  const currentCapRound = parseInt(fileMatch[2]);

  const cutoffs: ParsedCutoff[] = [];
  const colleges = new Map<string, { name: string; code: string }>();
  const branches = new Map<string, { name: string; code: string }>();

  let collegeCode = "";
  let collegeName = "";
  let branchCode = "";
  let branchName = "";
  let categories: string[] = [];
  let currentStage = "I";
  let collectingCategories = false;
  let collectedRanks: number[] = [];
  let collectedPercentiles: number[] = [];
  let foundCollege = false;
  let foundBranch = false;

  function flushData() {
    if (collectedRanks.length === 0 || categories.length === 0) return;
    if (!branchCode) return;

    const count = Math.min(collectedRanks.length, collectedPercentiles.length, categories.length);
    for (let i = 0; i < count; i++) {
      cutoffs.push({
        collegeCode,
        collegeName,
        branchCode,
        branchName,
        year: currentYear,
        capRound: currentCapRound,
        category: categories[i],
        stage: currentStage,
        rank: collectedRanks[i],
        percentile: collectedPercentiles[i],
      });
    }
    collectedRanks = [];
    collectedPercentiles = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();

    // Skip empty lines and noise
    if (!line || line === "nan" || line === "D" || line === "i" || line === "r" || line === "S") {
      continue;
    }

    // Skip decorative header/footer lines
    if (
      line.startsWith("State Common Entrance Test Cell") ||
      line.startsWith("Cut Off List for Maharashtra") ||
      line.startsWith("Degree Courses In Engineering") ||
      line.startsWith("Government of Maharashtra") ||
      line.startsWith("Legends:") ||
      line.startsWith(" Maharashtra State Seats") ||
      line === "1" ||
      line.startsWith("Cut Off Indicates")
    ) {
      continue;
    }

    // College header: "01002 - Government College of Engineering, Amravati" or "1002 - ..."
    // 4 or 5 digits (2022-2023 use 4 digits, 2024 uses 5 digits)
    const collegeMatch = line.match(/^(\d{4,5})\s*-\s*(.+)$/);
    if (collegeMatch) {
      flushData();
      collegeCode = collegeMatch[1].replace(/^0+/, "");
      collegeName = collegeMatch[2].trim();
      branchCode = "";
      branchName = "";
      categories = [];
      collectingCategories = false;
      foundCollege = true;

      if (!colleges.has(collegeCode)) {
        colleges.set(collegeCode, { name: collegeName, code: collegeCode });
      }
      continue;
    }

    // Branch line: "0100219110 - Civil Engineering" or "100219110 - ..."
    // 9 or 10 digits (2022-2023 use 9 digits, 2024 uses 10 digits)
    const branchMatch = line.match(/^(\d{9,10})\s*-\s*(.+)$/);
    if (branchMatch) {
      flushData();
      branchCode = branchMatch[1];
      branchName = branchMatch[2].trim();
      categories = [];
      collectingCategories = false;
      foundBranch = true;

      if (!branches.has(branchCode)) {
        branches.set(branchCode, { name: branchName, code: branchCode });
      }
      continue;
    }

    // Status line
    if (line.startsWith("Status:")) {
      continue;
    }

    // Section headers (allocation type)
    if (
      line === "State Level" ||
      line.startsWith("Home University Seats Allotted") ||
      line.startsWith("Other Than Home University Seats Allotted")
    ) {
      flushData();
      categories = [];
      collectingCategories = true;
      continue;
    }

    // Stage markers: "  I", "  II", "  III"
    const stageMatch = line.match(/^\s*(I{1,3})\s*$/);
    if (stageMatch && categories.length > 0) {
      flushData();
      currentStage = stageMatch[1];
      continue;
    }

    // Need a branch code to proceed
    if (!branchCode || !foundCollege || !foundBranch) continue;

    // Percentile line: "(88.5013511)"
    const pctMatch = line.match(/^\((\d+\.?\d*)\)$/);
    if (pctMatch && collectedRanks.length > collectedPercentiles.length) {
      collectedPercentiles.push(parseFloat(pctMatch[1]));
      continue;
    }

    // Rank line: "34240" - pure digits (length >= 2 to avoid noise)
    const rankMatch = line.match(/^(\d+)$/);
    if (rankMatch && rankMatch[1].length >= 2 && collectingCategories) {
      collectedRanks.push(parseInt(rankMatch[1]));
      continue;
    }

    // Category line: all uppercase letters and digits
    if (line.match(/^[A-Z0-9]+$/) && line.length >= 5 && collectingCategories && branchCode) {
      const parsed = splitCategoryString(line);
      if (parsed.length > 0) {
        categories.push(...parsed);
      }
      continue;
    }
  }

  // Flush final batch
  flushData();

  return { cutoffs, colleges, branches };
}

export async function parseAllPDFs(pdfDir: string): Promise<{
  cutoffs: ParsedCutoff[];
  colleges: Map<string, { name: string; code: string }>;
  branches: Map<string, { name: string; code: string }>;
}> {
  const allCutoffs: ParsedCutoff[] = [];
  const allColleges = new Map<string, { name: string; code: string }>();
  const allBranches = new Map<string, { name: string; code: string }>();

  const files = fs.readdirSync(pdfDir)
    .filter(f => f.endsWith(".pdf") && /^\d{4}ENGG_CAP\d+_CutOff\.pdf$/.test(f))
    .sort();

  if (files.length === 0) {
    throw new Error(`No MHT CET PDF files found in ${pdfDir}`);
  }

  console.log(`Found ${files.length} PDF files to parse:`);
  for (const f of files) {
    console.log(`  - ${f}`);
  }

  for (const file of files) {
    const filePath = path.join(pdfDir, file);
    console.log(`\nParsing ${file}...`);
    const result = await parsePDFFile(filePath);

    allCutoffs.push(...result.cutoffs);

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

    console.log(`  -> ${result.cutoffs.length} records (${result.colleges.size} colleges, ${result.branches.size} branches)`);
  }

  return { cutoffs: allCutoffs, colleges: allColleges, branches: allBranches };
}
