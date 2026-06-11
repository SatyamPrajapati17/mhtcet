/**
 * Script to convert MHT-CET CSV cutoff data into compact JSON for the Flutter app.
 * 
 * Usage: node scripts/convert-csv-to-json.js
 * 
 * Reads CSVs from ../csv/ directory and outputs to ../cet_app/assets/data/mhtcet_data.json
 */
const fs = require("fs");
const path = require("path");

const CSV_DIR = path.join(__dirname, "..", "..", "csv");
const OUTPUT_DIR = path.join(__dirname, "..", "assets", "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "mhtcet_data.json");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Collect all CSV files
const csvFiles = fs.readdirSync(CSV_DIR).filter(
  (f) => f.endsWith(".csv") && !f.startsWith(".")
);

console.log(`Found ${csvFiles.length} CSV files`);

// Data stores
const colleges = new Map(); // code -> {code, name, city?}
const branches = new Map(); // code -> {code, name}
const cutoffs = []; // array of compact cutoff objects

let totalRows = 0;

function parseCSV(content) {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"+|"+$/g, ""));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted fields properly
    const row = {};
    let j = 0;
    let colIdx = 0;
    let current = "";
    let inQuotes = false;
    
    for (let c = 0; c <= lines[i].length; c++) {
      const ch = c < lines[i].length ? lines[i][c] : ",";
      
      if (inQuotes) {
        if (ch === '"') {
          if (c + 1 < lines[i].length && lines[i][c + 1] === '"') {
            current += '"';
            c++; // skip escaped quote
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          if (colIdx < headers.length) {
            row[headers[colIdx]] = current.trim();
          }
          current = "";
          colIdx++;
        } else {
          current += ch;
        }
      }
    }
    
    // Handle last column
    if (headers.length > 0) {
      const lastHeader = headers[headers.length - 1];
      row[lastHeader] = current.trim();
    }
    
    rows.push(row);
  }
  
  return rows;
}

for (const csvFile of csvFiles) {
  const filePath = path.join(CSV_DIR, csvFile);
  console.log(`Processing: ${csvFile}`);
  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCSV(content);
  totalRows += rows.length;
  
  for (const row of rows) {
    const collegeCode = String(row.collegeCode || row.CollegeCode || "").trim();
    let collegeName = row.collegeName || row.CollegeName || "";
    collegeName = collegeName.replace(/^"+|"+$/g, "").trim();
    
    const branchCode = String(row.branchCode || row.BranchCode || "").trim();
    let branchName = row.branchName || row.BranchName || "";
    branchName = branchName.replace(/^"+|"+$/g, "").trim();
    
    const year = parseInt(row.year || row.Year || row.Year);
    const capRound = parseInt(row.capRound || row.CapRound || row.cap_round || 0);
    const category = (row.category || row.Category || "").trim();
    const stage = (row.stage || row.Stage || "I").trim();
    const rank = parseInt(row.rank || row.Rank || row.ClosingRank || 0);
    const percentile = parseFloat(row.percentile || row.Percentile || row.ClosingPercentile || 0);
    const seatLevel = (row.seatLevel || row.SeatLevel || "State Level").trim();
    
    // Extract city from college name (look for patterns like "CollegeName,City")
    let city = "";
    const cityMatch = collegeName.match(/,\s*(.+)$/);
    if (cityMatch) {
      city = cityMatch[1].trim();
    }
    
    if (collegeCode && !colleges.has(collegeCode)) {
      colleges.set(collegeCode, {
        c: collegeCode,
        n: collegeName.replace(/,.*$/, "").trim(),
        t: city, // town/city
      });
    }
    
    if (branchCode && !branches.has(branchCode)) {
      branches.set(branchCode, {
        c: branchCode,
        n: branchName,
      });
    }
    
    if (collegeCode && branchCode && !isNaN(percentile) && percentile > 0) {
      cutoffs.push([
        collegeCode,
        branchCode,
        year,
        capRound,
        category,
        Math.round(percentile * 100), // store as integer to save space (e.g. 95.50 → 9550)
        rank,
      ]);
    }
  }
}

console.log(`\nParsed ${totalRows} total rows`);
console.log(`Colleges: ${colleges.size}`);
console.log(`Branches: ${branches.size}`);
console.log(`Cutoffs: ${cutoffs.length}`);

// Build output JSON
const output = {
  v: 1, // version
  generated: new Date().toISOString(),
  colleges: Array.from(colleges.values()),
  branches: Array.from(branches.values()),
  cutoffs: cutoffs,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
console.log(`\nWritten to: ${OUTPUT_FILE}`);
console.log(`File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
