"use client";

import { completeExercise, logSet } from "@/app/actions/workout-session";
import { BlockerPicker } from "@/components/blockers/BlockerPicker";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Loader2, Minus, Plus } from "lucide-react";
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
  const [swapSuggestion, setSwapSuggestion] = useState<any>(null);
  const [currentSet, setCurrentSet] = useState(1);
  const totalSets = exercise.defaultSets || 3;

  const handleLogSet = async () => {
    if (logging) return;
    
    setLogging(true);
    try {
      if (sessionExerciseId) {
        const result = await logSet({
          sessionExerciseId,
          setNumber: currentSet,
          targetReps: exercise.defaultReps || 10,
          actualReps: reps,
          weight: 0,
          painLevel: painLevel,
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
          setRestTimer(restTime);
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

  const showHighPainWarning = painLevel > 3;

  return (
    <div className="w-full space-y-4">
      {/* Exercise Name */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold font-heading text-zinc-900 uppercase tracking-tight">
          {exercise.name}
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Set {currentSet} of {totalSets} × {exercise.defaultReps} reps
        </p>
      </div>

      {/* Rep Counter - Clean White Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
        <p className="text-center text-zinc-400 text-xs uppercase tracking-widest font-medium mb-4">
          Reps
        </p>
        <div className="flex items-center justify-center gap-6">
          <motion.button
            onClick={() => setReps(Math.max(1, reps - 1))}
            whileTap={{ scale: 0.95 }}
            className="h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center"
          >
            <Minus size={20} strokeWidth={3} />
          </motion.button>

          <div className="text-6xl font-bold font-heading text-zinc-900 min-w-[80px] text-center tabular-nums">
            {reps}
          </div>

          <motion.button
            onClick={() => setReps(reps + 1)}
            whileTap={{ scale: 0.95 }}
            className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center"
          >
            <Plus size={20} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* Pain Level - Subtle White Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} className="text-amber-500" />
          <p className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
            Pain Level?
          </p>
        </div>
        
        <input
          type="range"
          min="0"
          max="10"
          value={painLevel}
          onChange={(e) => setPainLevel(parseInt(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
        />
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-[10px] text-zinc-400 font-medium">0 (No pain)</span>
          <span className="text-lg font-bold text-zinc-800">{painLevel}</span>
          <span className="text-[10px] text-zinc-400 font-medium">10 (Severe)</span>
        </div>

        {/* High Pain Warning - Inline */}
        <AnimatePresence>
          {showHighPainWarning && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ High pain detected. Exercise may be swapped to safer alternative.
                </p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-2">
                  Link to Body Issue
                </p>
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
      <motion.button
        onClick={handleLogSet}
        disabled={logging || restTimer !== null}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full h-14 rounded-2xl font-bold text-base uppercase tracking-wider 
          flex items-center justify-center gap-2 transition-all
          ${restTimer !== null 
            ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
          }
        `}
      >
        {logging ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Logging...
          </>
        ) : restTimer !== null ? (
          <>Rest ({restTimer}s)</>
        ) : (
          <>
            <CheckCircle size={18} />
            Exercise Complete
          </>
        )}
      </motion.button>

      {/* Swap Modal */}
      <AnimatePresence>
        {swapSuggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
            onClick={handleAcceptSwap}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
                  <AlertTriangle size={24} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">
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
                className="w-full h-12 rounded-xl bg-green-500 text-white font-bold uppercase tracking-wider text-sm"
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
