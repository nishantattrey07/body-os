"use client";

import { FuelGauge } from "@/components/dashboard/FuelGauge";
import { MorningCheckIn } from "@/components/dashboard/MorningCheckIn";
import { StatusIndicator } from "@/components/dashboard/StatusIndicator";
import { BigButton } from "@/components/ui/BigButton";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [bootStatus, setBootStatus] = useState<"pending" | "completed">("pending");
  const [systemMode, setSystemMode] = useState<"optimized" | "saver">("optimized");
  const [stats, setStats] = useState({ weight: 0, sleep: 0 });

  const handleMorningCheckIn = (data: { weight: number; sleep: number }) => {
    setStats(data);
    
    // Logic: Sleep < 6h -> Energy Saver Mode
    if (data.sleep < 6) {
      setSystemMode("saver");
    } else {
      setSystemMode("optimized");
    }

    setBootStatus("completed");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground sm:p-12 max-w-md mx-auto relative overflow-hidden">
      
      <AnimatePresence mode="wait">
        {bootStatus === "pending" ? (
          <MorningCheckIn key="morning" onComplete={handleMorningCheckIn} />
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center w-full h-full"
          >
            {/* Header */}
            <div className="w-full flex justify-between items-center z-10 mb-8 mt-4">
              <h1 className="text-4xl font-bold uppercase tracking-tighter text-foreground font-heading">
                Body OS
              </h1>
              <StatusIndicator 
                status={systemMode === "optimized" ? "ready" : "warning"} 
                label={systemMode === "optimized" ? "System Ready" : "Energy Saver"}
              />
            </div>

            {/* Core Vitals */}
            <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
              <FuelGauge 
                current={140} 
                target={200} 
                label="Daily Protein" 
                unit="g"
              />
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full mt-12">
                  <div className="bg-white rounded-3xl p-6 flex flex-col items-start shadow-sm border border-zinc-50">
                      <span className="text-zinc-400 font-medium text-sm uppercase tracking-wider mb-1">Weight</span>
                      <span className="text-4xl font-bold font-heading">{stats.weight}<span className="text-lg text-zinc-400">kg</span></span>
                  </div>
                  <div className={`rounded-3xl p-6 flex flex-col items-start shadow-sm border ${systemMode === 'saver' ? 'bg-primary/10 border-primary/20' : 'bg-white border-zinc-50'}`}>
                      <span className={`${systemMode === 'saver' ? 'text-primary' : 'text-zinc-400'} font-medium text-sm uppercase tracking-wider mb-1`}>Sleep</span>
                      <span className={`text-4xl font-bold font-heading ${systemMode === 'saver' ? 'text-primary' : 'text-foreground'}`}>{stats.sleep}<span className="text-lg text-zinc-400/70">h</span></span>
                  </div>
              </div>

              {systemMode === "saver" && (
                <div className="mt-4 w-full rounded-2xl bg-secondary/10 p-4 border border-secondary/20 flex items-center gap-3">
                   <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                   <p className="text-secondary font-bold text-sm uppercase tracking-wide">Volume Reduced - Recovery Priority</p>
                </div>
              )}
            </div>

            {/* Primary Action */}
            <div className="w-full z-10 mt-8 mb-8">
              <BigButton variant="primary" className="mb-4">
                Log Lunch
              </BigButton>
              <p className="text-center text-zinc-400 text-sm font-medium">
                  Next: {systemMode === "optimized" ? "Heavy Push" : "Light Recovery"} at 18:00
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 bg-gradient-to-b from-white via-transparent to-transparent"></div>
    </div>
  );
}
