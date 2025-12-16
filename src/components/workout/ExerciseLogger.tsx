"use client";

import { completeExercise, logSet } from "@/app/actions/workout-session";
import { BlockerPicker } from "@/components/blockers/BlockerPicker";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, CheckCircle, Loader2, Minus, Plus, Timer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExerciseLoggerProps {
  exercise: any;
  sessionExerciseId?: string;
  onComplete: (setsCount: number) => void;
}

export function ExerciseLogger({ exercise, sessionExerciseId, onComplete }: ExerciseLoggerProps) {
  const [reps, setReps] = useState(exercise.defaultReps || 10);
  const [painLevel, setPainLevel] = useState(0);
  const [selectedBlockerId, setSelectedBlockerId] = useState<string | null>(null);
  const [logging, setLogging] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimerMax, setRestTimerMax] = useState<number>(0);
  const [restStartTime, setRestStartTime] = useState<Date | null>(null); // Track when rest period started
  const [swapSuggestion, setSwapSuggestion] = useState<any>(null);
  const [currentSet, setCurrentSet] = useState(1);
  const totalSets = exercise.defaultSets || 3;

  const handleLogSet = async () => {
    if (logging) return;
    
    setLogging(true);
    try {
      // Calculate actual rest taken (if we were resting before this set)
      let actualRestTaken: number | undefined;
      if (restStartTime) {
        actualRestTaken = Math.floor((Date.now() - restStartTime.getTime()) / 1000);
        setRestStartTime(null); // Reset for next rest period
      }

      if (sessionExerciseId) {
        const result = await logSet({
          sessionExerciseId,
          setNumber: currentSet,
          targetReps: exercise.defaultReps || 10,
          actualReps: reps,
          weight: 0,
          painLevel: painLevel,
          restTaken: actualRestTaken, // Pass actual rest duration to be stored
          aggravatedBlockerId: selectedBlockerId || undefined,
        });

        if (result.swapSuggestion) {
          setSwapSuggestion(result.swapSuggestion);
          return;
        }
      }

      if (currentSet >= totalSets) {
        if (sessionExerciseId) {
          await completeExercise(sessionExerciseId);
        }
        setTimeout(() => onComplete(totalSets), 500);
      } else {
        setCurrentSet(prev => prev + 1);
        
        const restTime = exercise.restSeconds !== undefined ? exercise.restSeconds : 60;
        
        if (restTime > 0) {
          setRestTimerMax(restTime);
          setRestTimer(restTime);
          setRestStartTime(new Date()); // Track when rest period started
          const timer = setInterval(() => {
            setRestTimer(prev => {
              if (prev === null || prev <= 1) {
                clearInterval(timer);
                return null;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setRestTimer(null);
        }
      }
    } catch (error: any) {
      console.error("Failed to log exercise:", error);
      toast.error("Failed to log exercise. Please try again.");
    } finally {
      setLogging(false);
    }
  };

  const handleAcceptSwap = () => {
    onComplete(currentSet);
  };

  // Skip rest timer (but still track actual time taken)
  const handleSkipRest = () => {
    setRestTimer(null);
    // Note: restStartTime stays set so we capture actual rest when next set is logged
  };

  const showHighPainWarning = painLevel > 3;
  const restProgress = restTimerMax > 0 && restTimer !== null ? ((restTimerMax - restTimer) / restTimerMax) * 100 : 0;

  return (
    <div className="w-full space-y-5">
      {/* Exercise Name & Set Progress */}
      <div className="text-center">
        <h2 className="text-2xl font-bold font-heading text-zinc-900 uppercase tracking-tight">
          {exercise.name}
        </h2>
        
        {/* Premium Set Progress Indicator */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {Array.from({ length: totalSets }, (_, i) => {
            const setNum = i + 1;
            const isCompleted = setNum < currentSet;
            const isCurrent = setNum === currentSet;
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-1"
              >
                <motion.div
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                    backgroundColor: isCompleted 
                      ? '#22c55e' 
                      : isCurrent 
                        ? '#f97316' 
                        : '#e5e7eb',
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`
                    h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${isCompleted ? 'text-white' : isCurrent ? 'text-white ring-4 ring-orange-200' : 'text-zinc-400'}
                  `}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <span className="font-heading">{setNum}</span>
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium uppercase tracking-wide ${
                  isCurrent ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-zinc-400'
                }`}>
                  {isCompleted ? 'Done' : isCurrent ? 'Now' : `Set ${setNum}`}
                </span>
              </motion.div>
            );
          })}
        </div>
        
        {/* Target Reps Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full">
          <span className="text-xs font-medium text-zinc-500">Target:</span>
          <span className="text-xs font-bold text-zinc-700">{exercise.defaultReps} reps</span>
        </div>
      </div>

      {/* Rep Counter - Premium Card */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-zinc-900/5 border border-zinc-100/80">
        <p className="text-center text-zinc-400 text-xs uppercase tracking-widest font-medium mb-4">
          Actual Reps
        </p>
        <div className="flex items-center justify-center gap-8">
          <motion.button
            onClick={() => setReps(Math.max(1, reps - 1))}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30"
          >
            <Minus size={22} strokeWidth={3} />
          </motion.button>

          <motion.div 
            key={reps}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-bold font-heading text-zinc-900 min-w-[100px] text-center tabular-nums"
          >
            {reps}
          </motion.div>

          <motion.button
            onClick={() => setReps(reps + 1)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <Plus size={22} strokeWidth={3} />
          </motion.button>
        </div>
        
        {/* Quick adjust buttons */}
        <div className="flex justify-center gap-2 mt-4">
          {[-5, -2, +2, +5].map(delta => (
            <button
              key={delta}
              onClick={() => setReps(Math.max(1, reps + delta))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                delta < 0 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
            >
              {delta > 0 ? '+' : ''}{delta}
            </button>
          ))}
        </div>
      </div>

      {/* Pain Level - Collapsible Subtle Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <p className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
              Pain Level
            </p>
          </div>
          <span className={`text-lg font-bold ${
            painLevel === 0 ? 'text-green-600' : painLevel <= 3 ? 'text-amber-500' : 'text-red-500'
          }`}>
            {painLevel}/10
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="10"
          value={painLevel}
          onChange={(e) => setPainLevel(parseInt(e.target.value))}
          className={`w-full h-2 mt-3 rounded-full appearance-none cursor-pointer transition-all
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
            ${painLevel === 0 
              ? 'bg-gradient-to-r from-green-200 to-green-300 [&::-webkit-slider-thumb]:bg-green-500' 
              : painLevel <= 3 
                ? 'bg-gradient-to-r from-green-200 via-amber-200 to-amber-300 [&::-webkit-slider-thumb]:bg-amber-500'
                : 'bg-gradient-to-r from-amber-200 via-orange-300 to-red-400 [&::-webkit-slider-thumb]:bg-red-500'
            }
          `}
        />

        {/* High Pain Warning - Inline */}
        <AnimatePresence>
          {showHighPainWarning && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ High pain detected. Exercise may be swapped to safer alternative.
                </p>
              </div>
              
              <div>
                <BlockerPicker
                  selectedBlockerId={selectedBlockerId}
                  onSelect={setSelectedBlockerId}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Button */}
      <AnimatePresence mode="wait">
        {restTimer !== null ? (
          <motion.div
            key="rest"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Rest Timer with Progress */}
            <div className="relative bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-2xl p-6 overflow-hidden">
              {/* Progress bar background */}
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: `${restProgress}%` }}
                className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-blue-500/30"
              />
              
              <div className="relative flex items-center justify-center gap-4">
                <Timer size={24} className="text-blue-600" />
                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Rest Period</p>
                  <p className="text-4xl font-bold font-heading text-zinc-800 tabular-nums">{restTimer}s</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSkipRest}
              className="w-full h-12 rounded-xl bg-zinc-800 text-white font-bold text-sm uppercase tracking-wider hover:bg-zinc-700 transition-colors"
            >
              Skip Rest →
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="complete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={handleLogSet}
            disabled={logging}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full h-16 rounded-2xl font-bold text-base uppercase tracking-wider 
              flex items-center justify-center gap-2 transition-all
              ${logging 
                ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' 
                : currentSet >= totalSets
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              }
            `}
          >
            {logging ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : currentSet >= totalSets ? (
              <>
                <CheckCircle size={20} />
                Complete Exercise
              </>
            ) : (
              <>
                <Check size={20} strokeWidth={3} />
                Log Set {currentSet} →
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Swap Modal */}
      <AnimatePresence>
        {swapSuggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={handleAcceptSwap}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mb-3">
                  <AlertTriangle size={28} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">
                  Exercise Swap
                </h3>
                <p className="text-zinc-500 text-sm mt-1">
                  Consider a safer alternative.
                </p>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">From:</span>
                  <span className="font-bold text-red-500 line-through text-sm">
                    {swapSuggestion.from}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">To:</span>
                  <span className="font-bold text-green-600 text-sm">
                    {swapSuggestion.to}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAcceptSwap}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold uppercase tracking-wider text-sm shadow-lg shadow-green-500/30"
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

