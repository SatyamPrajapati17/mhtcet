import fs from "fs";

export interface ParsedCutoff {
  collegeCode: string;
  collegeName: string;
  collegeStatus: string;
  branchCode: string;
  branchName: string;
  year: number;
  capRound: number;
  category: string;
  stage: string;
  rank: number;
  percentile: number;
}

interface CollegeInfo {
  name: string;
  code: string;
}

interface BranchInfo {
  name: string;
  code: string;
}

export function parseCSVFile(filePath: string): {
  cutoffs: ParsedCutoff[];
  colleges: Map<string, CollegeInfo>;
  branches: Map<string, BranchInfo>;
} {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const cutoffs: ParsedCutoff[] = [];
  const colleges = new Map<string, CollegeInfo>();
  const branches = new Map<string, BranchInfo>();

  let currentYear = 0;
  let currentCapRound = 0;
  let currentCollegeCode = "";
  let currentCollegeName = "";
  let currentCollegeStatus = "";
  let currentBranchCode = "";
  let currentBranchName = "";
  let currentCategories: string[] = [];
  let expectingData = false;
  let pendingPercentileLine = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd(); // removes \r and trailing spaces

    // Skip empty lines and "nan" lines
    // IMPORTANT: Don't reset expectingData here — nan lines appear between
    // the Stage header and the actual data lines!
    if (!line || line === "nan") {
      continue;
    }

    // --- 1. Detect section header: ===== 2022ENGG_CAP1_CutOff ===== ---
    // Match patterns like "===== 2022ENGG_CAP1_CutOff =====" or "===== 2022ENGG_CAP2_CutOff ====="
    const sectionHeaderMatch = line.match(
      /^=====\s*(\d{4})(\w+)_CAP(\d+)_CutOff\s*=====$/
    );
    if (sectionHeaderMatch) {
      currentYear = parseInt(sectionHeaderMatch[1]);
      currentCapRound = parseInt(sectionHeaderMatch[3]);
      currentCollegeCode = "";
      currentCollegeName = "";
      currentCollegeStatus = "";
      currentBranchCode = "";
      currentBranchName = "";
      currentCategories = [];
      expectingData = false;
      pendingPercentileLine = false;
      continue;
    }

    // --- 2. Skip header/decorative lines ---
    // Lines starting with single letters (D, i, r) are decorative headers
    if (
      line.length > 100 &&
      /^[Dir]\s/.test(line)
    ) {
      continue;
    }

    // --- 3. Detect college header: "1002 - Government College of Engineering, Amravati" or "01002 - Government College of Engineering, Amravati" ---
    const collegeMatch = line.match(/^"(\d{3,5})\s*-\s*(.+?)"$/);
    if (collegeMatch) {
      let code = collegeMatch[1].trim();
      const name = collegeMatch[2].trim();

      // Strip leading zeros from codes (e.g., "01002" → "1002")
      code = code.replace(/^0+/, "") || code;

      // Only treat as college if code is 3-5 digits (branch codes are 6-9 digits)
      if (code.length <= 5 && code.length >= 3) {
        currentCollegeCode = code;
        currentCollegeName = name;
        currentCollegeStatus = "";
        currentBranchCode = "";
        currentBranchName = "";
        currentCategories = [];
        expectingData = false;
        pendingPercentileLine = false;

        if (!colleges.has(code)) {
          colleges.set(code, { name, code });
        }
        continue;
      }
    }

    // We need a college code to proceed further
    if (!currentCollegeCode) {
      continue;
    }

    // --- 4. Status line ---
    if (line.startsWith("Status:")) {
      currentCollegeStatus = line.replace("Status:", "").trim();
      continue;
    }

    // --- 5. Level line ("State Level" or "Institute Level") ---
    if (line === "State Level" || line === "Institute Level") {
      // Next meaningful line should be the Stage header
      continue;
    }

    // --- 6. Detect branch line: "100219110 - Civil Engineering" or "0100219110 - Civil Engineering" ---
    // Branch codes are 6-10 digits followed by " - " and the branch name
    const branchMatch = line.match(/^(\d{6,11})\s*-\s*(.+)$/);
    if (branchMatch) {
      let branchCode = branchMatch[1];
      // Strip leading zeros (e.g., "0100219110" → "100219110")
      branchCode = branchCode.replace(/^0+/, "") || branchCode;
      currentBranchCode = branchCode;
      currentBranchName = branchMatch[2].trim();
      currentCategories = [];
      expectingData = false;

      if (!branches.has(currentBranchCode)) {
        branches.set(currentBranchCode, {
          name: currentBranchName,
          code: currentBranchCode,
        });
      }
      continue;
    }

    // --- 7. Stage header line: "Stage      GOPENS          GSCS ..." ---
    if (line.startsWith("Stage")) {
      // Parse category names from the stage header
      const parts = line.split(/\s+/).filter((p) => p && p !== "Stage" && p !== "S");
      currentCategories = [];
      for (const p of parts) {
        const clean = p.trim();
        if (clean && clean.length >= 2) {
          currentCategories.push(clean);
        }
      }
      expectingData = true;
      pendingPercentileLine = false;
      continue;
    }

    // --- 8. Standalone "S" line (appears between Stage header and data) ---
    if (line === "S") {
      continue;
    }

    // --- 9. Data line: "I      40678          55830 ..." ---
    // This can be Round I, II, or III
    if (expectingData && currentCategories.length > 0 && currentBranchCode) {
      const dataMatch = line.match(/^(I{1,3})\s+([\d()\s]+)$/);
      if (dataMatch) {
        const stage = dataMatch[1]; // "I", "II", or "III"
        const rest = dataMatch[2];

        // Extract all numbers (ranks)
        const rankMatches = rest.match(/\b(\d+)\b/g);

        // Check if the next line contains parentheses (percentiles)
        let percentileValues: number[] = [];
        const nextIdx = i + 1;
        if (nextIdx < lines.length) {
          const nextLine = lines[nextIdx].trimEnd();
          // The next line should have percentiles in parentheses
          const pctMatches = nextLine.match(/\(([\d.]+)\)/g);
          if (pctMatches) {
            percentileValues = pctMatches.map((p) =>
              parseFloat(p.replace(/[()]/g, ""))
            );
          }
        }

        // Create cutoff records for each category
        for (let ci = 0; ci < currentCategories.length; ci++) {
          const cat = currentCategories[ci];
          const rank =
            rankMatches && ci < rankMatches.length
              ? parseInt(rankMatches[ci])
              : 0;
          const percentile =
            ci < percentileValues.length ? percentileValues[ci] : 0;

          if (rank > 0 && percentile > 0) {
            cutoffs.push({
              collegeCode: currentCollegeCode,
              collegeName: currentCollegeName,
              collegeStatus: currentCollegeStatus,
              branchCode: currentBranchCode,
              branchName: currentBranchName,
              year: currentYear,
              capRound: currentCapRound,
              category: cat,
              stage,
              rank,
              percentile,
            });
          }
        }

        // Skip the percentile line on the next iteration
        if (percentileValues.length > 0) {
          pendingPercentileLine = true;
        }
        continue;
      }
    }

    // --- 10. Skip the percentile line (already processed above) ---
    if (pendingPercentileLine && /^\(/.test(line)) {
      pendingPercentileLine = false;
      continue;
    }

    // --- 11. Skip any other lines we don't understand ---
    // They might be more header/decorative text or "S" lines
  }

  return { cutoffs, colleges, branches };
}
