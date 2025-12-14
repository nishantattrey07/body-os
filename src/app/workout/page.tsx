"use client";

import { getWorkoutRoutines } from "@/app/actions/workout";
import { ExerciseLogger } from "@/components/workout/ExerciseLogger";
import { WarmupGate } from "@/components/workout/WarmupGate";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WorkoutPage() {
  const router = useRouter();
  
  const [stage, setStage] = useState<'select' | 'warmup' | 'exercise'>('select');
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [routines, setRoutines] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const data = await getWorkoutRoutines();
      setRoutines(data);
    } catch (error) {
      console.error("Failed to load routines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoutine = (routine: any) => {
    setSelectedRoutine(routine);
    setStage('warmup');
  };

  const handleWarmupComplete = () => {
    setStage('exercise');
    setCurrentExerciseIndex(0);
  };

  const handleExerciseComplete = () => {
    const exercises = selectedRoutine?.exercises || [];
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Workout complete
      alert("Workout complete! Great job!");
      router.push('/');
    }
  };

  const currentExercise = selectedRoutine?.exercises?.[currentExerciseIndex]?.exercise;

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (stage === 'select') {
                router.back();
              } else if (stage === 'warmup') {
                setStage('select');
              } else {
                setStage('warmup');
              }
            }}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="text-zinc-600" />
          </button>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground font-heading">
            {stage === 'select' ? 'Select Routine' : stage === 'warmup' ? 'Warmup' : 'Workout'}
          </h1>
        </div>
      </div>

      {/* Management Links (Only visible in select stage) */}
      {stage === 'select' && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => router.push('/routines')}
            className="flex-1 py-3 px-4 bg-orange-100 text-orange-700 rounded-2xl font-bold text-sm hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
          >
            <Dumbbell size={18} />
            Manage Routines
          </button>
          <button
            onClick={() => router.push('/exercises')}
            className="flex-1 py-3 px-4 bg-zinc-100 text-zinc-700 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <Dumbbell size={18} />
            Exercise Library
          </button>
        </div>
      ) }

      {/* Stages */}
      <AnimatePresence mode="wait">
        {stage === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {loading ? (
              <p className="text-center text-zinc-400 py-8">Loading routines...</p>
            ) : routines.length === 0 ? (
              <p className="text-center text-zinc-400 py-8">No routines available</p>
            ) : (
              routines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => handleSelectRoutine(routine)}
                  className="w-full p-6 rounded-3xl bg-white border border-zinc-100 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <Dumbbell className="text-red-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold font-heading text-foreground">
                        {routine.name}
                      </h3>
                      {routine.description && (
                        <p className="text-sm text-zinc-500 mt-1">{routine.description}</p>
                      )}
                      <p className="text-xs text-zinc-400 mt-2">
                        {routine.exercises?.length || 0} exercises
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}

        {stage === 'warmup' && (
          <motion.div
            key="warmup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <WarmupGate onUnlock={handleWarmupComplete} />
          </motion.div>
        )}

        {stage === 'exercise' && currentExercise && (
          <motion.div
            key="exercise"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">Exercise Progress</span>
                <span className="text-sm font-bold text-foreground">
                  {currentExerciseIndex + 1} / {selectedRoutine?.exercises?.length}
                </span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((currentExerciseIndex + 1) / selectedRoutine.exercises.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            <ExerciseLogger 
              key={currentExercise.id}
              exercise={currentExercise} 
              onComplete={handleExerciseComplete} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
