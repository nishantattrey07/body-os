"use client";

import { logExercise } from "@/app/actions/workout";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Minus, Plus } from "lucide-react";
import { useState } from "react";

interface ExerciseLoggerProps {
  exercise: any;
  onComplete: () => void;
}

export function ExerciseLogger({ exercise, onComplete }: ExerciseLoggerProps) {
  const [reps, setReps] = useState(exercise.defaultReps || 10);
  const [painLevel, setPainLevel] = useState(0);
  const [showPainSlider, setShowPainSlider] = useState(false);
  const [logging, setLogging] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [swapSuggestion, setSwapSuggestion] = useState<any>(null);
  const [currentSet, setCurrentSet] = useState(1);
  const totalSets = exercise.defaultSets || 3;

  const handleLogSet = async () => {
    if (logging) return;
    
    setLogging(true);
    try {
      const result = await logExercise({
        exerciseId: exercise.id,
        reps,
        painLevel: showPainSlider ? painLevel : undefined,
      });

      // Check for pain-based swap
      if (result.swapSuggestion) {
        setSwapSuggestion(result.swapSuggestion);
      } else {
        // Check if this was the last set
        if (currentSet >= totalSets) {
          // Exercise complete - move to next
          setTimeout(() => onComplete(), 500);
        } else {
          // More sets to go - start rest timer
          setCurrentSet(prev => prev + 1);
          setCurrentSet(prev => prev + 1);
          // Use configured rest time (default to 60s if missing)
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
              // No rest
              setRestTimer(null);
          }
          
          // Show pain slider for next set
          setShowPainSlider(true);
        }
      }
    } catch (error: any) {
      console.error("Failed to log exercise:", error);
      if (error.message?.includes("warmup")) {
        alert("Complete warmup before logging exercises!");
      } else {
        alert("Failed to log exercise. Please try again.");
      }
    } finally {
      setLogging(false);
    }
  };

  const handleAcceptSwap = () => {
    // User acknowledges the swap - move to next exercise
    onComplete();
  };

  return (
    <div className="w-full space-y-6">
      {/* Exercise Name */}
      <div className="text-center">
        <h2 className="text-3xl font-bold font-heading text-foreground">
          {exercise.name}
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Set {currentSet} of {totalSets} × {exercise.defaultReps} reps
        </p>
      </div>

      {/* Set Progress Indicator */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalSets }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-12 rounded-full transition-colors ${
              index < currentSet - 1
                ? 'bg-green-500'
                : index === currentSet - 1
                ? 'bg-blue-500'
                : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>

      {/* Rep Counter */}
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <p className="text-center text-zinc-400 text-sm uppercase tracking-wider mb-4">
          Reps
        </p>
        <div className="flex items-center justify-center gap-6">
          <motion.button
            onClick={() => setReps(Math.max(1, reps - 1))}
            whileTap={{ scale: 0.9 }}
            className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg"
          >
            <Minus size={24} />
          </motion.button>

          <div className="text-7xl font-bold font-heading text-foreground min-w-[120px] text-center">
            {reps}
          </div>

          <motion.button
            onClick={() => setReps(reps + 1)}
            whileTap={{ scale: 0.9 }}
            className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </div>

      {/* Pain Slider (shows after first set) */}
      <AnimatePresence>
        {showPainSlider && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-amber-600" />
              <p className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                Elbow Pain Level?
              </p>
            </div>
            
            <input
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className="w-full h-3 bg-amber-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600"
            />
            
            <div className="flex justify-between mt-2">
              <span className="text-xs text-amber-600">0 (No pain)</span>
              <span className="text-2xl font-bold text-amber-900">{painLevel}</span>
              <span className="text-xs text-amber-600">10 (Severe)</span>
            </div>

            {painLevel > 3 && (
              <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-xl">
                <p className="text-xs text-red-700 font-medium">
                  ⚠️ High pain detected. Exercise may be swapped to safer alternative.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Set Button */}
      <motion.button
        onClick={handleLogSet}
        disabled={logging || restTimer !== null}
        whileTap={{ scale: 0.98 }}
        className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {logging ? (
          "Logging..."
        ) : restTimer !== null ? (
          <>Rest ({restTimer}s)</>
        ) : currentSet > totalSets ? (
          <>
            <CheckCircle size={20} />
            Exercise Complete
          </>
        ) : (
          <>Log Set {currentSet}/{totalSets}</>
        )}
      </motion.button>

      {/* Swap Alert Modal */}
      <AnimatePresence>
        {swapSuggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={handleAcceptSwap}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                  <AlertTriangle size={32} className="text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Exercise Swap
                </h3>
                <p className="text-zinc-600 text-sm">
                  {swapSuggestion.reason}
                </p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">From:</span>
                  <span className="font-bold text-red-600 line-through">
                    {swapSuggestion.originalExercise.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">To:</span>
                  <span className="font-bold text-green-600">
                    {swapSuggestion.swapToExercise.name}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAcceptSwap}
                className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider"
              >
                Got It - Next Exercise
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
