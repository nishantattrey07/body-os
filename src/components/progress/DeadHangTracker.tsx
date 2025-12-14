"use client";

import { getDeadHangHistory, logDeadHang } from "@/app/actions/progress";
import { motion } from "framer-motion";
import { Award, Timer, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function DeadHangTracker() {
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getDeadHangHistory(7); // Last 7 days
      setHistory(data);
    } catch (error) {
      console.error("Failed to load dead hang history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStart = () => {
    setSeconds(0);
    setIsRecording(true);
  };

  const handleStop = async () => {
    setIsRecording(false);
    
    if (seconds > 0) {
      try {
        await logDeadHang(seconds);
        await loadHistory(); // Refresh history
      } catch (error) {
        console.error("Failed to log dead hang:", error);
        alert("Failed to save dead hang time. Please try again.");
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const bestTime = history.length > 0 ? Math.max(...history.map(h => h.seconds)) : 0;
  const avgTime = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + h.seconds, 0) / history.length)
    : 0;

  return (
    <div className="w-full space-y-6">
      {/* Main Timer */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Timer size={24} />
          <h3 className="text-xl font-bold uppercase tracking-wide">Dead Hang Timer</h3>
        </div>

        {/* Large Timer Display */}
        <div className="text-center py-8">
          <div className="text-7xl font-bold font-heading tabular-nums">
            {formatTime(seconds)}
          </div>
          <p className="text-sm opacity-80 mt-2 uppercase tracking-wider">
            {isRecording ? "Hanging..." : "Ready"}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isRecording ? (
            <motion.button
              onClick={handleStart}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-2xl bg-white text-blue-600 font-bold text-lg uppercase tracking-wider"
            >
              Start
            </motion.button>
          ) : (
            <motion.button
              onClick={handleStop}
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-2xl bg-red-500 text-white font-bold text-lg uppercase tracking-wider hover:bg-red-600"
            >
              Stop & Save
            </motion.button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-100">
          <div className="flex items-center gap-2 mb-2">
            <Award size={18} className="text-amber-600" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Best</span>
          </div>
          <p className="text-3xl font-bold font-heading text-foreground">
            {formatTime(bestTime)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-600" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Avg</span>
          </div>
          <p className="text-3xl font-bold font-heading text-foreground">
            {formatTime(avgTime)}
          </p>
        </div>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-zinc-100">
          <h4 className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-4">
            Recent History
          </h4>
          <div className="space-y-2">
            {history.slice(0, 5).map((entry, index) => (
              <div key={entry.id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                <span className="text-sm text-zinc-500">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <span className="text-lg font-bold font-heading text-foreground">
                  {formatTime(entry.seconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
