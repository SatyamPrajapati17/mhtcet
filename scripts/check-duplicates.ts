import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.college.findMany({
    select: { id: true, name: true, code: true, slug: true, city: true },
    orderBy: { name: "asc" },
  });

  console.log("Total colleges:", cols.length);

  // Group by name only (ignore code)
  const byName: Record<string, typeof cols> = {};
  for (const c of cols) {
    const n = c.name.toLowerCase().trim();
    if (!byName[n]) byName[n] = [];
    byName[n].push(c);
  }

  console.log("\n=== Colleges sharing the SAME name (potential duplicates) ===");
  let found = false;
  for (const [name, list] of Object.entries(byName)) {
    if (list.length > 1) {
      found = true;
      console.log(`\n"${list[0].name}" (${list.length} entries):`);
      for (const c of list) {
        console.log(`  -> code: ${c.code} | id: ${c.id} | city: ${c.city} | slug: ${c.slug}`);
      }
    }
  }
  if (!found) console.log("(none found)");

  // Also check for very similar names (using first 30 chars)
  console.log("\n=== Similar college name groups (first 30 chars) ===");
  const byPrefix: Record<string, typeof cols> = {};
  for (const c of cols) {
    const prefix = c.name.toLowerCase().trim().slice(0, 30);
    if (!byPrefix[prefix]) byPrefix[prefix] = [];
    byPrefix[prefix].push(c);
  }
  for (const [prefix, list] of Object.entries(byPrefix)) {
    if (list.length > 1) {
      console.log(`\nPrefix "${prefix}..." (${list.length} entries):`);
      for (const c of list) {
        console.log(`  -> "${c.name}" | code: ${c.code} | city: ${c.city}`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
