"use client";

import { useDailyStore } from "@/store/dailyStore";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function WaterTracker() {
  const { waterTotal, waterTarget, logWater } = useDailyStore();
  const [tapping, setTapping] = useState(false);
  
  const PER_TAP = 250; // 250ml per glass

  // No load effect needed, dailyStore handles it globally

  const handleTap = async () => {
    if (tapping) return;
    
    setTapping(true);
    try {
      // Optimistic update via store
      await logWater(PER_TAP);
      
      // SUCCESS: No toast, visual feedback handled by store update + animation
    } catch (error) {
      toast.error("Connection Failed", {
        description: "Could not log water. Please try again.",
      });
    } finally {
      setTimeout(() => setTapping(false), 300);
    }
  };

  const progress = Math.min((waterTotal / waterTarget) * 100, 100);
  const glasses = Math.floor(waterTotal / PER_TAP);

  return (
    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-cyan-500/20 relative overflow-hidden group">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-xs opacity-80 uppercase tracking-widest font-semibold font-body mb-1">
            Water Intake
          </p>
          <div className="flex items-baseline gap-1">
            <p className="text-5xl font-bold font-heading tracking-tight leading-none">
                {(waterTotal / 1000).toFixed(1)}
                <span className="text-3xl opacity-60 ml-1 font-body font-medium">L</span>
            </p>
          </div>
          <p className="text-sm opacity-70 mt-1 font-medium">{glasses} glasses</p>
        </div>
        
        <div className="text-right">
          <p className="text-xs opacity-80 uppercase tracking-wider font-medium mb-1">Target</p>
          <p className="text-2xl font-bold font-heading tracking-wide">{(waterTarget / 1000).toFixed(1)}L</p>
        </div>
      </div>

      {/* Wave Progress Bar */}
      <div className="relative bg-black/20 rounded-full h-3 overflow-hidden mb-6 backdrop-blur-sm">
        <motion.div 
          className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Tap Button */}
      <motion.button
        onClick={handleTap}
        disabled={tapping}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-white text-blue-600 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50 shadow-sm font-heading tracking-wide uppercase"
      >
        <Plus className="w-5 h-5" />
        Add {PER_TAP}ml
      </motion.button>

      {/* Achievement */}
      {progress >= 100 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center bg-white/20 rounded-xl py-2 backdrop-blur-md"
        >
          <p className="text-sm font-bold tracking-wide">🎉 Daily goal achieved!</p>
        </motion.div>
      )}
    </div>
  );
}
