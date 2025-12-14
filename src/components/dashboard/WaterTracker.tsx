"use client";

import { getTodayWaterLogs, logWater } from "@/app/actions/water";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function WaterTracker() {
  const [total, setTotal] = useState(0);
  const [tapping, setTapping] = useState(false);
  
  const TARGET = 4000; // 4L in ml
  const PER_TAP = 250; // 250ml per glass

  useEffect(() => {
    loadWaterData();
  }, []);

  const loadWaterData = async () => {
    try {
      const logs = await getTodayWaterLogs();
      const sum = logs.reduce((acc, log) => acc + log.amount, 0);
      setTotal(sum);
    } catch (error) {
      console.error("Failed to load water data:", error);
    }
  };

  const handleTap = async () => {
    if (tapping) return;
    
    setTapping(true);
    try {
      await logWater(PER_TAP);
      setTotal(prev => prev + PER_TAP);
    } catch (error) {
      console.error("Failed to log water:", error);
      alert("Failed to log water. Please try again.");
    } finally {
      setTimeout(() => setTapping(false), 300);
    }
  };

  const progress = Math.min((total / TARGET) * 100, 100);
  const glasses = Math.floor(total / PER_TAP);

  return (
    <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl p-6 text-white shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm opacity-80 uppercase tracking-wider font-medium mb-1">
            Water Intake
          </p>
          <p className="text-4xl font-bold font-heading">
            {(total / 1000).toFixed(1)}L
          </p>
          <p className="text-sm opacity-70 mt-1">{glasses} glasses</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm opacity-80">Target</p>
          <p className="text-2xl font-bold">4L</p>
        </div>
      </div>

      {/* Wave Progress Bar */}
      <div className="relative bg-white/20 rounded-full h-3 overflow-hidden mb-6">
        <motion.div 
          className="bg-white h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Tap Button */}
      <motion.button
        onClick={handleTap}
        disabled={tapping}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-white text-blue-600 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50"
      >
        <Plus className="w-5 h-5" />
        Add {PER_TAP}ml
      </motion.button>

      {/* Achievement */}
      {progress >= 100 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center bg-white/20 rounded-xl py-2"
        >
          <p className="text-sm font-bold">🎉 Daily goal achieved!</p>
        </motion.div>
      )}
    </div>
  );
}
