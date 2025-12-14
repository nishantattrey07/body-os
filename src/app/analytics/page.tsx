"use client";

import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { TrainingCalendar } from "@/components/analytics/TrainingCalendar";
import { BlockerDashboard } from "@/components/blockers/BlockerDashboard";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, BarChart3, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Tab = "overview" | "calendar" | "body";

export default function AnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { id: "calendar" as Tab, label: "Calendar", icon: Calendar },
    { id: "body" as Tab, label: "Body", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-zinc-100">
        <div className="max-w-md mx-auto p-6 pb-0">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              <ArrowLeft className="text-zinc-600" size={20} />
            </button>
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground font-heading">
              Analytics
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-t-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-foreground shadow-sm border border-b-0 border-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <AnalyticsDashboard />}
          {activeTab === "calendar" && <TrainingCalendar />}
          {activeTab === "body" && <BlockerDashboard />}
        </motion.div>
      </div>
    </div>
  );
}
