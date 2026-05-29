"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Upload,
  Database,
  Loader2,
  Building2,
  GraduationCap,
  BarChart3,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) {
      setUploadResult({ success: false, message: "Please select a file" });
      return;
    }

    setUploading(true);
    setUploadResult({});

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadResult(data);
      if (data.success) refetchStats();
    } catch (error) {
      setUploadResult({
        success: false,
        message: "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl bg-red-100 p-3">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">
              Manage data, upload CSVs, and monitor system status
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Stats */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Database Statistics</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchStats()}
              disabled={statsLoading}
            >
              <RefreshCcw
                className={`h-4 w-4 ${statsLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <Building2 className="mx-auto h-6 w-6 text-blue-600" />
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {stats.colleges}
                </div>
                <div className="text-xs text-gray-500">Colleges</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <GraduationCap className="mx-auto h-6 w-6 text-purple-600" />
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {stats.branches}
                </div>
                <div className="text-xs text-gray-500">Branches</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4 text-center">
                <BarChart3 className="mx-auto h-6 w-6 text-emerald-600" />
                <div className="mt-2 text-2xl font-bold text-gray-900">
                  {stats.cutoffs?.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-gray-500">Cutoff Records</div>
              </div>
              <div className="rounded-lg bg-amber-50 p-4 text-center">
                <Database className="mx-auto h-6 w-6 text-amber-600" />
                <div className="mt-2 text-lg font-bold text-gray-900">
                  {stats.years?.length || 0} Years
                </div>
                <div className="text-xs text-gray-500">
                  {stats.years?.map((y: any) => y.year).join(", ") || "N/A"}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No data loaded. Please upload a CSV file.
            </div>
          )}
        </Card>

        {/* Upload CSV */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Upload CSV Data</h2>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Upload MHTCET cutoff CSV file
              </p>
              <p className="text-xs text-gray-500">
                Supports the standard MHTCET cutoff report format
              </p>
              <input
                type="file"
                name="file"
                accept=".csv"
                className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading &amp; Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Ingest Data
                </>
              )}
            </Button>
          </form>

          {uploadResult.message && (
            <div
              className={`mt-4 flex items-start gap-3 rounded-lg p-4 ${
                uploadResult.success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {uploadResult.success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p className="text-sm">{uploadResult.message}</p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => window.open("/api/admin/stats", "_blank")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Raw Stats API
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/colleges", "_blank")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Browse Colleges
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
