"use client";

import { getTodayWarmupProgress, getWarmupChecklist, isWarmupComplete, toggleWarmupItem } from "@/app/actions/workout";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";

interface WarmupGateProps {
  onUnlock: () => void;
}

export function WarmupGate({ onUnlock }: WarmupGateProps) {
  const [warmups, setWarmups] = useState<any[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    loadWarmupData();
  }, []);

  const loadWarmupData = async () => {
    try {
      const [allWarmups, todayProgress] = await Promise.all([
        getWarmupChecklist(),
        getTodayWarmupProgress()
      ]);

      setWarmups(allWarmups);
      
      // Mark completed warmups
      const completedIds = new Set(
        todayProgress
          .filter((log: any) => log.completed)
          .map((log: any) => log.warmupChecklistId)
      );
      setCompleted(completedIds);
    } catch (error) {
      console.error("Failed to load warmup data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (warmupId: string) => {
    const isCurrentlyCompleted = completed.has(warmupId);
    const newState = !isCurrentlyCompleted;
    
    // OPTIMISTIC UPDATE: Update UI immediately for instant feedback
    setCompleted(prev => {
      const newSet = new Set(prev);
      if (newState) {
        newSet.add(warmupId);
      } else {
        newSet.delete(warmupId);
      }
      return newSet;
    });
    
    // Update backend in background
    try {
      await toggleWarmupItem(warmupId, newState);
    } catch (error) {
      console.error("Failed to toggle warmup item:", error);
      
      // ROLLBACK: Revert optimistic update on error
      setCompleted(prev => {
        const newSet = new Set(prev);
        if (newState) {
          newSet.delete(warmupId); // Was added optimistically, remove it
        } else {
          newSet.add(warmupId); // Was removed optimistically, add it back
        }
        return newSet;
      });
      
      alert("Failed to update warmup. Please try again.");
    }
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    try {
      const isComplete = await isWarmupComplete();
      if (isComplete) {
        setTimeout(() => onUnlock(), 500); // Small delay for animation
      } else {
        alert("Complete all warmup items first!");
      }
    } catch (error) {
      console.error("Failed to check warmup status:", error);
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-zinc-400 w-8 h-8" />
      </div>
    );
  }

  const allChecked = warmups.every(w => completed.has(w.id));

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${
            allChecked 
              ? 'bg-green-500/10 border-green-500' 
              : 'bg-red-500/10 border-red-500'
          }`}
        >
          {allChecked ? (
            <Unlock size={18} className="text-green-500" />
          ) : (
            <Lock size={18} className="text-red-500" />
          )}
          <span className={`text-sm font-bold uppercase tracking-wider ${
            allChecked ? 'text-green-500' : 'text-red-500'
          }`}>
            {allChecked ? 'Ready to Train' : 'Warmup Required'}
          </span>
        </motion.div>
        
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-foreground font-heading">
          Pre-Flight<br />
          <span className="text-red-600">Checks</span>
        </h1>
        <p className="text-zinc-400 text-sm">
          Complete all items to unlock exercises
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {warmups.map((warmup, index) => (
          <motion.button
            key={warmup.id}
            onClick={() => handleToggle(warmup.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full p-4 rounded-2xl flex items-center justify-between 
              border-2 transition-all duration-200
              ${completed.has(warmup.id) 
                ? 'bg-green-500/10 border-green-500' 
                : 'bg-white border-zinc-200 hover:border-zinc-300'
              }
            `}
          >
            <div className="text-left flex-1">
              <span className={`
                text-lg font-bold font-heading
                ${completed.has(warmup.id) ? 'text-green-700 line-through' : 'text-zinc-900'}
              `}>
                {warmup.name}
              </span>
              {warmup.description && (
                <p className="text-xs text-zinc-500 mt-1">{warmup.description}</p>
              )}
            </div>
            
            <div className={`
              h-8 w-8 rounded-full flex items-center justify-center transition-colors
              ${completed.has(warmup.id) ? 'bg-green-500' : 'bg-zinc-200'}
            `}>
              {completed.has(warmup.id) && <Check size={18} className="text-white" />}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Unlock Button */}
      <AnimatePresence>
        {allChecked && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleUnlock}
            disabled={unlocking}
            whileTap={{ scale: 0.98 }}
            className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xl uppercase tracking-wider shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {unlocking ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Unlocking...
              </>
            ) : (
              <>
                <Unlock size={20} />
                Start Workout
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
