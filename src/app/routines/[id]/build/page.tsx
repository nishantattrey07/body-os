"use client";

import { getExercises } from "@/app/actions/exercises";
import {
    addExerciseToRoutine,
    getRoutineById,
    removeExerciseFromRoutine,
    updateRoutineExercise,
} from "@/app/actions/routines";
import { motion } from "framer-motion";
import { ArrowLeft, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Exercise {
    id: string;
    name: string;
    category: string;
    defaultSets: number;
    defaultReps: number;
    isSystem: boolean;
}

interface RoutineExercise {
    id: string;
    order: number;
    sets: number;
    reps: number;
    restSeconds: number;
    exercise: Exercise;
}

export default function RoutineBuilderPage() {
    const router = useRouter();
    const params = useParams();
    const routineId = params.id as string;

    const [routine, setRoutine] = useState<any>(null);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [routineData, exercisesData] = await Promise.all([
            getRoutineById(routineId),
            getExercises(),
        ]);
        setRoutine(routineData);
        setAvailableExercises(exercisesData as Exercise[]);
        setLoading(false);
    };

    const handleAddExercise = async (exercise: Exercise) => {
        try {
            await addExerciseToRoutine(routineId, exercise.id, {
                sets: exercise.defaultSets,
                reps: exercise.defaultReps,
                restSeconds: 90,
            });
            await loadData();
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

    const handleUpdateConfig = async (
        routineExerciseId: string,
        field: "sets" | "reps" | "restSeconds",
        value: number
    ) => {
        try {
            await updateRoutineExercise(routineExerciseId, { [field]: value });
            await loadData();
        } catch (error) {
            alert("Failed to update exercise");
        }
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
            <div className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <button
                        onClick={() => router.back()}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center gap-2"
                    >
                        <Save size={18} />
                        Done
                    </button>
                </div>
                <h1 className="text-2xl font-bold font-heading">{routine.name}</h1>
                {routine.description && (
                    <p className="text-sm text-zinc-600 mt-1">{routine.description}</p>
                )}
            </div>

            {/* Exercise List */}
            <div className="px-6 py-6 space-y-3">
                {routine.exercises.length === 0 ? (
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
                    <>
                        {routine.exercises.map((re: RoutineExercise, idx: number) => (
                            <motion.div
                                key={re.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border-2 border-zinc-100 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Order */}
                                    <div className="flex flex-col items-center gap-1 pt-1">
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

                                            {/* Reps */}
                                            <div>
                                                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-1">
                                                    Reps
                                                </label>
                                                <input
                                                    type="number"
                                                    value={re.reps}
                                                    onChange={(e) =>
                                                        handleUpdateConfig(re.id, "reps", parseInt(e.target.value) || 1)
                                                    }
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
                                                    step="15"
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
                            </motion.div>
                        ))}

                        {/* Add Exercise Button */}
                        <button
                            onClick={() => setShowExercisePicker(true)}
                            className="w-full py-4 border-2 border-dashed border-zinc-300 rounded-2xl text-zinc-500 font-semibold hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            Add Exercise
                        </button>
                    </>
                )}
            </div>

            {/* Exercise Picker Modal */}
            {showExercisePicker && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-end">
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="w-full bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto"
                    >
                        <div className="sticky top-0 bg-white border-b border-zinc-100 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold font-heading">Add Exercise</h2>
                            <button
                                onClick={() => setShowExercisePicker(false)}
                                className="text-zinc-500 hover:text-zinc-700"
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="p-6 space-y-2">
                            {availableExercises.map((exercise) => (
                                <button
                                    key={exercise.id}
                                    onClick={() => handleAddExercise(exercise)}
                                    className="w-full text-left p-4 bg-zinc-50 hover:bg-orange-50 rounded-xl transition-colors"
                                >
                                    <div className="font-semibold text-zinc-900">{exercise.name}</div>
                                    <div className="text-sm text-zinc-500">
                                        {exercise.category} • {exercise.defaultSets}×{exercise.defaultReps}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
