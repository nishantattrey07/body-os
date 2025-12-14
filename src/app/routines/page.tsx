"use client";

import { createRoutine, deleteRoutine, getRoutines, updateRoutine } from "@/app/actions/routines";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { RoutineForm } from "@/components/routines/RoutineForm";
import { motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Routine {
    id: string;
    name: string;
    description?: string | null;
    isSystem: boolean;
    exercises: any[];
}

export default function RoutinesPage() {
    const router = useRouter();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRoutines();
    }, []);

    const loadRoutines = async () => {
        setLoading(true);
        const data = await getRoutines();
        setRoutines(data as Routine[]);
        setLoading(false);
    };

    const handleCreate = async (data: any) => {
        try {
            await createRoutine(data);
            await loadRoutines();
            setIsFormOpen(false);
        } catch (error) {
            alert("Failed to create routine");
        }
    };

    const handleEdit = (routine: Routine) => {
        setEditingRoutine(routine);
        setIsFormOpen(true);
    };

    const handleUpdate = async (data: any) => {
        if (!editingRoutine) return;
        try {
            await updateRoutine(editingRoutine.id, data);
            await loadRoutines();
            setIsFormOpen(false);
            setEditingRoutine(null);
        } catch (error) {
            alert("Failed to update routine");
        }
    };

    const handleDelete = async (routineId: string) => {
        if (!confirm("Delete this routine?")) return;
        try {
            await deleteRoutine(routineId);
            await loadRoutines();
        } catch (error) {
            alert("Failed to delete routine");
        }
    };

    const handleBuildRoutine = (routineId: string) => {
        router.push(`/routines/${routineId}/build`);
    };

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
                <h1 className="text-xl font-bold font-heading">Workout Routines</h1>
                {/* The plus button was here and has been removed */}
            </div>

            {/* Routines Grid */}
            <div className="px-6 py-6">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Loading routines...</div>
                ) : routines.length === 0 ? (
                    <div className="text-center py-12">
                        <Dumbbell size={48} className="mx-auto text-zinc-300 mb-4" />
                        <p className="text-zinc-500 mb-4">No routines found</p>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                        >
                            Create Your First Routine
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {routines.map((routine) => (
                            <div key={routine.id} onClick={() => handleBuildRoutine(routine.id)} className="cursor-pointer">
                                <RoutineCard
                                    routine={routine}
                                    onEdit={() => handleEdit(routine)}
                                    onDelete={() => handleDelete(routine.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) for Mobile */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => {
                    setEditingRoutine(null);
                    setIsFormOpen(true);
                }}
                className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-orange-600 hover:scale-105 transition-all"
            >
                <Plus size={28} />
            </motion.button>

            {/* Routine Form Modal */}
            <RoutineForm
                initialData={
                    editingRoutine
                        ? {
                              name: editingRoutine.name,
                              description: editingRoutine.description || undefined,
                          }
                        : undefined
                }
                onSubmit={editingRoutine ? handleUpdate : handleCreate}
                onCancel={() => {
                    setIsFormOpen(false);
                    setEditingRoutine(null);
                }}
                isOpen={isFormOpen}
            />
        </div>
    );
}
