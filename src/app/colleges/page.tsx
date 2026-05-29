"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, MapPin, Loader2, Building2, GraduationCap, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CollegesPage() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [page, setPage] = useState(1);

  // Fetch cities for the dropdown
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl bg-blue-100 p-3">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MHT-CET Colleges</h1>
            <p className="text-gray-600">
              Browse and search through all engineering colleges
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleges by name, code, or city..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
          <div className="relative sm:w-56">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all cursor-pointer"
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
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : data?.colleges?.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-500">
            Showing {(page - 1) * 30 + 1}-
            {Math.min(page * 30, data.pagination.total)} of{" "}
            {data.pagination.total} colleges
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.colleges.map((college: any) => (
              <Link key={college.id} href={`/colleges/${college.slug}`}>
                <Card className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {college.name}
                      </h3>
                      {college.city && (
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {college.city}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-2">
                      {college.code}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {college.cutoffCount} cutoff records
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No colleges found</h3>
          <p className="mt-2 text-gray-500">
            Try a different search term or browse all colleges.
          </p>
        </div>
      )}
    </div>
  );
}
