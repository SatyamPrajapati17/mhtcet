import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://cetcounsel-ai.vercel.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/predict`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/colleges`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/feedback`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic college pages
  try {
    const colleges = await prisma.college.findMany({
      select: { slug: true, updatedAt: true },
    });

    const collegePages: MetadataRoute.Sitemap = colleges.map((college) => ({
      url: `${baseUrl}/colleges/${college.slug}`,
      lastModified: college.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...collegePages];
  } catch {
    // If DB is unavailable, return just static pages
    return staticPages;
  }
}
