"use client";

import { getTodayLog } from "@/app/actions/daily-log";
import { getUserSettings } from "@/app/actions/settings";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { MacroGauge } from "@/components/dashboard/MacroGauge";
import { MorningCheckIn } from "@/components/dashboard/MorningCheckIn";
import { StatusIndicator } from "@/components/dashboard/StatusIndicator";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Settings, TrendingUp, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [needsCheckIn, setNeedsCheckIn] = useState(true);
  const [dailyLog, setDailyLog] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    proteinTarget: 140,
    carbsTarget: 200,
    fatsTarget: 60,
    caloriesTarget: 2000,
    waterTarget: 4000,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [log, userSettings] = await Promise.all([
        getTodayLog(),
        getUserSettings(),
      ]);
      
      if (log?.weight && log?.sleepHours) {
        setNeedsCheckIn(false);
        setDailyLog(log);
      }
      
      setSettings(userSettings);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInComplete = async () => {
    setNeedsCheckIn(false);
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Calculate status
  const proteinProgress = dailyLog ? (dailyLog.proteinTotal / settings.proteinTarget) * 100 : 0;
  const waterProgress = dailyLog ? (dailyLog.waterTotal / settings.waterTarget) * 100 : 0;
  const isOnTrack = proteinProgress >= 30 || waterProgress >= 20;
  
  const systemMode = (dailyLog?.sleepHours || 0) < 6 ? "saver" : "optimized";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground sm:p-12 max-w-md mx-auto relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {needsCheckIn ? (
          <MorningCheckIn key="morning" onComplete={handleCheckInComplete} />
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center w-full h-full"
          >
            {/* Header */}
            <div className="w-full flex flex-col z-10 mb-8 mt-4">
              <div className="flex justify-between items-center w-full gap-3">
                <h1 className="text-4xl font-bold uppercase tracking-tighter text-foreground font-heading">
                  Body OS
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push('/settings')}
                    className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
                  >
                    <Settings size={20} className="text-zinc-600" />
                  </button>
                  <StatusIndicator 
                    status={isOnTrack ? "ready" : "warning"} 
                    label={isOnTrack ? "On Track" : "Energy Saver"}
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  setNeedsCheckIn(true);
                  setDailyLog(null);
                }}
                className="text-xs text-zinc-400 font-medium tracking-wide uppercase hover:text-primary transition-colors text-left mt-1"
              >
                Recalibrate
              </button>
            </div>

            {/* Core Vitals */}
            <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
              <MacroGauge 
                data={{
                  protein: { 
                    current: dailyLog?.proteinTotal || 0, 
                    target: settings.proteinTarget 
                  },
                  carbs: { 
                    current: dailyLog?.carbsTotal || 0, 
                    target: settings.carbsTarget 
                  },
                  fats: { 
                    current: dailyLog?.fatsTotal || 0, 
                    target: settings.fatsTarget 
                  },
                  calories: { 
                    current: dailyLog?.caloriesTotal || 0, 
                    target: settings.caloriesTarget 
                  },
                }}
              />
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8 w-full px-6">
                <div className={`rounded-3xl p-6 flex flex-col items-start shadow-sm border ${systemMode === 'saver' ? 'bg-red-50 border-red-100' : 'bg-white border-zinc-50'}`}>
                  <span className={`${systemMode === 'saver' ? 'text-red-600' : 'text-zinc-400'} font-medium text-sm uppercase tracking-wider mb-1`}>Weight</span>
                  <span className={`text-4xl font-bold font-heading ${systemMode === 'saver' ? 'text-red-600' : 'text-foreground'}`}>
                    {dailyLog?.weight || 0}<span className="text-lg text-zinc-400/70">kg</span>
                  </span>
                </div>
                <div className={`rounded-3xl p-6 flex flex-col items-start shadow-sm border ${systemMode === 'saver' ? 'bg-red-50 border-red-100' : 'bg-white border-zinc-50'}`}>
                  <span className={`${systemMode === 'saver' ? 'text-red-600' : 'text-zinc-400'} font-medium text-sm uppercase tracking-wider mb-1`}>Sleep</span>
                  <span className={`text-4xl font-bold font-heading ${systemMode === 'saver' ? 'text-red-600' : 'text-foreground'}`}>
                    {dailyLog?.sleepHours || 0}<span className="text-lg text-zinc-400/70">h</span>
                  </span>
                </div>
              </div>

              {systemMode === "saver" && (
                <div className="mt-4 w-full rounded-2xl bg-red-50 p-4 border border-red-100 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-red-600 font-bold text-sm uppercase tracking-wide">Volume Reduced - Recovery Priority</p>
                </div>
              )}

              {/* Water Tracker */}
              <div className="mt-8 w-full">
                <WaterTracker target={settings.waterTarget} />
              </div>
            </div>

            {/* Action Grid */}
            <div className="w-full z-10 mt-8 mb-8 grid grid-cols-2 gap-4">
              <ActionCard
                label="Log Food"
                sublabel="Track Nutrition"
                icon={Utensils}
                color="text-orange-500"
                onClick={() => router.push("/nutrition")}
                className="h-40"
              />
              
              <ActionCard
                label="Workout"
                sublabel="Start Session"
                icon={Dumbbell}
                color="text-zinc-900"
                onClick={() => router.push("/workout")}
                className="h-40"
              />

              <ActionCard
                label="Progress"
                sublabel="View Stats & Trends"
                icon={TrendingUp}
                color="text-blue-500"
                onClick={() => router.push("/progress")}
                className="col-span-2 h-24"
                variant="wide"
                bgColor="bg-blue-50/50" // Subtle tint for variety
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
