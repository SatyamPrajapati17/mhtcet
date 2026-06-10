import fs from "fs";
import path from "path";
import { parsePDFFile } from "./pdf-parser";

const ROOT = path.resolve(__dirname, "..");
const PDF_DIR = ROOT;
const OUT_DIR = path.join(ROOT, "csv");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

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

function escapeCSV(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

async function main() {
  const summary: Array<{ file: string; colleges: number; branches: number; rows: number; csv: string }> = [];

  for (const pdf of PDF_FILES) {
    const pdfPath = path.join(PDF_DIR, pdf);
    if (!fs.existsSync(pdfPath)) {
      console.log(`MISSING: ${pdfPath}`);
      continue;
    }
    const { cutoffs, colleges, branches } = await parsePDFFile(pdfPath);
    const csvPath = path.join(OUT_DIR, pdf.replace(/\.pdf$/i, ".csv"));

    const headers = [
      "collegeCode",
      "collegeName",
      "branchCode",
      "branchName",
      "year",
      "capRound",
      "category",
      "stage",
      "rank",
      "percentile",
      "seatLevel",
    ];
    const lines = [headers.join(",")];
    for (const c of cutoffs) {
      lines.push(
        [
          c.collegeCode,
          c.collegeName,
          c.branchCode,
          c.branchName,
          c.year,
          c.capRound,
          c.category,
          c.stage,
          c.rank,
          c.percentile,
          c.seatLevel,
        ]
          .map(escapeCSV)
          .join(",")
      );
    }
    fs.writeFileSync(csvPath, lines.join("\n"), "utf8");

    summary.push({
      file: pdf,
      colleges: colleges.size,
      branches: branches.size,
      rows: cutoffs.length,
      csv: path.basename(csvPath),
    });
  }

  console.log("\n===== SUMMARY =====");
  for (const s of summary) {
    console.log(
      `${s.file} -> ${s.csv} | colleges=${s.colleges}, branches=${s.branches}, rows=${s.rows}`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
