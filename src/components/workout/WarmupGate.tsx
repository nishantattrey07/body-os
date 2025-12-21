"use client";

import { getSessionWarmupProgress, getWarmupChecklist, markWarmupComplete, toggleWarmupItem } from "@/app/actions/workout";
import { motion } from "framer-motion";
import { Check, Loader2, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WarmupGateProps {
  sessionId: string;
  onUnlock: () => void;
  initialWarmupData?: {
    checklist: any[];
    progress: any[];
  };
}

/**
 * WarmupGate - Displays warmup checklist before workout
 * 
 * Optimized flow:
 * - Uses prefetched data (no loading on mount)
 * - Optimistic toggle (instant UI, background sync)
 * - No isWarmupComplete check - we check locally!
 * - markWarmupComplete is fire-and-forget
 */
export function WarmupGate({ sessionId, onUnlock, initialWarmupData }: WarmupGateProps) {
  const [warmups, setWarmups] = useState<any[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(!initialWarmupData);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    loadWarmupData();
  }, [sessionId]);

  const loadWarmupData = async () => {
    try {
      if (initialWarmupData) {
        // Use prefetched data for instant loading
        setWarmups(initialWarmupData.checklist);
        
        const completedIds = new Set(
          initialWarmupData.progress
            .filter((log: any) => log.completed)
            .map((log: any) => log.warmupChecklistId)
        );
        setCompleted(completedIds);
        setLoading(false);
      } else {
        // Fallback: fetch data (for resume scenarios)
        const [allWarmups, sessionProgress] = await Promise.all([
          getWarmupChecklist(),
          getSessionWarmupProgress(sessionId)
        ]);

        setWarmups(allWarmups);
        
        const completedIds = new Set(
          sessionProgress
            .filter((log: any) => log.completed)
            .map((log: any) => log.warmupChecklistId)
        );
        setCompleted(completedIds);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to load warmup data:", error);
      setLoading(false);
    }
  };

  const handleToggle = (warmupId: string) => {
    const isCurrentlyCompleted = completed.has(warmupId);
    const newState = !isCurrentlyCompleted;
    
    // OPTIMISTIC: Update UI immediately
    setCompleted(prev => {
      const newSet = new Set(prev);
      if (newState) {
        newSet.add(warmupId);
      } else {
        newSet.delete(warmupId);
      }
      return newSet;
    });
    
    // FIRE-AND-FORGET: Sync to server in background
    toggleWarmupItem(sessionId, warmupId, newState).catch((error) => {
      console.error("Failed to toggle warmup item:", error);
      
      // ROLLBACK on error
      setCompleted(prev => {
        const newSet = new Set(prev);
        if (newState) {
          newSet.delete(warmupId);
        } else {
          newSet.add(warmupId);
        }
        return newSet;
      });
      
      toast.error("Failed to save. Please try again.");
    });
  };

  const handleUnlock = () => {
    // Check locally - no need for server check!
    // We already know which items are completed from local state
    const allChecked = warmups.every(w => completed.has(w.id));
    
    if (!allChecked) {
      toast.warning("Complete all warmup items first!");
      return;
    }

    setUnlocking(true);
    
    // OPTIMISTIC: Transition immediately
    // The parent will handle the stage change
    setTimeout(() => onUnlock(), 300);
    
    // FIRE-AND-FORGET: Mark complete in background
    // We don't need to wait for this - if it fails, the session just
    // won't have warmupCompleted=true, but user is already in the workout
    markWarmupComplete(sessionId).catch((error) => {
      console.error("Failed to mark warmup complete:", error);
      // Don't show error - user is already in workout
      // Session will still work, just warmupCompleted flag won't be set
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  const allChecked = warmups.every(w => completed.has(w.id));

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white shadow-md"
        >
          <Unlock size={16} />
          <span className="text-sm font-bold uppercase tracking-wider">
            Ready to Train
          </span>
        </motion.div>
        
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-zinc-900 font-heading leading-tight">
          Pre-Flight<br />
          <span className="text-emerald-500">Checks</span>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full p-4 rounded-2xl flex items-center justify-between 
              border-l-4 transition-all duration-200 shadow-sm
              ${completed.has(warmup.id) 
                ? 'bg-emerald-50 border-l-emerald-500' 
                : 'bg-emerald-50/50 border-l-emerald-300 hover:bg-emerald-50'
              }
            `}
          >
            <div className="text-left flex-1 pr-4">
              <span className={`
                text-base font-bold font-heading
                ${completed.has(warmup.id) ? 'text-emerald-600' : 'text-emerald-600'}
              `}>
                {warmup.name}
              </span>
              {warmup.description && (
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  {warmup.description}
                </p>
              )}
            </div>
            
            <div className={`
              h-8 w-8 rounded-full flex items-center justify-center transition-all flex-shrink-0
              ${completed.has(warmup.id) 
                ? 'bg-emerald-500 shadow-md' 
                : 'bg-white border-2 border-emerald-300'
              }
            `}>
              {completed.has(warmup.id) && <Check size={16} className="text-white" strokeWidth={3} />}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleUnlock}
        disabled={unlocking || !allChecked}
        whileTap={{ scale: allChecked ? 0.98 : 1 }}
        className={`
          w-full h-14 rounded-2xl font-bold text-lg uppercase tracking-wider 
          flex items-center justify-center gap-2 transition-all
          ${allChecked 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
          }
        `}
      >
        {unlocking ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Starting...
          </>
        ) : (
          <>
            <Unlock size={18} />
            Start Workout
          </>
        )}
      </motion.button>
    </div>
  );
}
