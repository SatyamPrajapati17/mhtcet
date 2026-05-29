"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Brain,
  Search,
  BarChart3,
  History,
  Bookmark,
  FileText,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "saved" | "history">(
    "overview"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-xl bg-indigo-100 p-3">
            <LayoutDashboard className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Your personalized counseling dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Link href="/predict">
          <Card className="group cursor-pointer text-center hover:-translate-y-1 transition-all duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Predict
            </h3>
            <p className="mt-1 text-xs text-gray-500">Get college predictions</p>
          </Card>
        </Link>
        <Link href="/colleges">
          <Card className="group cursor-pointer text-center hover:-translate-y-1 transition-all duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <Search className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
              Colleges
            </h3>
            <p className="mt-1 text-xs text-gray-500">Browse all colleges</p>
          </Card>
        </Link>
        <Link href="/compare">
          <Card className="group cursor-pointer text-center hover:-translate-y-1 transition-all duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
              Compare
            </h3>
            <p className="mt-1 text-xs text-gray-500">Compare colleges</p>
          </Card>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {[
          { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
          { id: "saved" as const, label: "Saved", icon: Bookmark },
          { id: "history" as const, label: "History", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-blue-100 p-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Predict</h3>
                <p className="text-xs text-gray-500">
                  Enter your percentile for instant predictions
                </p>
              </div>
            </div>
            <Link href="/predict">
              <Button className="w-full" variant="gradient">
                <Brain className="mr-2 h-4 w-4" />
                Start Prediction
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-purple-100 p-2">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">College Stats</h3>
                <p className="text-xs text-gray-500">
                  Browse our complete college database
                </p>
              </div>
            </div>
            <Link href="/colleges">
              <Button variant="outline" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Browse Colleges
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {activeTab === "saved" && (
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <Bookmark className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              No saved colleges yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Start predicting and save colleges you're interested in.
            </p>
            <Link href="/predict">
              <Button variant="gradient" className="mt-4">
                <Brain className="mr-2 h-4 w-4" />
                Predict Colleges
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === "history" && (
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <History className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              No prediction history yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your prediction history will appear here.
            </p>
            <Link href="/predict">
              <Button variant="gradient" className="mt-4">
                <Brain className="mr-2 h-4 w-4" />
                Make a Prediction
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
