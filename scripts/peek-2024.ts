import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

async function main() {
  const file = path.resolve(__dirname, "..", "2024ENGG_CAP1_CutOff.pdf");
  const buf = fs.readFileSync(file);
  const data = await pdf(buf);
  const lines = data.text.split("\n").map((l) => l.trimEnd());
  console.log("TOTAL LINES:", lines.length);
  for (let i = 0; i < Math.min(200, lines.length); i++) {
    console.log(String(i).padStart(4), "|", lines[i]);
  }
}
main();
