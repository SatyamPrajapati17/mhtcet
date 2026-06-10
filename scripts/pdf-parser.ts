import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

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
  seatLevel: string;
}

interface CollegeInfo {
  name: string;
  code: string;
}

interface BranchInfo {
  name: string;
  code: string;
}

// Known MHT CET category codes (sorted longest-first for greedy matching)
// Based on actual category codes observed in MHT CET PDFs
const KNOWN_CATEGORIES = [
  // Ladies categories first (to avoid matching "L" from other context)
  "PWDOPENS", "PWDOBCS", "PWDROBC", "PWDRSCS",
  "DEFOPENS", "DEFOBCS", "DEFRSEBC", "DEFROBC", "DEFOPEN",
  "SDEFOPEN", "SDEF",
  "GOPENS", "GOBCS", "GSEBCS", "GSCS", "GSTS", "GVJS",
  "GNT1S", "GNT2S", "GNT3S", "GNT",
  "LOPENS", "LOBCS", "LSEBCS", "LSCS", "LSTS", "LVJS", "LNT1S", "LNT2S", "LNT3S",
  "GTFWS", "TFWS",
  "GEWS", "EWS",
  "STFWS",
  "GS", "LS",
  "ORPHAN"
];

/**
 * Tokenize a concatenated category string like "GOPENSGSCSGSTS" into individual codes.
 * Uses greedy matching with the longest known tokens first.
 */
function tokenizeCategories(raw: string): string[] {
  let remaining = raw.toUpperCase().trim();
  const result: string[] = [];

  while (remaining.length > 0) {
    let matched = false;
    for (const token of ALL_CATEGORY_TOKENS) {
      if (remaining.startsWith(token)) {
        result.push(token);
        remaining = remaining.slice(token.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // If no match, consume one character to avoid infinite loop
      console.warn(`  [WARN] Unknown category token at: "${remaining.slice(0, 20)}..."`);
      remaining = remaining.slice(1);
    }
  }

  return result;
}

function isStatusLine(line: string): boolean {
  const statuses = [
    "Government", "Government Autonomous", "Government Aided",
    "Un-Aided", "Aided", "Private", "Private Unaided",
    "Autonomous", "Deemed", "Deemed University",
    "Status:", // Some have "Status:" prefix
  ];
  return statuses.includes(line.trim());
}

function isSeatLevelLine(line: string): boolean {
  const trimmed = line.trim();
  const levels = [
    "State Level",
    "State Level (All India Seats)",
    "Home University Seats Allotted to Home University Candidates",
    "Home University Seats Allotted to Other Than Home University Candidates",
    "Other Than Home University Seats Allotted to Other Than Home University Candidates",
    "Other Than Home University Seats",
    "Home University Seats",
    "All India Seats",
    "Institute Level",
  ];
  // Check exact match or if the line starts with one of these
  for (const level of levels) {
    if (trimmed === level || trimmed.startsWith(level)) return true;
  }
  return false;
}

function isStageLine(line: string): boolean {
  return /^\s*I{1,3}\s*$/.test(line);
}

function isPercentileLine(line: string): boolean {
  return /^\s*\(/.test(line);
}

function isSingleNumericLine(line: string): boolean {
  return /^\s*\d+\s*$/.test(line);
}

function isCategoryHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 5) return false;
  // Check if the line looks like concatenated category codes
  const upper = trimmed.toUpperCase();
  // Try to tokenize and see if we get enough tokens
  const tokens = tokenizeCategories(upper);
  return tokens.length >= 2;
}

function extractCollegeCodeAndName(line: string): { code: string; name: string } | null {
  const match = line.trim().match(/^(\d{3,5})\s*-\s*(.+)$/);
  if (match) return { code: match[1], name: match[2].trim() };
  return null;
}

function extractBranchCodeAndName(line: string): { code: string; name: string } | null {
  const match = line.trim().match(/^(\d{6,9})\s*-\s*(.+)$/);
  if (match) return { code: match[1], name: match[2].trim() };
  return null;
}

function extractSectionInfo(filename: string): { year: number; capRound: number } | null {
  const match = filename.match(/(\d{4})ENGG_CAP(\d+)_CutOff/);
  if (match) return { year: parseInt(match[1]), capRound: parseInt(match[2]) };
  return null;
}

export async function parsePDFFile(filePath: string): Promise<{
  cutoffs: ParsedCutoff[];
  colleges: Map<string, CollegeInfo>;
  branches: Map<string, BranchInfo>;
}> {
  const filename = path.basename(filePath);
  const sectionInfo = extractSectionInfo(filename);
  if (!sectionInfo) {
    throw new Error(`Could not extract year/CAP round from filename: ${filename}`);
  }

  const { year, capRound } = sectionInfo;
  console.log(`\n=== Processing ${filename} (Year: ${year}, CAP Round ${capRound}) ===`);

  const buf = fs.readFileSync(filePath);
  const data = await pdf(buf);
  const lines = data.text.split("\n").map((l) => l.trimEnd());

  const cutoffs: ParsedCutoff[] = [];
  const colleges = new Map<string, CollegeInfo>();
  const branches = new Map<string, BranchInfo>();

  // State machine state
  let currentCollegeCode = "";
  let currentCollegeName = "";
  let currentBranchCode = "";
  let currentBranchName = "";
  let currentSeatLevel = "";
  let currentCategories: string[] = [];
  let currentStage = "I";
  let categoryAccumulator = ""; // For multi-line category headers
  let expectingCategories = false;
  let expectingRanks = false;

  // Queue of (category, rank, percentile) records to create
  const pendingRecords: Array<{
    category: string;
    rank: number;
    percentile: number;
  }> = [];

  let rankBuffer: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty/short lines
    if (!trimmed || trimmed.length < 1) continue;

    // Skip document headers/footers
    if (
      trimmed.includes("State Common Entrance Test Cell") ||
      trimmed.includes("Government of Maharashtra") ||
      trimmed.includes("Cut Off List") ||
      trimmed.includes("Cut Off Indicates") ||
      trimmed.includes("Figures in bracket") ||
      trimmed.includes("Page ") ||
      trimmed.startsWith("State Common Entrance Test") ||
      trimmed.includes("Directorate of Technical Education") ||
      trimmed.startsWith("www.") ||
      trimmed.startsWith("Note:")
    ) continue;

    // Skip standalone page numbers (just digits)
    if (/^\d+$/.test(trimmed) && trimmed.length <= 4) continue;

    // --- 1. College header ---
    const collegeMatch = extractCollegeCodeAndName(line);
    if (collegeMatch) {
      // Flush any remaining pending records
      if (pendingRecords.length > 0 && currentBranchCode) {
        for (const pr of pendingRecords) {
          cutoffs.push({
            collegeCode: currentCollegeCode,
            collegeName: currentCollegeName,
            branchCode: currentBranchCode,
            branchName: currentBranchName,
            year,
            capRound,
            category: pr.category,
            stage: currentStage,
            rank: pr.rank,
            percentile: pr.percentile,
            seatLevel: currentSeatLevel,
          });
        }
        pendingRecords.length = 0;
      }

      currentCollegeCode = collegeMatch.code;
      currentCollegeName = collegeMatch.name;
      currentBranchCode = "";
      currentBranchName = "";
      currentSeatLevel = "";
      currentCategories = [];
      currentStage = "I";
      categoryAccumulator = "";
      expectingCategories = false;
      expectingRanks = false;
      rankBuffer = null;

      if (!colleges.has(currentCollegeCode)) {
        colleges.set(currentCollegeCode, { name: currentCollegeName, code: currentCollegeCode });
      }
      continue;
    }

    // Need a college code
    if (!currentCollegeCode) continue;

    // --- 2. Branch header ---
    const branchMatch = extractBranchCodeAndName(line);
    if (branchMatch) {
      // Flush pending records before switching branches
      if (pendingRecords.length > 0 && currentBranchCode) {
        for (const pr of pendingRecords) {
          cutoffs.push({
            collegeCode: currentCollegeCode,
            collegeName: currentCollegeName,
            branchCode: currentBranchCode,
            branchName: currentBranchName,
            year,
            capRound,
            category: pr.category,
            stage: currentStage,
            rank: pr.rank,
            percentile: pr.percentile,
            seatLevel: currentSeatLevel,
          });
        }
        pendingRecords.length = 0;
      }

      currentBranchCode = branchMatch.code;
      currentBranchName = branchMatch.name;
      currentSeatLevel = "";
      currentCategories = [];
      currentStage = "I";
      categoryAccumulator = "";
      expectingCategories = false;
      expectingRanks = false;
      rankBuffer = null;

      if (!branches.has(currentBranchCode)) {
        branches.set(currentBranchCode, { name: currentBranchName, code: currentBranchCode });
      }
      continue;
    }

    // Need a branch code
    if (!currentBranchCode) continue;

    // --- 3. Status line ---
    if (isStatusLine(line)) continue;

    // --- 4. Seat level line ---
    if (isSeatLevelLine(line)) {
      // Flush any pending records for current level
      if (pendingRecords.length > 0) {
        for (const pr of pendingRecords) {
          cutoffs.push({
            collegeCode: currentCollegeCode,
            collegeName: currentCollegeName,
            branchCode: currentBranchCode,
            branchName: currentBranchName,
            year,
            capRound,
            category: pr.category,
            stage: currentStage,
            rank: pr.rank,
            percentile: pr.percentile,
            seatLevel: currentSeatLevel,
          });
        }
        pendingRecords.length = 0;
      }

      currentSeatLevel = trimmed;
      currentCategories = [];
      currentStage = "I";
      categoryAccumulator = "";
      expectingCategories = true; // After seat level, we expect category header
      expectingRanks = false;
      rankBuffer = null;
      continue;
    }

    // --- 5. Stage line (I, II, III) ---
    if (isStageLine(line)) {
      // Flush pending records before stage changes
      if (pendingRecords.length > 0) {
        for (const pr of pendingRecords) {
          cutoffs.push({
            collegeCode: currentCollegeCode,
            collegeName: currentCollegeName,
            branchCode: currentBranchCode,
            branchName: currentBranchName,
            year,
            capRound,
            category: pr.category,
            stage: currentStage,
            rank: pr.rank,
            percentile: pr.percentile,
            seatLevel: currentSeatLevel,
          });
        }
        pendingRecords.length = 0;
      }

      currentStage = trimmed.trim();
      expectingRanks = true;
      rankBuffer = null;
      continue;
    }

    // --- 6. Category header line ---
    // Check if this is a continuation of a multi-line category header
    if (categoryAccumulator) {
      // Try to append this line to our accumulator and see if we get a valid category set
      const combined = categoryAccumulator + trimmed;
      const combinedTokens = tokenizeCategories(combined);

      // If combining gives us more tokens than just the accumulator alone, keep accumulating
      const accTokens = tokenizeCategories(categoryAccumulator);
      if (combinedTokens.length > accTokens.length) {
        categoryAccumulator = combined;
        continue;
      }

      // Otherwise, process what we've accumulated so far
      if (accTokens.length >= 2) {
        // Flush pending records before changing categories
        if (pendingRecords.length > 0) {
          for (const pr of pendingRecords) {
            cutoffs.push({
              collegeCode: currentCollegeCode,
              collegeName: currentCollegeName,
              branchCode: currentBranchCode,
              branchName: currentBranchName,
              year,
              capRound,
              category: pr.category,
              stage: currentStage,
              rank: pr.rank,
              percentile: pr.percentile,
              seatLevel: currentSeatLevel,
            });
          }
          pendingRecords.length = 0;
        }
        currentCategories = accTokens;
        expectingRanks = true;
        rankBuffer = null;
      }
      categoryAccumulator = "";

      // Now re-evaluate the current line as a fresh category header
      const tokens = tokenizeCategories(trimmed);
      if (tokens.length >= 2) {
        currentCategories = tokens;
        expectingRanks = true;
        rankBuffer = null;
        continue;
      }
      // If still not enough tokens, it might be a single char accumulator
      if (tokens.length >= 1) {
        categoryAccumulator = trimmed;
        continue;
      }
    }

    // Try to tokenize as category header (fresh line)
    if (!categoryAccumulator) {
      const tokens = tokenizeCategories(trimmed);
      if (tokens.length >= 2) {
        // If we already have categories and pending records, flush first
        if (currentCategories.length > 0 && pendingRecords.length > 0) {
          for (const pr of pendingRecords) {
            cutoffs.push({
              collegeCode: currentCollegeCode,
              collegeName: currentCollegeName,
              branchCode: currentBranchCode,
              branchName: currentBranchName,
              year,
              capRound,
              category: pr.category,
              stage: currentStage,
              rank: pr.rank,
              percentile: pr.percentile,
              seatLevel: currentSeatLevel,
            });
          }
          pendingRecords.length = 0;
        }

        currentCategories = tokens;
        expectingRanks = true;
        rankBuffer = null;
        continue;
      }
      // Short token count - start accumulating
      if (tokens.length >= 1) {
        categoryAccumulator = trimmed;
        continue;
      }
    }

    // --- 7. Percentile line ---
    if (isPercentileLine(line)) {
      const match = trimmed.match(/\(([\d.]+)\)/);
      if (match && rankBuffer !== null) {
        const percentile = parseFloat(match[1]);
        // Use rankBuffer as the rank, assign to next category in order
        if (currentCategories.length > 0 && expectingRanks) {
          pendingRecords.push({
            category: currentCategories[pendingRecords.length % currentCategories.length],
            rank: rankBuffer,
            percentile,
          });
          rankBuffer = null;
        }
      }
      continue;
    }

    // --- 8. Single numeric line (rank) ---
    if (isSingleNumericLine(line) && expectingRanks && currentCategories.length > 0) {
      rankBuffer = parseInt(trimmed, 10);
      // If we already have a full set of pending records matching all categories,
      // save them and start fresh
      if (pendingRecords.length >= currentCategories.length) {
        for (const pr of pendingRecords) {
          cutoffs.push({
            collegeCode: currentCollegeCode,
            collegeName: currentCollegeName,
            branchCode: currentBranchCode,
            branchName: currentBranchName,
            year,
            capRound,
            category: pr.category,
            stage: currentStage,
            rank: pr.rank,
            percentile: pr.percentile,
            seatLevel: currentSeatLevel,
          });
        }
        pendingRecords.length = 0;
      }
      continue;
    }
  }

  // Final flush of any remaining pending records
  if (pendingRecords.length > 0 && currentBranchCode) {
    for (const pr of pendingRecords) {
      cutoffs.push({
        collegeCode: currentCollegeCode,
        collegeName: currentCollegeName,
        branchCode: currentBranchCode,
        branchName: currentBranchName,
        year,
        capRound,
        category: pr.category,
        stage: currentStage,
        rank: pr.rank,
        percentile: pr.percentile,
        seatLevel: currentSeatLevel,
      });
    }
    pendingRecords.length = 0;
  }

  console.log(`  Found: ${colleges.size} colleges, ${branches.size} branches, ${cutoffs.length} cutoffs`);

  // Show sample
  if (cutoffs.length > 0) {
    console.log(`  Sample: ${JSON.stringify(cutoffs[0])}`);
    console.log(`  Last: ${JSON.stringify(cutoffs[cutoffs.length - 1])}`);
  }

  return { cutoffs, colleges, branches };
}
