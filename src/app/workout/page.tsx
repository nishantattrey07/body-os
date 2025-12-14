"use client";

import { getWorkoutRoutines } from "@/app/actions/workout";
import {
  abandonWorkoutSession,
  completeWorkoutSession,
  getActiveSession,
  getResumePosition,
  startWorkoutSession
} from "@/app/actions/workout-session";
import { ExerciseLogger } from "@/components/workout/ExerciseLogger";
import { PostWorkoutData, PostWorkoutModal } from "@/components/workout/PostWorkoutModal";
import { PreWorkoutData, PreWorkoutModal } from "@/components/workout/PreWorkoutModal";
import { ResumeModal } from "@/components/workout/ResumeModal";
import { WarmupGate } from "@/components/workout/WarmupGate";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Stage = 'loading' | 'select' | 'pre-workout' | 'warmup' | 'exercise' | 'post-workout';

export default function WorkoutPage() {
  const router = useRouter();
  
  const [stage, setStage] = useState<Stage>('loading');
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [routines, setRoutines] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Session state
  const [activeSession, setActiveSession] = useState<any>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingRoutine, setPendingRoutine] = useState<any>(null);
  
  // Stats for post-workout - track locally for accuracy
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [setsLogged, setSetsLogged] = useState(0);

  useEffect(() => {
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      // Check for existing active session first
      const existingSession = await getActiveSession();
      
      if (existingSession) {
        setActiveSession(existingSession);
        setShowResumeModal(true);
      }
      
      // Load routines
      const data = await getWorkoutRoutines();
      setRoutines(data);
    } catch (error) {
      console.error("Failed to check session:", error);
    } finally {
      setLoading(false);
      setStage('select');
    }
  };

  const handleSelectRoutine = (routine: any) => {
    if (activeSession) {
      // If there's an active session, ask to resume first
      setShowResumeModal(true);
      setPendingRoutine(routine);
    } else {
      setSelectedRoutine(routine);
      setStage('pre-workout');
    }
  };

  const handlePreWorkoutSubmit = async (data: PreWorkoutData) => {
    try {
      const session = await startWorkoutSession({
        routineId: selectedRoutine.id,
        ...data,
      });
      
      setActiveSession(session);
      setWorkoutStartTime(new Date());
      setStage('warmup');
    } catch (error: any) {
      console.error("Failed to start session:", error);
      alert(error.message || "Failed to start workout");
    }
  };

  const handleWarmupComplete = () => {
    setStage('exercise');
    setCurrentExerciseIndex(0);
    if (!workoutStartTime) {
      setWorkoutStartTime(new Date());
    }
  };

  const handleExerciseComplete = (exerciseSetsCount: number) => {
    // Track sets locally
    setSetsLogged(prev => prev + exerciseSetsCount);
    
    const exercises = activeSession?.exercises || selectedRoutine?.exercises || [];
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Workout complete - show post-workout modal
      setStage('post-workout');
    }
  };

  const handlePostWorkoutSubmit = async (data: PostWorkoutData) => {
    try {
      if (activeSession) {
        await completeWorkoutSession(activeSession.id, data);
      }
      setActiveSession(null);
      router.push('/');
    } catch (error) {
      console.error("Failed to complete session:", error);
      router.push('/');
    }
  };

  // Resume modal handlers
  const handleResume = async () => {
    setShowResumeModal(false);
    
    if (activeSession) {
      // Find resume position
      const position = await getResumePosition(activeSession.id);
      
      if (position?.complete) {
        setStage('post-workout');
      } else {
        setSelectedRoutine(activeSession.routine);
        setCurrentExerciseIndex(position?.exerciseIndex || 0);
        setStage('exercise');
        setWorkoutStartTime(new Date(activeSession.startedAt));
      }
    }
  };

  const handleAbandon = async () => {
    setShowResumeModal(false);
    
    if (activeSession) {
      await abandonWorkoutSession(activeSession.id);
      setActiveSession(null);
    }
    
    // If user was trying to start a new routine, continue
    if (pendingRoutine) {
      setSelectedRoutine(pendingRoutine);
      setPendingRoutine(null);
      setStage('pre-workout');
    }
  };

  const handleStartFresh = async () => {
    setShowResumeModal(false);
    
    if (activeSession) {
      await abandonWorkoutSession(activeSession.id);
      setActiveSession(null);
    }
    
    // Start fresh with new routine
    if (pendingRoutine) {
      setSelectedRoutine(pendingRoutine);
      setPendingRoutine(null);
    }
    setStage('pre-workout');
  };

  // Calculate current exercise
  const exercises = activeSession?.exercises || selectedRoutine?.exercises || [];
  const currentSessionExercise = exercises[currentExerciseIndex];
  const currentExercise = currentSessionExercise?.exercise || currentSessionExercise?.exercise;
  
  // Get session exercise ID for logging
  const sessionExerciseId = activeSession?.exercises?.[currentExerciseIndex]?.id;

  // Calculate workout stats for post-workout modal - use local state for accuracy
  const workoutDuration = workoutStartTime 
    ? Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 60000) 
    : 0;

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto flex flex-col">
      {/* Resume Modal */}
      <AnimatePresence>
        {showResumeModal && activeSession && (
          <ResumeModal
            session={activeSession}
            onResume={handleResume}
            onAbandon={handleAbandon}
            onStartFresh={handleStartFresh}
          />
        )}
      </AnimatePresence>

      {/* Pre-Workout Modal */}
      <AnimatePresence>
        {stage === 'pre-workout' && selectedRoutine && (
          <PreWorkoutModal
            routineName={selectedRoutine.name}
            onStart={handlePreWorkoutSubmit}
            onCancel={() => {
              setSelectedRoutine(null);
              setStage('select');
            }}
          />
        )}
      </AnimatePresence>

      {/* Post-Workout Modal */}
      <AnimatePresence>
        {stage === 'post-workout' && (
          <PostWorkoutModal
            routineName={selectedRoutine?.name || activeSession?.routine?.name || "Workout"}
            duration={workoutDuration}
            setsCompleted={setsLogged}
            onComplete={handlePostWorkoutSubmit}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (stage === 'select' || stage === 'loading') {
                router.back();
              } else if (stage === 'warmup') {
                setStage('select');
                setSelectedRoutine(null);
              } else if (stage === 'exercise') {
                // Warn about leaving mid-workout
                if (confirm("Leave workout? Your progress is saved.")) {
                  setStage('select');
                }
              }
            }}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="text-zinc-600" />
          </button>
          <div className="overflow-hidden">
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground font-heading truncate">
              {stage === 'select' || stage === 'loading' 
                ? 'Select Routine' 
                : stage === 'warmup' 
                ? 'Warmup' 
                : (selectedRoutine?.name || activeSession?.routine?.name || 'Workout')}
            </h1>
          </div>
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
        {(stage === 'select' || stage === 'loading') && (
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
                  {currentExerciseIndex + 1} / {exercises.length}
                </span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            <ExerciseLogger 
              key={currentExercise.id}
              sessionExerciseId={sessionExerciseId}
              exercise={{
                ...currentExercise,
                // Override defaults with Routine-specific config
                defaultSets: currentSessionExercise?.sets?.length || 
                  selectedRoutine?.exercises?.[currentExerciseIndex]?.sets || 
                  currentExercise.defaultSets,
                defaultReps: selectedRoutine?.exercises?.[currentExerciseIndex]?.reps || 
                  currentExercise.defaultReps,
                restSeconds: selectedRoutine?.exercises?.[currentExerciseIndex]?.restSeconds || 
                  currentExercise.restSeconds,
              }}
              onComplete={handleExerciseComplete} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
