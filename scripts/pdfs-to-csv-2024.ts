import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "csv");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PDF_FILES = [
  "2024ENGG_CAP1_CutOff.pdf",
  "2024ENGG_CAP2_CutOff.pdf",
  "2024ENGG_CAP3_CutOff.pdf",
];

const KNOWN_CATEGORIES = [
  "PWDROBC", "PWDOPEN", "PWDROBCS", "PWDOPENH", "PWDOPENO", "PWDOPENC",
  "PWDRS", "PWDRSCS", "PWDRSH", "PWDRSO", "PWDRSC",
  "PWDOBCS", "PWDOBCH", "PWDOBCO", "PWDOBCC",
  "PWDS",
  "DEFROBC", "DEFROBCS", "DEFROBCH", "DEFROBCO", "DEFROBCC",
  "DEFROPEN", "DEFOPEN", "DEFOBCS", "DEFOBCH", "DEFOBCO", "DEFOBCC",
  "DEFRS", "DEFRSCS", "DEFRSH", "DEFRSO", "DEFRSC",
  "DEFRNT1S", "DEFRNT1H", "DEFRNT1O", "DEFRNT1C",
  "SDEFOPEN", "SDEF",
  "ORPHAN", "ORPHANS", "ORPHANH", "ORPHANO", "ORPHANC",
  "GNT1", "GNT2", "GNT3",
  "LNT1", "LNT2", "LNT3",
  "GSEBC", "GSEBCS", "LSEBC", "LSEBCS", "LSEBCH", "LSEBCO", "LSEBCC",
  "EBCS", "EBC",
  "GSBC", "SBC",
  "GOBC", "LOBC",
  "GVJ", "LVJ",
  "GST", "LST",
  "GSC", "LSC",
  "GOPEN", "LOPEN",
  "GTFWS", "TFWS", "LTFWS", "LTFW",
  "GEWS", "EWS",
  "STFWS",
  "GPWD", "PWD",
  "GNT", "LNT",
  "GSBS", "SBS",
  "GS", "LS",
];
const SUFFIXES = ["S", "H", "O", "C", ""];
const ALL_TOKENS = (() => {
  const s = new Set<string>();
  for (const b of KNOWN_CATEGORIES) for (const sf of SUFFIXES) s.add(b + sf);
  return Array.from(s).sort((a, b) => b.length - a.length);
})();

function tokenizeCats(raw: string): string[] {
  let s = raw.toUpperCase().trim();
  const out: string[] = [];
  while (s.length > 0) {
    let hit = false;
    for (const t of ALL_TOKENS) {
      if (s.startsWith(t)) { out.push(t); s = s.slice(t.length); hit = true; break; }
    }
    if (!hit) s = s.slice(1);
  }
  return out;
}

function escapeCSV(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function extractSectionInfo(filename: string) {
  const m = filename.match(/(\d{4})ENGG_CAP(\d+)_CutOff/);
  if (!m) throw new Error("bad filename " + filename);
  return { year: parseInt(m[1]), capRound: parseInt(m[2]) };
}

function isStatusLine(line: string) {
  const t = line.trim();
  return t === "Status:" || /^Status:/i.test(t);
}

function isStatusBody(line: string) {
  const t = line.trim();
  if (!t) return false;
  if (t === "State Level") return false;
  if (/^Stage\s*$/i.test(t)) return false;
  if (/^\d/.test(t)) return false; // ranks
  if (/^\(/.test(t)) return false; // percentile
  // Should contain "University" or "Government" etc.
  return /(Government|Autonomous|Home University|Aided|Un-Aided|Private|Institute)/i.test(t);
}

function isSeatLevelLine(line: string) {
  const t = line.trim();
  if (t === "State Level") return true;
  if (t.startsWith("State Level")) return true;
  if (t.startsWith("Home University")) return true;
  if (t.startsWith("Other Than Home University")) return true;
  if (t.startsWith("All India")) return true;
  if (t.startsWith("Institute Level")) return true;
  return false;
}

function isStageLine(line: string) {
  const t = line.trim();
  return /^I{1,3}$/.test(t) || /^I\s*$/.test(t) || /^\s*I\s*$/.test(t);
}

function isStageLabelLine(line: string) {
  return /^Stage\s*$/i.test(line.trim());
}

function isPercentileLine(line: string) {
  return /^\s*\(/.test(line);
}

function isSingleNumericLine(line: string) {
  return /^\s*\d+\s*$/.test(line);
}

function looksLikeCategoryHeader(line: string) {
  const t = line.trim();
  if (t.length < 5) return false;
  const tokens = tokenizeCats(t);
  return tokens.length >= 2;
}

// College code: 4-5 digits, optional leading zero. E.g. 1002, 01002, 02011
function extractCollege(line: string) {
  const m = line.trim().match(/^(0?\d{4})\s*-\s*(.+)$/);
  if (!m) return null;
  const code = m[1].replace(/^0+/, "") || "0"; // strip leading zeros, keep at least "0"
  // Avoid matching branch codes (10+ digits)
  if (line.trim().match(/^(0?\d{4})\s*-/) && !/^\d{6,}/.test(line.trim())) {
    return { code, name: m[2].trim() };
  }
  return null;
}

// Branch code: 10-11 digits. College(4-5) + branch(4-6) — pattern from 2024 is e.g. 0100219110 (10 digits)
function extractBranch(line: string) {
  const m = line.trim().match(/^(\d{9,11})\s*-\s*(.+)$/);
  if (!m) return null;
  return { code: m[1], name: m[2].trim() };
}

async function parseOne(filePath: string) {
  const filename = path.basename(filePath);
  const { year, capRound } = extractSectionInfo(filename);
  console.log(`\n=== ${filename} (${year}, CAP${capRound}) ===`);

  const buf = fs.readFileSync(filePath);
  const data = await pdf(buf);
  const lines = data.text.split("\n").map((l) => l.trimEnd());

  const rows: any[] = [];
  const colleges = new Map<string, { code: string; name: string }>();
  const branches = new Map<string, { code: string; name: string }>();

  let cCode = "", cName = "", bCode = "", bName = "";
  let seatLevel = "";
  let cats: string[] = [];
  let stage = "I";
  let rankBufs: number[] = []; // Array to hold multiple rank values
  let percentilesBuf: number[] = []; // Array to hold multiple percentile values
  let catAccum = ""; // multi-line category header accumulator
  const pending: Array<{ category: string; rank: number; percentile: number }> = [];

  function flushPending() {
    // Handle pending items that have individual rank/percentile
    for (const pr of pending) {
      rows.push({
        collegeCode: cCode, collegeName: cName,
        branchCode: bCode, branchName: bName,
        year, capRound, category: pr.category, stage,
        rank: pr.rank, percentile: pr.percentile, seatLevel,
      });
    }
    pending.length = 0;

    // Handle rankBufs array (multiple ranks for categories)
    if (rankBufs.length > 0 && cats.length > 0) {
      // Assign each rank to its corresponding category
      for (let j = 0; j < Math.min(rankBufs.length, cats.length); j++) {
        rows.push({
          collegeCode: cCode, collegeName: cName,
          branchCode: bCode, branchName: bName,
          year, capRound, category: cats[j], stage,
          rank: rankBufs[j], percentile: 0, seatLevel, // percentile will be set later
        });
      }
      rankBufs = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t) continue;

    // Skip headers
    if (
      t.includes("State Common Entrance Test Cell") ||
      t.includes("Government of Maharashtra") ||
      t.includes("Cut Off List") ||
      t.includes("Cut Off Indicates") ||
      t.includes("Figures in bracket") ||
      t === "D" || t === "i" || t === "r" ||
      /^\d+$/.test(t) && t.length <= 4 && !isSingleNumericLine(t) // standalone page numbers handled below
    ) {
      if (/^\d+$/.test(t) && t.length <= 4 && (i === 0 || !lines[i-1]?.trim())) continue;
    }
    if (t === "D" || t === "i" || t === "r") continue;
    if (t.startsWith("www.")) continue;
    if (t.includes("Directorate of Technical Education")) continue;
    if (/^Page \d+/.test(t)) continue;

    // Branch first (longer code pattern)
    const branch = extractBranch(raw);
    if (branch) {
      flushPending();
      bCode = branch.code; bName = branch.name;
      seatLevel = ""; cats = []; stage = "I";
      catAccum = ""; rankBuf = null;
      if (!branches.has(bCode)) branches.set(bCode, { code: bCode, name: bName });
      continue;
    }

    // College
    const college = extractCollege(raw);
    if (college) {
      flushPending();
      cCode = college.code; cName = college.name;
      bCode = ""; bName = ""; seatLevel = ""; cats = []; stage = "I";
      catAccum = ""; rankBuf = null;
      if (!colleges.has(cCode)) colleges.set(cCode, { code: cCode, name: cName });
      continue;
    }

    if (!cCode) continue;

    // Status
    if (isStatusLine(raw)) continue;
    if (isStatusBody(raw)) continue;

    // Seat level
    if (isSeatLevelLine(raw)) {
      flushPending();
      seatLevel = t;
      cats = []; stage = "I"; catAccum = ""; rankBuf = null;
      continue;
    }

    if (isStageLabelLine(raw)) continue;

    // Stage
    if (isStageLine(raw)) {
      flushPending();
      stage = t.replace(/\s+/g, "");
      rankBuf = null;
      continue;
    }

    // Check if this is a stage header line (like "Stage  GOPENS GSCS GSTS...")
    if (/^Stage\s+/i.test(t)) {
      // Extract category tokens from the rest of the line
      const stagePart = t.substring(5).trim(); // Remove "Stage"
      const stageCats = tokenizeCats(stagePart);
      if (stageCats.length >= 2) {
        flushPending();
        cats = stageCats;
        rankBuf = null;
        rankBufs = []; // Clear rank buffers
        percentilesBuf = []; // Clear percentiles buffer
        // Don't continue yet - we need to look for the stage value and ranks on next lines
        continue;
      }
    }

    // Check if this line contains percentile values (in parentheses) - these come after rank line
    if (cats.length > 0 && rankBufs.length > 0 && percentilesBuf.length === 0) {
      // Extract all percentile values from parentheses
      const percentileMatches = t.match(/\(([\d.]+)\)/g);
      if (percentileMatches) {
        const percentiles = percentileMatches.map(m => parseFloat(m.slice(1, -1)));

        // Create entries for each category with its rank and percentile
        const count = Math.min(cats.length, rankBufs.length, percentiles.length);
        for (let j = 0; j < count; j++) {
          rows.push({
            collegeCode: cCode, collegeName: cName,
            branchCode: bCode, branchName: bName,
            year, capRound, category: cats[j], stage,
            rank: rankBufs[j], percentile: percentiles[j], seatLevel,
          });
        }

        // Clear buffers after processing
        rankBufs = [];
        percentilesBuf = [];
        continue;
      }
    }

    // Check if this is a stage value line (like "I" or "II" or "III") - this contains ranks
    if (isStageLine(t) && cats.length > 0) {
      // Extract stage value (I, II, III) and rank numbers
      const parts = t.split(/\s+/);
      stage = parts[0].replace(/\s+/g, ""); // First part is the stage (I, II, III)

      // Remaining parts should be rank numbers
      const rankParts = parts.slice(1).filter(part => /^\d+$/.test(part));
      if (rankParts.length > 0) {
        rankBufs = rankParts.map(part => parseInt(part, 10));
      }
      continue;
    }

    // Category header (possibly multi-line — accumulate until >=2 valid tokens)
    if (catAccum) {
      const combinedTokens = tokenizeCats(catAccum + t);
      if (combinedTokens.length >= 2 && combinedTokens.length > tokenizeCats(catAccum).length) {
        catAccum = catAccum + t;
        cats = tokenizeCats(catAccum);
        catAccum = "";
        rankBuf = null;
        continue;
      }
      // try appending
      catAccum = catAccum + t;
      const tt = tokenizeCats(catAccum);
      if (tt.length >= 2) {
        cats = tt;
        catAccum = "";
        rankBuf = null;
        continue;
      }
      // if we've accumulated something ridiculous, drop
      if (catAccum.length > 200) catAccum = "";
    }
    if (looksLikeCategoryHeader(raw)) {
      const toks = tokenizeCats(t);
      if (toks.length >= 2) {
        flushPending();
        cats = toks;
        rankBuf = null;
        continue;
      }
      // short token count — start accumulator
      catAccum = t;
      continue;
    }

      }

  flushPending();

  console.log(`  colleges=${colleges.size}, branches=${branches.size}, rows=${rows.length}`);
  if (rows.length > 0) {
    console.log(`  sample: ${JSON.stringify(rows[0])}`);
  }

  // Write CSV
  const csvPath = path.join(OUT_DIR, filename.replace(/\.pdf$/i, ".csv"));
  const headers = ["collegeCode","collegeName","branchCode","branchName","year","capRound","category","stage","rank","percentile","seatLevel"];
  const out = [headers.join(",")];
  for (const r of rows) {
    out.push(headers.map((h) => escapeCSV((r as any)[h])).join(","));
  }
  fs.writeFileSync(csvPath, out.join("\n"), "utf8");
  console.log(`  wrote: ${path.basename(csvPath)}`);
  return { colleges: colleges.size, branches: branches.size, rows: rows.length };
}

async function main() {
  const summary: any[] = [];
  for (const f of PDF_FILES) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) { console.log("MISSING:", f); continue; }
    const s = await parseOne(p);
    summary.push({ file: f, ...s });
  }
  console.log("\n===== 2024 SUMMARY =====");
  for (const s of summary) console.log(s);
}
main().catch((e) => { console.error(e); process.exit(1); });
