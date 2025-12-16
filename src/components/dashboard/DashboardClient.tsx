"use client";

import { getTodayLog } from "@/app/actions/daily-log";
import { getUserSettings } from "@/app/actions/settings";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { MacroGauge } from "@/components/dashboard/MacroGauge";
import { MorningCheckIn } from "@/components/dashboard/MorningCheckIn";
import { StatusIndicator } from "@/components/dashboard/StatusIndicator";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { useVisibilityRefresh } from "@/hooks/useVisibilityRefresh";
import { isPastDayCutoff } from "@/lib/date-utils";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, Settings, TrendingUp, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DashboardClientProps {
  initialLog: any;
  initialSettings: any;
}

export function DashboardClient({ initialLog, initialSettings }: DashboardClientProps) {
  const router = useRouter();
  
  // Calculate initial check-in state
  const hasCompletedCheckIn = initialLog?.weight && initialLog?.sleepHours;
  
  // Check if we're past the user's day cutoff
  // Use defaults if migration hasn't run yet
  const cutoffHour = initialSettings.dayCutoffHour ?? 5;
  const cutoffMinute = initialSettings.dayCutoffMinute ?? 30;
  
  const isPastCutoff = isPastDayCutoff(
    undefined,
    cutoffHour,
    cutoffMinute
  );
  
  // Only show check-in if:
  // 1. Not completed yet AND
  // 2. We're past the cutoff time (e.g., after 5:30 AM)
  const [needsCheckIn, setNeedsCheckIn] = useState(!hasCompletedCheckIn && isPastCutoff);
  const [dailyLog, setDailyLog] = useState<any>(initialLog);
  const [settings, setSettings] = useState<any>(initialSettings);

  // 🔄 Multi-device sync: Refresh data when user switches back to this tab/app
  useVisibilityRefresh();

  const loadData = async () => {
    try {
      // Re-fetch data (used for updates e.g. after water logging)
      const [log, userSettings] = await Promise.all([
        getTodayLog(),
        getUserSettings(),
      ]);
      
      if (log?.weight && log?.sleepHours) {
        setNeedsCheckIn(false);
      }
      setDailyLog(log);
      setSettings(userSettings);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  const handleCheckInComplete = async () => {
    setNeedsCheckIn(false);
    await loadData();
  };

  // Calculate status - Time-aware thresholds
  const proteinProgress = dailyLog ? (dailyLog.proteinTotal / settings.proteinTarget) * 100 : 0;
  const waterProgress = dailyLog ? (dailyLog.waterTotal / settings.waterTarget) * 100 : 0;
  
  // Calculate expected progress based on time of day
  // Assume eating window is 6 AM - 10 PM (16 hours)
  const now = new Date();
  const currentHour = now.getHours();
  const minutesPastHour = now.getMinutes();
  
  // Calculate hours elapsed since 6 AM
  const startHour = 6;
  const endHour = 22; // 10 PM
  const totalActiveHours = endHour - startHour; // 16 hours
  
  let hoursElapsed = 0;
  if (currentHour >= startHour && currentHour < endHour) {
    hoursElapsed = (currentHour - startHour) + (minutesPastHour / 60);
  } else if (currentHour >= endHour) {
    hoursElapsed = totalActiveHours;
  }
  
  // Expected progress = (hours elapsed / total hours) * 100
  const expectedProgress = (hoursElapsed / totalActiveHours) * 100;
  
  // Define thresholds
  const minAcceptableProgress = Math.max(0, expectedProgress - 20);
  const beastModeThreshold = expectedProgress + 20;
  
  // Calculate smart status
  const calculateSmartStatus = () => {
    const proteinBehind = proteinProgress < minAcceptableProgress;
    const waterBehind = waterProgress < minAcceptableProgress;
    const proteinAhead = proteinProgress > beastModeThreshold;
    const waterAhead = waterProgress > beastModeThreshold;
    
    // Determine time of day for messaging
    const isMorning = currentHour >= 6 && currentHour < 12;
    const isAfternoon = currentHour >= 12 && currentHour < 18;
    const isEvening = currentHour >= 18 && currentHour < 22;
    
    // Priority 1: Both behind (Critical)
    if (proteinBehind && waterBehind) {
      let label = "Fuel Up";
      if (isAfternoon) label = "Catch Up";
      if (isEvening) label = "Last Call";
      return { status: "critical" as const, label };
    }
    
    // Priority 2: Protein behind (Fuel Up)
    if (proteinBehind) {
      let label = "Eat Now";
      if (isAfternoon) label = "Eat Food";
      if (isEvening) label = "Last Meal";
      return { status: "fuel" as const, label };
    }
    
    // Priority 3: Water behind (Hydrate)
    if (waterBehind) {
      let label = "Hydrate";
      if (isAfternoon) label = "Drink Water";
      if (isEvening) label = "Finish H2O";
      return { status: "hydrate" as const, label };
    }
    
    // Priority 4: Ahead of schedule (Beast Mode)
    if (proteinAhead || waterAhead) {
      return { status: "beast-mode" as const, label: "Beast Mode" };
    }
    
    // Default: On Track
    return { status: "on-track" as const, label: "On Track" };
  };
  
  const smartStatus = calculateSmartStatus();
  const systemMode = (dailyLog?.sleepHours || 0) < 6 ? "saver" : "optimized";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground sm:p-12 max-w-md mx-auto relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {needsCheckIn ? (
          <MorningCheckIn 
            key="morning" 
            onComplete={handleCheckInComplete}
            cutoffHour={cutoffHour}
            cutoffMinute={cutoffMinute}
          />
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center w-full h-full"
          >
            {/* Settings Button - Absolute Position */}
            <button
              onClick={() => router.push('/settings')}
              className="absolute top-8 right-6 p-2 rounded-full bg-zinc-100/80 hover:bg-zinc-200 transition-colors z-20"
            >
              <Settings size={20} className="text-zinc-600" />
            </button>

            {/* Header */}
            <div className="w-full flex flex-col z-10 mb-8 mt-4">
              <div className="flex justify-between items-center w-full min-h-[44px]">
                <h1 className="text-4xl font-bold uppercase tracking-tighter text-foreground font-heading whitespace-nowrap">
                  Body OS
                </h1>
                
                <div className="mr-12">
                  <StatusIndicator 
                    status={smartStatus.status} 
                    label={smartStatus.label}
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  setNeedsCheckIn(true);
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
              {/* Water Tracker */}
              <div className="w-full px-6 mt-6">
                <WaterTracker />
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
                bgColor="bg-blue-50/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
