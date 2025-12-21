
"use client";

import { getExercises } from "@/app/actions/exercises";
import {
    addExerciseToRoutine,
    batchUpdateRoutineExercises,
    getRoutineById,
    removeExerciseFromRoutine
} from "@/app/actions/routines";
import { motion, Reorder } from "framer-motion";
import { ArrowLeft, GripVertical, Plus, Save, Search, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Types
type RoutineExercise = {
    id: string;
    order: number;
    sets: number;
    reps: number | null;
    duration: number | null;  // For time-based exercises (seconds)
    restSeconds: number;
    exercise: Exercise;
};

type Exercise = {
    id: string;
    name: string;
    category: string;
    trackingType: string;      // "reps" | "seconds"
    defaultSets: number;
    defaultReps: number | null;
    defaultDuration: number | null;
};

export default function RoutineBuilderPage() {
    const router = useRouter();
    const params = useParams();
    const routineId = params.id as string;

    const [routine, setRoutine] = useState<any>(null);
    const [localExercises, setLocalExercises] = useState<RoutineExercise[]>([]);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [routineData, exercisesData] = await Promise.all([
            getRoutineById(routineId),
            getExercises(),
        ]);

        // Protect system routines from editing
        if (routineData?.isSystem) {
            toast.error("System routines cannot be edited", {
                description: "This is a pre-built routine. Create your own routine to customize exercises."
            });
            router.back();
            return;
        }

        setRoutine(routineData);
        if (routineData?.exercises) {
            setLocalExercises(routineData.exercises);
        }
        setAvailableExercises(exercisesData as Exercise[]);
        setLoading(false);
        setIsDirty(false);
    };

    const handleSave = async () => {
        if (!isDirty) return;
        setIsSaving(true);
        try {
            await batchUpdateRoutineExercises(
                routineId,
                localExercises.map((e, idx) => ({
                    id: e.id,
                    order: idx + 1,
                    sets: e.sets,
                    reps: e.reps,
                    restSeconds: e.restSeconds,
                }))
            );
            await loadData(); // Reload to get fresh state
        } catch (error) {
            alert("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReorder = (newOrder: RoutineExercise[]) => {
        setLocalExercises(newOrder);
        setIsDirty(true);
    };

    const handleAddExercise = async (exercise: Exercise) => {
        try {
            // Immediate server action for adding (easier than optimistic for new IDs)
            await addExerciseToRoutine(routineId, exercise.id, {
                sets: exercise.defaultSets,
                reps: exercise.defaultReps,
                restSeconds: 90,
            });
            await loadData(); // Reloads everything
            setShowExercisePicker(false);
        } catch (error) {
            alert("Failed to add exercise");
        }
    };

    const handleRemoveExercise = async (routineExerciseId: string) => {
        try {
            await removeExerciseFromRoutine(routineExerciseId);
            await loadData();
        } catch (error) {
             alert("Failed to remove exercise");
        }
    };

    const handleUpdateConfig = (
        routineExerciseId: string,
        field: "sets" | "reps" | "duration" | "restSeconds",
        value: number
    ) => {
        setLocalExercises(prev => prev.map(e => 
            e.id === routineExerciseId ? { ...e, [field]: value } : e
        ));
        setIsDirty(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
                <p className="text-zinc-500">Loading...</p>
            </div>
        );
    }

    if (!routine) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
                <p className="text-zinc-500">Routine not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold font-heading truncate max-w-[200px]">{routine.name}</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                        isDirty 
                            ? "bg-green-500 hover:bg-green-600 text-white shadow-md transform hover:scale-105" 
                            : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    }`}
                >
                    <Save size={18} />
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>

            {/* Exercise List */}
            <div className="px-6 py-6 space-y-3">
                {localExercises.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-500 mb-4">No exercises added yet</p>
                        <button
                            onClick={() => setShowExercisePicker(true)}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600"
                        >
                            Add First Exercise
                        </button>
                    </div>
                ) : (
                    <Reorder.Group axis="y" values={localExercises} onReorder={handleReorder} className="space-y-3">
                        {localExercises.map((re: RoutineExercise, idx: number) => (
                            <Reorder.Item
                                key={re.id}
                                value={re}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border-2 border-zinc-100 p-4 shadow-sm touch-none"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Order / Drag Handle */}
                                    <div className="flex flex-col items-center gap-1 pt-1 cursor-grab active:cursor-grabbing p-1">
                                        <GripVertical size={20} className="text-zinc-300" />
                                        <span className="text-sm font-bold text-zinc-400">{idx + 1}</span>
                                    </div>

                                    {/* Exercise Info */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-zinc-900 mb-3">{re.exercise.name}</h3>

                                        {/* Configuration */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {/* Sets */}
                                            <div>
                                                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-1">
                                                    Sets
                                                </label>
                                                <input
                                                    type="number"
                                                    value={re.sets}
                                                    onChange={(e) =>
                                                        handleUpdateConfig(re.id, "sets", parseInt(e.target.value) || 1)
                                                    }
                                                    min="1"
                                                    className="w-full px-3 py-2 rounded-lg border-2 border-zinc-200 focus:border-orange-500 outline-none font-bold text-center"
                                                />
                                            </div>

                                            {/* Reps or Seconds based on trackingType */}
                                            <div>
                                                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-1">
                                                    {re.exercise.trackingType === "seconds" ? "Seconds" : "Reps"}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={re.exercise.trackingType === "seconds" 
                                                        ? (re.duration ?? 60) 
                                                        : (re.reps ?? 10)}
                                                    onChange={(e) => {
                                                        const field = re.exercise.trackingType === "seconds" ? "duration" : "reps";
                                                        handleUpdateConfig(re.id, field, parseInt(e.target.value) || 1);
                                                    }}
                                                    min="1"
                                                    className="w-full px-3 py-2 rounded-lg border-2 border-zinc-200 focus:border-orange-500 outline-none font-bold text-center"
                                                />
                                            </div>

                                            {/* Rest */}
                                            <div>
                                                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-1">
                                                    Rest (s)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={re.restSeconds}
                                                    onChange={(e) =>
                                                        handleUpdateConfig(
                                                            re.id,
                                                            "restSeconds",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    min="0"
                                                    step="5"
                                                    className="w-full px-3 py-2 rounded-lg border-2 border-zinc-200 focus:border-orange-500 outline-none font-bold text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleRemoveExercise(re.id)}
                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                )}
            </div>

            {/* Add Exercise Button (Fixed at bottom) */}
             <div className="fixed bottom-6 right-6 z-40">
                 <button
                    onClick={() => setShowExercisePicker(true)}
                    className="w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 hover:scale-105 transition-all"
                >
                    <Plus size={28} />
                </button>
             </div>

            {/* Exercise Picker Modal */}
            {showExercisePicker && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="w-full bg-white rounded-t-3xl max-h-[80vh] flex flex-col"
                    >
                        {/* Sticky Header with Search */}
                        <div className="sticky top-0 bg-white border-b border-zinc-100 p-6 space-y-4 z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold font-heading">Add Exercise</h2>
                                <button
                                    onClick={() => {
                                        setShowExercisePicker(false);
                                        setSearchQuery("");
                                    }}
                                    className="text-zinc-500 hover:text-zinc-700"
                                >
                                    Cancel
                                </button>
                            </div>
                            
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search exercises..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-zinc-200 focus:border-orange-500 outline-none font-medium text-zinc-800 placeholder:text-zinc-400"
                                    autoFocus
                                />
                            </div>
                        </div>
                        
                        {/* Scrollable Exercise List */}
                        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-2">
                            {availableExercises
                                .filter(exercise => 
                                    searchQuery.trim() === "" || 
                                    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((exercise) => (
                                    <button
                                        key={exercise.id}
                                        onClick={() => handleAddExercise(exercise)}
                                        className="w-full text-left p-4 bg-zinc-50 hover:bg-orange-50 rounded-xl transition-colors"
                                    >
                                        <div className="font-semibold text-zinc-900">{exercise.name}</div>
                                        <div className="text-sm text-zinc-500">
                                            {exercise.category} • {exercise.defaultSets}×{
                                                exercise.trackingType === "seconds" 
                                                    ? `${exercise.defaultDuration || 60}s`
                                                    : exercise.defaultReps || 10
                                            }
                                        </div>
                                    </button>
                                ))}
                            
                            {/* Empty State */}
                            {availableExercises.filter(e =>
                                searchQuery.trim() === "" ||
                                e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                e.category.toLowerCase().includes(searchQuery.toLowerCase())
                            ).length === 0 && (
                                <div className="text-center py-8 text-zinc-500">
                                    No exercises found for &ldquo;{searchQuery}&rdquo;
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
