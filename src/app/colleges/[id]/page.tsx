"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  GraduationCap,
  Loader2,
  ArrowLeft,
  Building2,
  Trophy,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import AdUnit from "@/components/AdUnit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CollegeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["college", id],
    queryFn: async () => {
      const res = await fetch(`/api/colleges/${id}`);
      if (!res.ok) throw new Error("College not found");
      return res.json();
    },
  });

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCapRound, setSelectedCapRound] = useState<number | null>(null);

  // Get available years from data
  const getAvailableYears = () => {
    if (!data?.branches) return [];
    const years: number[] = [];
    for (const branch of data.branches) {
      for (const cut of branch.cutoffs) {
        if (!years.includes(cut.year)) years.push(cut.year);
      }
    }
    return years.sort((a, b) => b - a);
  };
  const availableYears = getAvailableYears();

  // Default to newest year if none selected
  const activeYear = selectedYear ?? (availableYears[0] || null);

  // Get available CAP rounds for the active year
  const getAvailableCapRounds = () => {
    if (!data?.branches || !activeYear) return [];
    const rounds: number[] = [];
    for (const branch of data.branches) {
      for (const cut of branch.cutoffs) {
        if (cut.year === activeYear && !rounds.includes(cut.capRound)) {
          rounds.push(cut.capRound);
        }
      }
    }
    return rounds.sort((a, b) => a - b);
  };
  const availableCapRounds = getAvailableCapRounds();

  // Reset CAP round when year changes if the selected round isn't available
  if (selectedCapRound !== null && !availableCapRounds.includes(selectedCapRound)) {
    setSelectedCapRound(null);
  }

  const activeCapRound = selectedCapRound ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">College not found</h2>
        <Link href="/colleges">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Colleges
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/colleges"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Colleges
      </Link>

      {/* College Header */}
      <Card className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <Badge variant="secondary">{data.code}</Badge>
                  {data.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {data.city}
                    </span>
                  )}
                  {data.status && <Badge>{data.status}</Badge>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {data.naacGrade && (
              <div className="text-center">
                <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
                  <Trophy className="h-4 w-4" />
                  NAAC {data.naacGrade}
                </div>
              </div>
            )}
            {data.nirfRank > 0 && (
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600">
                  NIRF #{data.nirfRank}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Branches & Cutoffs */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Branches &amp; Cutoff History
        </h2>

        {/* Year Filter Tabs */}
        <div className="flex items-center gap-3">
          {availableYears.length > 1 && (
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {availableYears.map((year: number) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setSelectedCapRound(null);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                    activeYear === year
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  {year}-{String(year + 1).slice(2)}
                </button>
              ))}
            </div>
          )}

          {/* CAP Round Filter Tabs */}
          {availableCapRounds.length > 1 && (
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setSelectedCapRound(null)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  activeCapRound === null
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                All Rounds
              </button>
              {availableCapRounds.map((round: number) => (
                <button
                  key={round}
                  onClick={() => setSelectedCapRound(round)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                    activeCapRound === round
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  CAP {round}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {data.branches?.map((branch: any) => {
          const filteredCutoffs = branch.cutoffs.filter((c: any) => {
            if (activeYear && c.year !== activeYear) return false;
            if (activeCapRound && c.capRound !== activeCapRound) return false;
            return true;
          });

          if (filteredCutoffs.length === 0) return null;

          return (
            <Card key={branch.branchId}>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{branch.branchName}</h3>
                  <span className="text-xs text-gray-500">{branch.branchCode}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-gray-500">
                      <th className="pb-2 pr-4">Year</th>
                      <th className="pb-2 pr-4">CAP Round</th>
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4 text-right">Opening %ile</th>
                      <th className="pb-2 pr-4 text-right">Closing %ile</th>
                      <th className="pb-2 text-right">Closing Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCutoffs.map((cut: any, i: number) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 pr-4 font-medium">{cut.year}</td>
                        <td className="py-2 pr-4">CAP {cut.capRound}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="secondary">{cut.category}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-right">
                          {cut.openingPercentile?.toFixed(2)}%
                        </td>
                        <td className="py-2 pr-4 text-right font-medium">
                          {cut.closingPercentile?.toFixed(2)}%
                        </td>
                        <td className="py-2 text-right text-gray-500">
                          {cut.closingRank?.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

        {(!data.branches || data.branches.length === 0) && (
          <div className="py-12 text-center text-gray-500">
            No cutoff data available for this college.
            Please ensure the database has been seeded.
          </div>
        )}
      </div>

      {/* ── Ad Unit ── */}
      <div className="mt-12 pb-4">
        <AdUnit adSlot="5019828315" format="horizontal" className="max-w-3xl mx-auto" />
      </div>
    </div>
  );
}
