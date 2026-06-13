"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Brain,
  Search,
  GraduationCap,
  MapPin,
  Info,
  CheckCircle,
  MinusCircle,
  Zap,
  XCircle,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PredictionLevel } from "@/lib/utils";
import Link from "next/link";
import AdUnit from "@/components/AdUnit";

type PredictionData = {
  safe: any[];
  moderate: any[];
  dream: any[];
  noChance: any[];
  metadata: {
    totalPredictions: number;
    inputPercentile: number;
    inputCategory: string;
    inputGender: string | null;
    year: number;
    capRound: number;
    availableYears?: number[];
  };
};

const levelConfig = {
  safe: { label: "Safe Colleges", icon: CheckCircle, badge: "badge-safe" },
  moderate: { label: "Moderate Colleges", icon: MinusCircle, badge: "badge-moderate" },
  dream: { label: "Dream Colleges", icon: Zap, badge: "badge-dream" },
  "no-chance": { label: "Unlikely", icon: XCircle, badge: "badge-no-chance" },
};

function ResultSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-6 w-48" />
      <div className="doppel-outer">
        <div className="doppel-inner p-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/3" />
              </div>
              <div className="skeleton h-8 w-20 rounded-lg ml-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PredictPage() {
  const [percentile, setPercentile] = useState("");
  const [category, setCategory] = useState("GOPENS");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [branchSearch, setBranchSearch] = useState("");
  const [branchOpen, setBranchOpen] = useState(false);
  const [tfws, setTfws] = useState(false);
  const [year, setYear] = useState("2024");
  const [capRound, setCapRound] = useState("3");

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const res = await fetch("/api/colleges/cities");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: branchesData } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await fetch("/api/branches");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data, isLoading, error, refetch } = useQuery<PredictionData>({
    queryKey: ["predict", percentile, category, gender, city, selectedBranches, tfws, year],
    queryFn: async () => {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          percentile: parseFloat(percentile),
          category,
          gender,
          city: city || undefined,
          branches: selectedBranches.length > 0 ? selectedBranches : undefined,
          tfws,
          year: parseInt(year),
          capRound: parseInt(capRound),
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

  const renderResults = (results: any[], level: PredictionLevel) => {
    if (!results || results.length === 0) return null;
    const config = levelConfig[level];
    const Icon = config.icon;

    return (
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-nut-700" />
          <h3 className="text-base font-semibold text-nut-900">{config.label}</h3>
          <span className="text-xs text-nut-400 font-medium ml-auto">
            {results.length} colleges
          </span>
        </div>

        <div className="doppel-outer">
          <div className="doppel-inner !p-1.5 space-y-0.5">
            {results.map((r: any, i: number) => (
              <motion.div
                key={`${r.collegeId}-${r.branchId}-${r.category}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 80, damping: 20 }}
              >
                <Link
                  href={`/colleges/${r.collegeSlug}`}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-cream-100 group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-nut-900 truncate block group-hover:text-terracotta-600 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      {r.collegeName}
                    </span>
                    <span className="text-xs text-nut-400">{r.branchName}</span>
                  </div>
                  <div className="text-right ml-4 shrink-0 flex items-center gap-2">
                    <div>
                      <div className="font-semibold text-nut-900 tabular-nums">
                        {r.closingPercentile.toFixed(2)}%
                      </div>
                      <div className="text-xs text-nut-400">Closing</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-nut-300 group-hover:text-terracotta-500 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] -mr-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* ── Sidebar Form ── */}
        <div>
          <div className="doppel-outer">
            <div className="doppel-inner p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-terracotta-500/10 p-2.5">
                  <Brain className="h-5 w-5 text-terracotta-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-nut-900">College Predictor</h2>
                  <p className="text-xs text-nut-400">Enter your MHT-CET details</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-nut-700 mb-1.5">
                    MHT-CET Percentile <span className="text-terracotta-500">*</span>
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
                    className="input-cream"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nut-700 mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="select-cream">
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

                {/* Gender */}
                <div className="rounded-2xl bg-cream-50 border border-cream-200 p-4">
                  <label className="block text-sm font-medium text-nut-700 mb-1.5">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="select-cream">
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <p className="mt-1.5 text-xs text-nut-400">
                    {gender === "Female"
                      ? "Includes Ladies quota (L-category) seats"
                      : gender === "Male"
                      ? "Shows General category seats"
                      : "Shows all available seats"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nut-700 mb-1.5">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nut-400" />
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="select-cream pl-10">
                      <option value="">All Cities</option>
                      {citiesData ? citiesData.cities?.map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      )) : (
                        <option value="" disabled>Loading...</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-nut-700 mb-1.5">Branches</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nut-400 pointer-events-none z-10" />
                    <button
                      type="button"
                      onClick={() => { setBranchOpen(!branchOpen); setBranchSearch(""); }}
                      className="select-cream pl-10 text-left w-full"
                    >
                      {selectedBranches.length === 0 ? (
                        <span className="text-nut-400">All Branches</span>
                      ) : (
                        <span className="text-nut-700">{selectedBranches.length} branch{selectedBranches.length > 1 ? "es" : ""} selected</span>
                      )}
                    </button>

                    {/* Dropdown positioned relative to the button wrapper */}
                    {branchOpen && branchesData?.branches && (
                      <div className="absolute left-0 right-0 z-50 mt-1.5 doppel-outer">
                        <div className="doppel-inner !p-2 max-h-64 overflow-y-auto space-y-0.5">
                          <div className="sticky top-0 bg-cream-50 pb-1.5">
                            <input
                              type="text"
                              value={branchSearch}
                              onChange={(e) => setBranchSearch(e.target.value)}
                              placeholder="Search branches..."
                              className="input-cream text-sm !py-1.5"
                              autoFocus
                            />
                          </div>
                          {branchesData.branches
                            .filter((b: string) => b.toLowerCase().includes(branchSearch.toLowerCase()))
                            .map((b: string) => {
                              const isSelected = selectedBranches.includes(b);
                              return (
                                <label
                                  key={b}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                                    isSelected
                                      ? "bg-terracotta-500/10 text-terracotta-700"
                                      : "hover:bg-cream-100 text-nut-600"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {
                                      setSelectedBranches((prev) =>
                                        isSelected
                                          ? prev.filter((x) => x !== b)
                                          : [...prev, b]
                                      );
                                    }}
                                    className="h-4 w-4 rounded border-cream-400 text-terracotta-500 focus:ring-terracotta-500 focus:ring-offset-0"
                                  />
                                  <span>{b}</span>
                                </label>
                              );
                            })}
                          {branchesData.branches.filter((b: string) => b.toLowerCase().includes(branchSearch.toLowerCase())).length === 0 && (
                            <p className="text-sm text-nut-400 text-center py-3">No branches match "{branchSearch}"</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected branches as tags */}
                  {selectedBranches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 relative z-[41]">
                      {selectedBranches.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-terracotta-500/10 text-xs font-medium text-terracotta-700"
                        >
                          {b}
                          <button
                            type="button"
                            onClick={() => setSelectedBranches((prev) => prev.filter((x) => x !== b))}
                            className="hover:text-terracotta-900 transition-colors"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setSelectedBranches([]); setBranchOpen(false); }}
                        className="text-xs text-nut-400 hover:text-nut-600 transition-colors px-1"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {/* Click outside overlay — placed outside relative containers so it doesn't interfere */}
                  {branchOpen && (
                    <div className="fixed inset-0 z-40" onClick={() => setBranchOpen(false)} />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-nut-700 mb-1.5">Data Year</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="select-cream">
                      <option value="2024">2024-25</option>
                      <option value="2023">2023-24</option>
                      <option value="2022">2022-23</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nut-700 mb-1.5">CAP Round</label>
                    <select value={capRound} onChange={(e) => setCapRound(e.target.value)} className="select-cream">
                      <option value="0">All Rounds</option>
                      <option value="3">Round 3 (Final)</option>
                      <option value="2">Round 2</option>
                      <option value="1">Round 1</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={tfws}
                    onChange={(e) => setTfws(e.target.checked)}
                    className="h-4 w-4 rounded border-cream-400 text-terracotta-500 focus:ring-terracotta-500 focus:ring-offset-0"
                  />
                  <span className="text-nut-600 group-hover:text-nut-900 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    TFWS (Tuition Fee Waiver)
                  </span>
                </label>

                <motion.button
                  type="submit"
                  disabled={isLoading || !percentile}
                  className="btn-terracotta w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isLoading && percentile ? { scale: 1.01 } : {}}
                  whileTap={!isLoading && percentile ? { scale: 0.97 } : {}}
                >
                  {isLoading ? (
                    <>
                      <Zap className="h-4 w-4 animate-pulse-soft" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Predict Colleges
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="space-y-6">
          {!data && !isLoading && !error && (
            <motion.div
              className="flex flex-col items-center justify-center py-24 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="doppel-outer w-20 h-20 mx-auto mb-6">
                <div className="doppel-inner w-full h-full flex items-center justify-center">
                  <Brain className="h-10 w-10 text-nut-300" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-nut-800">Ready to predict your colleges?</h3>
              <p className="mt-2 text-sm text-nut-400 max-w-sm">
                Enter your MHT-CET percentile and category, then click Predict Colleges.
              </p>
            </motion.div>
          )}

          {error && (
            <Card className="border-terracotta-200 bg-terracotta-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-terracotta-600 shrink-0" />
                <p className="text-sm text-terracotta-700">
                  Failed to fetch predictions. Make sure the database has been seeded.
                </p>
              </div>
            </Card>
          )}

          {isLoading && (
            <div className="space-y-6">
              <div className="doppel-outer">
                <div className="doppel-inner p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="skeleton h-6 w-48" />
                      <div className="skeleton h-4 w-72" />
                    </div>
                    <div className="skeleton h-6 w-28 rounded-full" />
                  </div>
                </div>
              </div>
              <ResultSkeleton />
              <ResultSkeleton />
              <ResultSkeleton />
            </div>
          )}

          {data && (
            <AnimatePresence mode="wait">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              >
                <motion.div
                  className="doppel-outer"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  <div className="doppel-inner p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-nut-900">Prediction Results</h2>
                        <p className="text-sm text-nut-400 mt-1">
                          Based on {data.metadata.inputPercentile} percentile{" "}
                          {data.metadata.inputGender ? `(${data.metadata.inputGender})` : ""}{" "}
                          in {data.metadata.inputCategory} category for{" "}
                          {data.metadata.year}{" "}
                          ({data.metadata.capRound === 0 ? "All Rounds" : `CAP Round ${data.metadata.capRound}`})
                        </p>
                      </div>
                      <Badge className="bg-terracotta-500/10 text-terracotta-600 border-terracotta-200 shrink-0 ml-3">
                        {data.metadata.totalPredictions} matches
                      </Badge>
                    </div>
                  </div>
                </motion.div>

                {data.metadata.totalPredictions === 0 && (
                  <motion.div
                    className="doppel-outer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  >
                    <div className="doppel-inner p-6 border-amber-200">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-terracotta-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-nut-800">
                            No predictions found for {data.metadata.inputCategory} in {data.metadata.year}
                          </p>
                          {data.metadata.availableYears && data.metadata.availableYears.length > 0 ? (
                            <p className="text-sm text-nut-400 mt-1">
                              Data is available for{" "}
                              {data.metadata.availableYears
                                .sort((a: number, b: number) => b - a)
                                .map((y: number) => (
                                  <button
                                    type="button"
                                    key={y}
                                    onClick={() => { setYear(String(y)); setTimeout(() => refetch(), 0); }}
                                    className="underline font-medium text-terracotta-500 hover:text-terracotta-600 mx-0.5"
                                  >
                                    {y}
                                  </button>
                                ))}
                              . Try switching to a different year.
                            </p>
                          ) : (
                            <p className="text-sm text-nut-400 mt-1">
                              This category has no cutoff data in the database.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {data.safe.length > 0 && renderResults(data.safe, "safe")}
                {data.moderate.length > 0 && renderResults(data.moderate, "moderate")}
                {data.dream.length > 0 && renderResults(data.dream, "dream")}
                {data.noChance.length > 0 && renderResults(data.noChance, "no-chance")}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Ad Unit ── */}
      <div className="mt-12 pb-4">
        <AdUnit adSlot="5019828315" format="horizontal" className="max-w-3xl mx-auto" />
      </div>
    </div>
  );
}
