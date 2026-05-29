import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCSVFile } from "@/lib/csv-parser";
import { slugify } from "@/lib/utils";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadPath = path.join(process.cwd(), "uploads", file.name);
    await writeFile(uploadPath, buffer);

    // Parse CSV
    const { cutoffs, colleges: collegeMap, branches: branchMap } = parseCSVFile(uploadPath);

    // Clear existing data
    await prisma.cutoff.deleteMany();
    await prisma.seatMatrix.deleteMany();
    await prisma.college.deleteMany();
    await prisma.branch.deleteMany();

    // Insert colleges
    const collegeRecords: Record<string, string> = {};
    for (const [code, info] of collegeMap) {
      const slug = slugify(`${code}-${info.name}`);
      const college = await prisma.college.create({
        data: { code, name: info.name, slug, city: "" },
      });
      collegeRecords[code] = college.id;
    }

    // Insert branches
    const branchRecords: Record<string, string> = {};
    for (const [code, info] of branchMap) {
      const existing = await prisma.branch.findUnique({ where: { code } });
      if (existing) {
        branchRecords[code] = existing.id;
      } else {
        const branch = await prisma.branch.create({
          data: { code, name: info.name },
        });
        branchRecords[code] = branch.id;
      }
    }

    // Insert cutoffs in batches
    const BATCH_SIZE = 500;
    let inserted = 0;
    for (let i = 0; i < cutoffs.length; i += BATCH_SIZE) {
      const batch = cutoffs.slice(i, i + BATCH_SIZE);
      const records = batch
        .filter((cut) => collegeRecords[cut.collegeCode] && branchRecords[cut.branchCode])
        .map((cut) => ({
          year: cut.year,
          capRound: cut.capRound,
          stage: cut.stage,
          collegeId: collegeRecords[cut.collegeCode],
          branchId: branchRecords[cut.branchCode],
          category: cut.category,
          openingRank: cut.rank,
          closingRank: cut.rank,
          openingPercentile: cut.percentile,
          closingPercentile: cut.percentile,
        }));

      if (records.length > 0) {
        await prisma.cutoff.createMany({ data: records });
        inserted += records.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${inserted} records from ${cutoffs.length} parsed entries`,
      stats: {
        colleges: Object.keys(collegeRecords).length,
        branches: Object.keys(branchRecords).length,
        cutoffs: inserted,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process CSV upload" },
      { status: 500 }
    );
  }
}
