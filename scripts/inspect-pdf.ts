import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

async function main() {
  // Dump first PDF to text file for analysis
  const pdfPath = path.join(process.cwd(), "2024ENGG_CAP1_CutOff.pdf");
  const buffer = fs.readFileSync(pdfPath);
  
  const data = await pdfParse(buffer);
  
  // Write all text to a file so we can read it properly
  const outPath = path.join(process.cwd(), "pdf-dump.txt");
  fs.writeFileSync(outPath, data.text, "utf-8");
  
  console.log(`Dumped ${data.text.length} chars to pdf-dump.txt`);
  console.log(`Pages: ${data.numpages}`);
}

main().catch(console.error);
