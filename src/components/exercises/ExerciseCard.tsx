"use client";

import { motion } from "framer-motion";
import { Dumbbell, Pencil, Trash2 } from "lucide-react";

interface Exercise {
    id: string;
    name: string;
    category: string;
    defaultSets: number;
    defaultReps: number;
    description?: string | null;
    isSystem: boolean;
}

interface ExerciseCardProps {
    exercise: Exercise;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-zinc-100 p-4 relative"
        >
            {/* System Badge */}
            {exercise.isSystem && (
                <div className="absolute top-3 right-3 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    System
                </div>
            )}

            {/* Exercise Icon & Name */}
            <div className="flex items-start gap-3 mb-2">
                <div className="bg-orange-100 p-2 rounded-xl">
                    <Dumbbell size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold font-heading text-zinc-900">
                        {exercise.name}
                    </h3>
                    <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold">
                        {exercise.category}
                    </p>
                </div>
            </div>

            {/* Sets & Reps */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1 text-sm">
                    <span className="font-bold text-zinc-900">{exercise.defaultSets}</span>
                    <span className="text-zinc-500">sets</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                    <span className="font-bold text-zinc-900">{exercise.defaultReps}</span>
                    <span className="text-zinc-500">reps</span>
                </div>
            </div>

            {/* Description */}
            {exercise.description && (
                <p className="text-xs text-zinc-600 mb-3 line-clamp-2">
                    {exercise.description}
                </p>
            )}

            {/* Action Buttons (only for user exercises) */}
            {!exercise.isSystem && (
                <div className="flex gap-2 pt-2 border-t border-zinc-100">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors"
                    >
                        <Pencil size={14} />
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-700 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            )}
        </motion.div>
    );
}
