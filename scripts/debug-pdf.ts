import fs from "fs";
import pdf from "pdf-parse";

async function main() {
  const buf = fs.readFileSync("2022ENGG_CAP1_CutOff.pdf");
  const data = await pdf(buf);
  const lines = data.text.split("\n");

  // Find first occurrence of college 1002
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("1002 -") || lines[i].includes("1002-")) {
      console.log("FOUND '1002' at line", i);
      for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 60); j++) {
        console.log(j + ': "' + lines[j] + '"');
      }
      break;
    }
  }
}

main().catch(console.error);
