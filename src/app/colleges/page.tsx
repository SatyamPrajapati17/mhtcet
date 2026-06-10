"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  GraduationCap,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function CollegeSkeleton() {
  return (
    <div className="doppel-outer">
      <div className="doppel-inner p-6 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-4 w-1/3" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full shrink-0 ml-2" />
        </div>
        <div className="skeleton h-4 w-1/4" />
      </div>
    </div>
  );
}

export default function CollegesPage() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [page, setPage] = useState(1);

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const res = await fetch("/api/colleges/cities");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["colleges", searchQuery, selectedCity, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCity) params.set("city", selectedCity);
      params.set("page", String(page));
      params.set("limit", "30");
      const res = await fetch(`/api/colleges?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
    setPage(1);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-2xl bg-terracotta-500/10 p-3">
            <Building2 className="h-6 w-6 text-terracotta-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-nut-900">MHT-CET Colleges</h1>
            <p className="text-sm text-nut-400">
              Browse and search through all engineering colleges in Maharashtra
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nut-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleges by name, code, or city..."
              className="input-cream pl-10"
            />
          </div>
          <div className="relative sm:w-56">
            <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-nut-400 pointer-events-none" />
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="select-cream pl-10"
            >
              <option value="">All Cities</option>
              {citiesData ? citiesData.cities?.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              )) : (
                <option value="" disabled>Loading...</option>
              )}
            </select>
          </div>
          <motion.button
            type="submit"
            className="btn-terracotta"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
          >
            <Search className="h-4 w-4" />
            Search
          </motion.button>
        </form>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CollegeSkeleton key={i} />
          ))}
        </div>
      ) : data?.colleges?.length > 0 ? (
        <>
          <motion.p
            className="mb-4 text-sm text-nut-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Showing {(page - 1) * 30 + 1}-
            {Math.min(page * 30, data.pagination.total)} of{" "}
            {data.pagination.total} colleges
          </motion.p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {data.colleges.map((college: any, i: number) => (
                <motion.div
                  key={college.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.03,
                    type: "spring",
                    stiffness: 80,
                    damping: 18,
                  }}
                >
                  <Link href={`/colleges/${college.slug}`}>
                    <div className="doppel-outer group cursor-pointer">
                      <div className="doppel-inner p-6 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-nut-900 group-hover:text-terracotta-500 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] truncate">
                              {college.name}
                            </h3>
                            {college.city && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-nut-400">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {college.city}
                              </div>
                            )}
                          </div>
                          <Badge className="bg-cream-100 text-nut-500 border-cream-300 shrink-0 ml-2">
                            {college.code}
                          </Badge>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-nut-400">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {college.cutoffCount} cutoff records
                          <ArrowRight className="h-3 w-3 ml-auto text-nut-300 group-hover:text-terracotta-500 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {data.pagination.totalPages > 1 && (
            <motion.div
              className="mt-8 flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                Previous
              </motion.button>
              <span className="text-sm font-medium text-nut-500 tabular-nums">
                Page {page} of {data.pagination.totalPages}
              </span>
              <motion.button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
                className="btn-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                Next
                <span className="btn-icon-wrap">
                  <ArrowRight className="h-3.5 w-3.5 text-cream-50" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center py-24 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="doppel-outer w-20 h-20 mx-auto mb-6">
            <div className="doppel-inner w-full h-full flex items-center justify-center">
              <Building2 className="h-10 w-10 text-nut-300" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-nut-800">No colleges found</h3>
          <p className="mt-2 text-sm text-nut-400 max-w-sm">
            Try a different search term or browse all colleges.
          </p>
        </motion.div>
      )}
    </div>
  );
}
