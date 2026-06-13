"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2, Plus, X, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdUnit from "@/components/AdUnit";

type CompareData = {
  colleges: Array<{
    college: {
      id: string;
      name: string;
      slug: string;
      city: string;
      fees: number;
      naacGrade: string;
      nirfRank: number;
    };
    cutoffs: Array<{
      year: number;
      capRound: number;
      category: string;
      branchName: string;
      closingPercentile: number;
      openingPercentile: number;
    }>;
  }>;
};

export default function ComparePage() {
  const [collegeSlugs, setCollegeSlugs] = useState<string[]>(["", ""]);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);

  const activeSearchQuery = activeSearchIndex !== null ? collegeSlugs[activeSearchIndex] : "";

  const { data: searchResults } = useQuery({
    queryKey: ["colleges-search", activeSearchQuery],
    queryFn: async () => {
      if (!activeSearchQuery) return { colleges: [] };
      const res = await fetch(`/api/colleges?q=${encodeURIComponent(activeSearchQuery)}&limit=10`);
      return res.json();
    },
    enabled: activeSearchQuery.length > 0,
  });

  const idsToCompare = collegeSlugs.filter(Boolean);

  const { data, isLoading, error, refetch } = useQuery<CompareData>({
    queryKey: ["compare", idsToCompare],
    queryFn: async () => {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeIds: idsToCompare }),
      });
      if (!res.ok) throw new Error("Failed to compare");
      return res.json();
    },
    enabled: false,
  });

  const addSlot = () => {
    if (collegeSlugs.length < 4) setCollegeSlugs([...collegeSlugs, ""]);
  };

  const removeSlot = (index: number) => {
    if (collegeSlugs.length > 2) {
      setCollegeSlugs(collegeSlugs.filter((_, i) => i !== index));
    }
  };

  const updateSlot = (index: number, value: string) => {
    const newSlugs = [...collegeSlugs];
    newSlugs[index] = value;
    setCollegeSlugs(newSlugs);
    setActiveSearchIndex(index);
  };

  const selectCollege = (index: number, slug: string) => {
    const newSlugs = [...collegeSlugs];
    newSlugs[index] = slug;
    setCollegeSlugs(newSlugs);
    setActiveSearchIndex(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl bg-emerald-100 p-3">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">College Comparison</h1>
            <p className="text-gray-600">
              Compare up to 4 colleges side by side
            </p>
          </div>
        </div>
      </div>

      {/* College Selector */}
      <Card className="mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collegeSlugs.map((slug, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  College {index + 1}
                </label>
                {collegeSlugs.length > 2 && (
                  <button
                    onClick={() => removeSlot(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => updateSlot(index, e.target.value)}
                  onFocus={() => setActiveSearchIndex(index)}
                  placeholder="College name or slug..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              {activeSearchIndex === index && searchResults?.colleges?.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg">
                  {searchResults.colleges.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => selectCollege(index, c.slug)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {collegeSlugs.length < 4 && (
            <button
              onClick={addSlot}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-3 text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add College
            </button>
          )}
        </div>

        <Button
          onClick={() => refetch()}
          disabled={idsToCompare.length < 2 || isLoading}
          className="mt-4 w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <BarChart3 className="mr-2 h-4 w-4" />
              Compare ({idsToCompare.length} colleges)
            </>
          )}
        </Button>
      </Card>

      {/* Results */}
      {data && data.colleges.length > 0 && (
        <div className="animate-fade-in space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 pr-4 text-left font-medium text-gray-500 w-40">
                    Details
                  </th>
                  {data.colleges.map((c) => (
                    <th key={c.college.id} className="py-3 px-4 text-left font-semibold text-gray-900 min-w-[200px]">
                      {c.college.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 pr-4 text-gray-500">City</td>
                  {data.colleges.map((c) => (
                    <td key={c.college.id} className="py-3 px-4">{c.college.city || "-"}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 pr-4 text-gray-500">NAAC Grade</td>
                  {data.colleges.map((c) => (
                    <td key={c.college.id} className="py-3 px-4">
                      <Badge variant={c.college.naacGrade ? "purple" : "secondary"}>
                        {c.college.naacGrade || "N/A"}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 pr-4 text-gray-500">NIRF Rank</td>
                  {data.colleges.map((c) => (
                    <td key={c.college.id} className="py-3 px-4 font-medium">
                      {c.college.nirfRank > 0 ? `#${c.college.nirfRank}` : "-"}
                    </td>
                  ))}
                </tr>

                {/* Cutoffs */}
                {data.colleges[0]?.cutoffs?.slice(0, 10).map((cut, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-500 text-xs">
                      {cut.year} CAP{cut.capRound} - {cut.branchName}
                    </td>
                    {data.colleges.map((c) => {
                      const matchingCut = c.cutoffs.find(
                        (cc) =>
                          cc.year === cut.year &&
                          cc.capRound === cut.capRound &&
                          cc.branchName === cut.branchName
                      );
                      return (
                        <td key={c.college.id} className="py-2 px-4">
                          {matchingCut ? (
                            <span className="font-medium">
                              {matchingCut.closingPercentile.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Ad Unit ── */}
      <div className="mt-12 pb-4">
        <AdUnit adSlot="5019828315" format="horizontal" className="max-w-3xl mx-auto" />
      </div>

      {!data && !isLoading && data !== null && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">
            Compare colleges side by side
          </h3>
          <p className="mt-2 text-gray-500 max-w-md">
            Enter college names or slugs above and click "Compare" to see
            their details side by side.
          </p>
        </div>
      )}
    </div>
  );
}
