"use client";

import { getTodayLog } from "@/app/actions/daily-log";
import { FuelGauge } from "@/components/dashboard/FuelGauge";
import { MorningCheckIn } from "@/components/dashboard/MorningCheckIn";
import { StatusIndicator } from "@/components/dashboard/StatusIndicator";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { BigButton } from "@/components/ui/BigButton";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [needsCheckIn, setNeedsCheckIn] = useState(true);
  const [dailyLog, setDailyLog] = useState<any>(null);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const log = await getTodayLog();
      
      if (log && log.weight && log.sleepHours) {
        // Check-in already done
        setNeedsCheckIn(false);
        setDailyLog(log);
      } else {
        // Need check-in
        setNeedsCheckIn(true);
      }
    } catch (error) {
      console.error("Failed to load today's log:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInComplete = async () => {
    await loadTodayData();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Calculate status
  const proteinTarget = 140;
  const waterTarget = 4000;
  const proteinProgress = dailyLog ? (dailyLog.proteinTotal / proteinTarget) * 100 : 0;
  const waterProgress = dailyLog ? (dailyLog.waterTotal / waterTarget) * 100 : 0;
  const isOnTrack = proteinProgress >= 30 || waterProgress >= 20; // At least some progress
  
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
                <StatusIndicator 
                  status={isOnTrack ? "ready" : "warning"} 
                  label={isOnTrack ? "On Track" : "Energy Saver"}
                />
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
              <FuelGauge 
                current={Math.round(dailyLog?.proteinTotal || 0)} 
                target={proteinTarget} 
                label="Daily Protein" 
                unit="g"
              />
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full mt-12">
                <div className="bg-white rounded-3xl p-6 flex flex-col items-start shadow-sm border border-zinc-50">
                  <span className="text-zinc-400 font-medium text-sm uppercase tracking-wider mb-1">Weight</span>
                  <span className="text-4xl font-bold font-heading">
                    {dailyLog?.weight || 0}<span className="text-lg text-zinc-400">kg</span>
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
                <WaterTracker />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full z-10 mt-8 mb-8 space-y-4">
              <BigButton 
                variant="primary" 
                onClick={() => router.push("/nutrition")}
              >
                Log Nutrition
              </BigButton>
              
              <BigButton 
                variant="secondary" 
                onClick={() => router.push("/workout")}
                className="bg-zinc-800 text-white hover:bg-zinc-700"
              >
                Start Workout
              </BigButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 bg-gradient-to-b from-white via-transparent to-transparent"></div>
    </div>
  );
}
