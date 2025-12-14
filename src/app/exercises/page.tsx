"use client";

import {
    createExercise,
    deleteExercise,
    getExerciseCategories,
    getExercises,
    updateExercise,
} from "@/app/actions/exercises";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { motion } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Exercise {
    id: string;
    name: string;
    category: string;
    defaultSets: number;
    defaultReps: number;
    description?: string | null;
    isSystem: boolean;
}

export default function ExercisesPage() {
    const router = useRouter();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [exercisesData, categoriesData] = await Promise.all([
            getExercises(),
            getExerciseCategories(),
        ]);
        setExercises(exercisesData as Exercise[]);
        setCategories(categoriesData);
        setLoading(false);
    };

    const handleCreate = async (data: any) => {
        try {
            await createExercise(data);
            await loadData();
            setIsFormOpen(false);
        } catch (error) {
            alert("Failed to create exercise");
        }
    };

    const handleEdit = (exercise: Exercise) => {
        setEditingExercise(exercise);
        setIsFormOpen(true);
    };

    const handleUpdate = async (data: any) => {
        if (!editingExercise) return;
        try {
            await updateExercise(editingExercise.id, data);
            await loadData();
            setIsFormOpen(false);
            setEditingExercise(null);
        } catch (error) {
            alert("Failed to update exercise");
        }
    };

    const handleDelete = async (exerciseId: string) => {
        if (!confirm("Delete this exercise? It will be removed from all routines.")) return;
        try {
            await deleteExercise(exerciseId);
            await loadData();
        } catch (error) {
            alert("Failed to delete exercise");
        }
    };

    const filteredExercises = selectedCategory
        ? exercises.filter((e) => e.category === selectedCategory)
        : exercises;

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold font-heading">Exercise Library</h1>
                
            </div>

            {/* Category Filter */}
            <div className="px-6 py-4 overflow-x-auto">
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${
                            selectedCategory === null
                                ? "bg-orange-500 text-white"
                                : "bg-white text-zinc-700 border-2 border-zinc-200 hover:border-orange-300"
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${
                                selectedCategory === cat
                                    ? "bg-orange-500 text-white"
                                    : "bg-white text-zinc-700 border-2 border-zinc-200 hover:border-orange-300"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exercise Grid */}
            <div className="px-6 pb-6">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Loading exercises...</div>
                ) : filteredExercises.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-500 mb-4">No exercises found</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                        >
                            Create Your First Exercise
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredExercises.map((exercise) => (
                            <ExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                onEdit={() => handleEdit(exercise)}
                                onDelete={() => handleDelete(exercise.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) for Mobile */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => {
                    setEditingExercise(null);
                    setIsFormOpen(true);
                }}
                className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-orange-600 hover:scale-105 transition-all"
            >
                <Plus size={28} />
            </motion.button>

            {/* Exercise Form Modal */}
            <ExerciseForm
                initialData={editingExercise ? {
                    name: editingExercise.name,
                    category: editingExercise.category,
                    defaultSets: editingExercise.defaultSets,
                    defaultReps: editingExercise.defaultReps,
                    description: editingExercise.description || undefined,
                } : undefined}
                categories={categories}
                onSubmit={editingExercise ? handleUpdate : handleCreate}
                onCancel={() => {
                    setIsFormOpen(false);
                    setEditingExercise(null);
                }}
                isOpen={isFormOpen}
            />
        </div>
    );
}
