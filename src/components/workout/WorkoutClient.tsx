"use client";

import { getRoutinesPaginated } from "@/app/actions/routines";
import {
    abandonWorkoutSession,
    completeWorkoutSession,
    getActiveSession,
    getResumePosition,
} from "@/app/actions/workout-session";
import { ExerciseLogger } from "@/components/workout/ExerciseLogger";
import { ExitConfirmationModal } from "@/components/workout/ExitConfirmationModal";
import { PostWorkoutData, PostWorkoutModal } from "@/components/workout/PostWorkoutModal";
import { PreWorkoutData, PreWorkoutModal } from "@/components/workout/PreWorkoutModal";
import { ResumeModal } from "@/components/workout/ResumeModal";
import { WarmupGate } from "@/components/workout/WarmupGate";
import { useStartWorkoutSession } from "@/hooks/mutations/useStartWorkoutSession";
import { useNavigation } from "@/providers/NavigationProvider";
import { useWorkoutUIStore } from "@/store/workout-ui-store";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type FilterType = "all" | "system" | "user";

interface WorkoutClientProps {
  initialSession: any | null;
  initialRoutines: any[];
  initialHasMore: boolean;
  initialCursor: string | null;
}

/**
 * WorkoutClient - Client Component for workout flow
 * 
 * Receives initial data from Server Component (no loading skeleton needed).
 * Uses Zustand for UI state and React Query mutations for server sync.
 */
export function WorkoutClient({
  initialSession,
  initialRoutines,
  initialHasMore,
  initialCursor,
}: WorkoutClientProps) {
  const { navigateTo, navigateBack } = useNavigation();

  // Zustand store for UI state
  const {
    stage,
    setStage,
    selectedRoutine,
    selectRoutine,
    clearRoutineSelection,
    sessionId,
    currentExerciseIndex,
    advanceExercise,
    goToExercise,
    setsLoggedCount,
    incrementSetsLogged,
    showResumeModal,
    setShowResumeModal,
    showExitConfirm,
    setShowExitConfirm,
    hydrateFromSession,
    reset,
    startSession: storeStartSession,
  } = useWorkoutUIStore();

  // Local state for data that needs pagination/search
  const [routines, setRoutines] = useState(initialRoutines);
  const [activeSession, setActiveSession] = useState(initialSession);
  const [warmupData, setWarmupData] = useState<any>(null);
  const [pendingRoutine, setPendingRoutine] = useState<any>(null);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Pagination State
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // Scroll state for gradient visibility
  const [isScrolled, setIsScrolled] = useState(false);

  // Mutation hooks
  const startWorkoutMutation = useStartWorkoutSession();

  // Hydrate store on mount
  useEffect(() => {
    if (initialSession) {
      hydrateFromSession(initialSession);
      setShowResumeModal(true);
    } else {
      setStage('select');
    }
  }, []);

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

  // Reload routines when search or filter changes
  useEffect(() => {
    if (stage === 'select') {
      loadRoutines(true);
    }
  }, [debouncedSearch, filter]);

  const loadRoutines = async (resetList = false) => {
    if (resetList) {
      setLoading(true);
      setCursor(null);
    }

    const { items, nextCursor, hasMore: more } = await getRoutinesPaginated({
      search: debouncedSearch || undefined,
      includeSystem: filter !== "user",
      includeUser: filter !== "system",
      limit: 20,
      cursor: resetList ? undefined : (cursor || undefined),
    });

    if (resetList) {
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
      selectRoutine(routine);
    }
  };

  const handlePreWorkoutSubmit = async (data: PreWorkoutData) => {
    if (!selectedRoutine) return;

    startWorkoutMutation.mutate({
      routineId: selectedRoutine.id,
      ...data,
    }, {
      onSuccess: (result) => {
        if (result.session) {
          setActiveSession(result.session);
          setWarmupData(result.warmupData);
          setWorkoutStartTime(new Date());
          storeStartSession(result.session.id, result.warmupData);
        }
      },
    });
  };

  const handleWarmupComplete = () => {
    setStage('exercise');
    goToExercise(0);
    if (!workoutStartTime) {
      setWorkoutStartTime(new Date());
    }
  };

  const handleExerciseComplete = async (exerciseSetsCount: number) => {
    // Track sets locally
    incrementSetsLogged(exerciseSetsCount);

    const exercises = activeSession?.exercises || selectedRoutine?.exercises || [];
    if (currentExerciseIndex < exercises.length - 1) {
      advanceExercise();
    } else {
      // Workout complete - refresh session for accurate activeSeconds
      if (activeSession) {
        const refreshedSession = await getActiveSession();
        if (refreshedSession) {
          setActiveSession(refreshedSession);
        }
      }
      setStage('post-workout');
    }
  };

  const handlePostWorkoutSubmit = async (data: PostWorkoutData) => {
    try {
      if (activeSession) {
        await completeWorkoutSession(activeSession.id, data);
      }
      reset();
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
      const position = await getResumePosition(activeSession.id);

      if (position?.complete) {
        setStage('post-workout');
      } else {
        selectRoutine(activeSession.routine);
        goToExercise(position?.exerciseIndex || 0);
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

    // Reset Zustand store state
    reset();

    // If user was trying to start a new routine, continue to pre-workout
    if (pendingRoutine) {
      selectRoutine(pendingRoutine);
      setPendingRoutine(null);
    } else {
      // Otherwise go back to routine selection
      setStage('select');
    }
  };

  const handleStartFresh = async () => {
    setShowResumeModal(false);

    if (activeSession) {
      await abandonWorkoutSession(activeSession.id);

      const routineToStart = pendingRoutine || activeSession.routine;
      selectRoutine(routineToStart);
      setActiveSession(null);
      setPendingRoutine(null);
    } else if (pendingRoutine) {
      selectRoutine(pendingRoutine);
      setPendingRoutine(null);
    }
  };

  // Calculate current exercise
  const exercises = activeSession?.exercises || selectedRoutine?.exercises || [];
  const currentSessionExercise = exercises[currentExerciseIndex];
  const currentExercise = currentSessionExercise?.exercise || currentSessionExercise?.exercise;

  // Get session exercise ID for logging
  const sessionExerciseId = activeSession?.exercises?.[currentExerciseIndex]?.id;

  // Calculate workout stats for post-workout modal
  const workoutDuration = activeSession?.activeSeconds
    ? Math.floor(activeSession.activeSeconds / 60)
    : 0;

  const filterLabels: Record<FilterType, string> = {
    all: "All",
    system: "System",
    user: "My Routines",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <ExitConfirmationModal
            onCancel={() => setShowExitConfirm(false)}
            onConfirm={() => {
              setShowExitConfirm(false);
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
              clearRoutineSelection();
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
            setsCompleted={setsLoggedCount}
            onComplete={handlePostWorkoutSubmit}
          />
        )}
      </AnimatePresence>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-orange-50/90 to-white/90 backdrop-blur-md border-b border-orange-100/50 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => {
            if (stage === 'select' || stage === 'loading') {
              navigateBack();
            } else if (stage === 'warmup') {
              setStage('select');
              clearRoutineSelection();
            } else if (stage === 'exercise') {
              setShowExitConfirm(true);
            }
          }}
          className="p-2.5 rounded-2xl bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all shadow-sm border border-white/50"
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
          <div className="fixed top-[72px] left-0 right-0 z-20 bg-gradient-to-b from-orange-50/95 to-orange-50/80 backdrop-blur-sm">
            {/* Floating Search Bar */}
            <div className="px-6 pt-2 pb-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-orange-100/30 border border-white/60 p-4 mx-2 flex items-center gap-3">
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

            {/* Orange gradient - only visible when scrolled */}
            <div className={`absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-orange-200/40 to-transparent pointer-events-none transform translate-y-full transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />
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
                    <motion.button
                      key={routine.id}
                      onClick={() => handleSelectRoutine(routine)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-6 rounded-3xl bg-white/70 backdrop-blur-sm border border-white/60 hover:shadow-lg shadow-md shadow-orange-100/20 transition-all text-left"
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
                    </motion.button>
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
            <WarmupGate
              sessionId={activeSession?.id || sessionId || ''}
              onUnlock={handleWarmupComplete}
              initialWarmupData={warmupData}
            />
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
                defaultSets: currentSessionExercise?.targetSets || currentExercise.defaultSets || 3,
                defaultReps: currentSessionExercise?.targetReps || currentExercise.defaultReps || 10,
                restSeconds: currentSessionExercise?.restSeconds ?? currentExercise.restSeconds ?? 90,
              }}
              onComplete={handleExerciseComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
