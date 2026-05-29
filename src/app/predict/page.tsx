"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, Loader2, AlertCircle, MapPin, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPredictionColor, getPredictionLabel, type PredictionLevel } from "@/lib/utils";
import type { PredictionResult } from "@/lib/prediction-engine";
import Link from "next/link";

type PredictionData = {
  safe: any[];
  moderate: any[];
  dream: any[];
  noChance: any[];
  metadata: {
    totalPredictions: number;
    inputPercentile: number;
    inputCategory: string;
    year: number;
    capRound: number;
  };
};

export default function PredictPage() {
  const [percentile, setPercentile] = useState("");
  const [category, setCategory] = useState("GOPENS");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("");
  const [tfws, setTfws] = useState(false);
  const [year, setYear] = useState("2024");

  // Fetch cities for the dropdown
  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const res = await fetch("/api/colleges/cities");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Fetch branches for the dropdown
  const { data: branchesData } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await fetch("/api/branches");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<PredictionData>({
    queryKey: ["predict", percentile, category, gender, city, branch, tfws, year],
    queryFn: async () => {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          percentile: parseFloat(percentile),
          category,
          gender,
          city: city || undefined,
          branch: branch || undefined,
          tfws,
          year: parseInt(year),
          capRound: 3,
        }),
      });
      if (!res.ok) throw new Error("Failed to get predictions");
      return res.json();
    },
    enabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (percentile) refetch();
  };

  const renderResults = (results: any[], level: PredictionLevel, icon: string) => {
    if (!results || results.length === 0) return null;
    return (
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <span>{icon}</span>
          {getPredictionLabel(level)} ({results.length})
        </h3>
        <div className={`rounded-lg border p-1 ${getPredictionColor(level)}`}>
          {results.map((r: any, i: number) => (
            <Link
              key={`${r.collegeId}-${r.branchId}-${r.category}-${i}`}
              href={`/colleges/${r.collegeSlug}`}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-white/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block">{r.collegeName}</span>
                <span className="text-xs opacity-70">{r.branchName}</span>
              </div>
              <div className="text-right ml-4 shrink-0">
                <div className="font-medium">{r.closingPercentile.toFixed(2)}%</div>
                <div className="text-xs opacity-70">Closing</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Sidebar Form */}
        <div>
          <Card className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-blue-100 p-2">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">College Predictor</h2>
                <p className="text-sm text-gray-500">Enter your details</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MHT-CET Percentile *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentile}
                  onChange={(e) => setPercentile(e.target.value)}
                  placeholder="e.g. 95.50"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="GOPENS">Open (General)</option>
                  <option value="GSCS">SC</option>
                  <option value="GSTS">ST</option>
                  <option value="GVJS">VJ</option>
                  <option value="GNT1S">NT1</option>
                  <option value="GNT2S">NT2</option>
                  <option value="GNT3S">NT3</option>
                  <option value="GOBCS">OBC</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="">All Cities</option>
                    {citiesData ? citiesData.cities?.map((c: string) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )) : (
                      <option value="" disabled>Loading...</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="">All Branches</option>
                    {branchesData ? branchesData.branches?.map((b: string) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    )) : (
                      <option value="" disabled>Loading...</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="2024">2024-25</option>
                  <option value="2023">2023-24</option>
                  <option value="2022">2022-23</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={tfws}
                  onChange={(e) => setTfws(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>TFWS (Tuition Fee Waiver)</span>
              </label>

              <Button
                type="submit"
                disabled={isLoading || !percentile}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Predict Colleges
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {!data && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Brain className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">
                Ready to predict your colleges?
              </h3>
              <p className="mt-2 text-gray-500 max-w-md">
                Enter your MHT-CET percentile and category, then click
                "Predict Colleges" to get your personalized college list.
              </p>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700">
                  Failed to fetch predictions. Please make sure the database has been seeded with data.
                </p>
              </div>
            </Card>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">
                Analyzing cutoffs for your profile...
              </span>
            </div>
          )}

          {data && (
            <div className="space-y-6 animate-fade-in">
              {/* Metadata */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Prediction Results
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on {data.metadata.inputPercentile} percentile in{" "}
                      {data.metadata.inputCategory} category for year{" "}
                      {data.metadata.year}
                    </p>
                  </div>
                  <Badge variant="purple">
                    {data.metadata.totalPredictions} matches found
                  </Badge>
                </div>
              </Card>

              {/* Safe */}
              {data.safe.length > 0 && renderResults(data.safe, "safe", "🟢")}
              {data.moderate.length > 0 && renderResults(data.moderate, "moderate", "🔵")}
              {data.dream.length > 0 && renderResults(data.dream, "dream", "🟡")}
              {data.noChance.length > 0 && renderResults(data.noChance, "no-chance", "🔴")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
