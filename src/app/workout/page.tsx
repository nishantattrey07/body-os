"use client";

import { getRoutinesPaginated } from "@/app/actions/routines";
import {
    abandonWorkoutSession,
    completeWorkoutSession,
    getActiveSession,
    getResumePosition,
    startWorkoutSession
} from "@/app/actions/workout-session";
import { ExerciseLogger } from "@/components/workout/ExerciseLogger";
import { ExitConfirmationModal } from "@/components/workout/ExitConfirmationModal";
import { PostWorkoutData, PostWorkoutModal } from "@/components/workout/PostWorkoutModal";
import { PreWorkoutData, PreWorkoutModal } from "@/components/workout/PreWorkoutModal";
import { ResumeModal } from "@/components/workout/ResumeModal";
import { WarmupGate } from "@/components/workout/WarmupGate";
import { useNavigation } from "@/providers/NavigationProvider";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Stage = 'loading' | 'select' | 'pre-workout' | 'warmup' | 'exercise' | 'post-workout';
type FilterType = "all" | "system" | "user";

export default function WorkoutPage() {
  const router = useRouter();
  const { navigateTo, navigateBack } = useNavigation();
  
  const [stage, setStage] = useState<Stage>('loading');
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [routines, setRoutines] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  
  // Pagination State
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Scroll state for gradient visibility
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Session state
  const [activeSession, setActiveSession] = useState<any>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingRoutine, setPendingRoutine] = useState<any>(null);
  
  // Exit modal state
  const [showExitModal, setShowExitModal] = useState(false);

  // Stats for post-workout - track locally for accuracy
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [setsLogged, setSetsLogged] = useState(0);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCursor(null);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    checkActiveSession();
  }, []);

  // Reload routines when search or filter changes
  useEffect(() => {
    if (stage === 'select') {
      loadRoutines(true);
    }
  }, [debouncedSearch, filter]);

  const checkActiveSession = async () => {
    try {
      // Check for existing active session first
      const existingSession = await getActiveSession();
      
      if (existingSession) {
        setActiveSession(existingSession);
        setShowResumeModal(true);
      }
      
      // Load routines with pagination
      await loadRoutines(true);
    } catch (error) {
      console.error("Failed to check session:", error);
    } finally {
      setLoading(false);
      setStage('select');
    }
  };

  const loadRoutines = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setCursor(null);
    }
    
    const { items, nextCursor, hasMore: more } = await getRoutinesPaginated({
      search: debouncedSearch || undefined,
      includeSystem: filter !== "user",
      includeUser: filter !== "system",
      limit: 20,
      cursor: reset ? undefined : (cursor || undefined),
    });
    
    if (reset) {
      setRoutines(items);
    } else {
      setRoutines(prev => [...prev, ...items]);
    }
    
    setCursor(nextCursor);
    setHasMore(more);
    setLoading(false);
    setLoadingMore(false);
  };

  const loadMoreRoutines = async () => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    await loadRoutines(false);
  };

  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreRoutines();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, cursor]);

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
      toast.error(error.message || "Failed to start workout");
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
      navigateTo('/');
    } catch (error) {
      console.error("Failed to complete session:", error);
      navigateTo('/');
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
      
      // Restart with the same routine or pending routine
      const routineToStart = pendingRoutine || activeSession.routine;
      setSelectedRoutine(routineToStart);
      setActiveSession(null);
      setPendingRoutine(null);
    } else if (pendingRoutine) {
      // No active session, but pending routine
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

  // Calculate workout stats for post-workout modal
  // Use activeSeconds from session (tracked server-side) for accuracy
  const workoutDuration = activeSession?.activeSeconds 
    ? Math.floor(activeSession.activeSeconds / 60) 
    : 0;

  const filterLabels: Record<FilterType, string> = {
    all: "All",
    system: "System",
    user: "My Routines",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
       {/* Exit Confirmation Modal */}
       <AnimatePresence>
        {showExitModal && (
          <ExitConfirmationModal
            onCancel={() => setShowExitModal(false)}
            onConfirm={() => {
              setShowExitModal(false);
              setStage('select');
            }}
          />
        )}
      </AnimatePresence>

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

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background border-b border-zinc-100 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => {
            if (stage === 'select' || stage === 'loading') {
              navigateBack();
            } else if (stage === 'warmup') {
              setStage('select');
              setSelectedRoutine(null);
            } else if (stage === 'exercise') {
              // Warn about leaving mid-workout - Show custom modal instead of native confirm
              setShowExitModal(true);
            }
          }}
          className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="text-zinc-600" />
        </button>
        <h1 className="text-2xl font-bold uppercase tracking-tighter text-foreground font-heading truncate">
          {stage === 'select' || stage === 'loading' 
            ? 'Select Routine' 
            : stage === 'warmup' 
            ? 'Warmup' 
            : (selectedRoutine?.name || activeSession?.routine?.name || 'Workout')}
        </h1>
      </div>

      {/* Select Stage Content */}
      {(stage === 'select' || stage === 'loading') && (
        <>
          {/* Fixed Search + Filters */}
          <div className="fixed top-[72px] left-0 right-0 z-20 bg-background">
            {/* Floating Search Bar */}
            <div className="px-6 pt-2 pb-2">
              <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 p-4 mx-2 flex items-center gap-3">
                <Search size={22} className="text-zinc-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search routines..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-zinc-400"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      onClick={() => setSearch("")}
                      className="p-1 hover:bg-zinc-100 rounded-full"
                    >
                      <X size={18} className="text-zinc-400" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              {(["all", "system", "user"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    filter === f
                      ? "bg-orange-500 text-white shadow-sm transform scale-105"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:border-orange-200"
                  }`}
                >
                  {filterLabels[f]}
                </button>
              ))}
            </div>

            {/* Management Links */}
            <div className="flex gap-4 px-6 py-2">
              <button
                onClick={() => navigateTo('/routines')}
                className="flex-1 py-3 px-4 bg-orange-100 text-orange-700 rounded-2xl font-bold text-sm hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
              >
                <Dumbbell size={18} />
                Manage Routines
              </button>
              <button
                onClick={() => navigateTo('/exercises')}
                className="flex-1 py-3 px-4 bg-zinc-100 text-zinc-700 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <Dumbbell size={18} />
                Exercise Library
              </button>
            </div>

            {/* Subtle gray gradient - only visible when scrolled */}
            <div className={`absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-zinc-200/50 to-transparent pointer-events-none transform translate-y-full transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          {/* Spacer for fixed elements */}
          <div className="h-72" />

          {/* Routines List */}
          <div className="px-6 pt-4 min-h-[50vh]">
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {loading ? (
                // Skeleton loading
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full p-6 rounded-3xl bg-white border border-zinc-100 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-zinc-100" />
                        <div className="flex-1">
                          <div className="h-6 w-32 bg-zinc-200 rounded mb-2" />
                          <div className="h-4 w-48 bg-zinc-100 rounded mb-1" />
                          <div className="h-3 w-20 bg-zinc-100 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : routines.length === 0 ? (
                <div className="text-center py-12">
                  <Dumbbell size={48} className="mx-auto text-zinc-300 mb-4" />
                  <p className="text-zinc-500 mb-4">
                    {search ? "No routines match your search" : "No routines available"}
                  </p>
                  {!search && (
                    <button
                      onClick={() => navigateTo('/routines')}
                      className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Create a Routine
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {routines.map((routine) => (
                    <button
                      key={routine.id}
                      onClick={() => handleSelectRoutine(routine)}
                      className="w-full p-6 rounded-3xl bg-white border border-zinc-100 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Dumbbell className="text-red-600" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold font-heading text-foreground">
                              {routine.name}
                            </h3>
                            {routine.isSystem && (
                              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                System
                              </span>
                            )}
                          </div>
                          {routine.description && (
                            <p className="text-sm text-zinc-500 mt-1 truncate">{routine.description}</p>
                          )}
                          <p className="text-xs text-zinc-400 mt-2">
                            {routine.exercises?.length || routine._count?.exercises || 0} exercises
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {hasMore && (
                    <div ref={loadMoreRef} className="py-8 text-center">
                      {loadingMore && (
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </>
      )}

      {/* Other Stages */}
      <AnimatePresence mode="wait">
        {stage === 'warmup' && (
          <motion.div
            key="warmup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-6 pt-24"
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
            className="p-6 pt-24"
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
                // currentSessionExercise IS the RoutineExercise which has sets/reps/restSeconds
                defaultSets: currentSessionExercise?.sets || currentExercise.defaultSets,
                defaultReps: currentSessionExercise?.reps || currentExercise.defaultReps,
                restSeconds: currentSessionExercise?.restSeconds ?? currentExercise.restSeconds,
              }}
              onComplete={handleExerciseComplete} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
