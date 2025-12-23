"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface RoutineExercise {
    id: string;
    order: number;
    sets: number;
    reps: number | null;
    duration: number | null;  // For time-based exercises (seconds)
    restSeconds: number;
    exercise: {
        id: string;
        name: string;
        category: string;
        trackingType: string;  // "reps" | "seconds"
    };
}

interface RoutineCardProps {
    routine: {
        id: string;
        name: string;
        description?: string | null;
        isSystem: boolean;
        exercises: RoutineExercise[];
    };
    onEdit?: () => void;
    onDelete?: () => void;
}

export function RoutineCard({ routine, onEdit, onDelete }: RoutineCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-zinc-100 overflow-hidden"
        >
            {/* Header */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold font-heading text-zinc-900">
                                {routine.name}
                            </h3>
                            {routine.isSystem && (
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                    System
                                </span>
                            )}
                        </div>
                        {routine.description && (
                            <p className="text-sm text-zinc-600">{routine.description}</p>
                        )}
                    </div>
                </div>

                {/* Exercise Count */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500 font-semibold">
                        {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                        {isExpanded ? (
                            <>
                                Hide <ChevronUp size={16} />
                            </>
                        ) : (
                            <>
                                View <ChevronDown size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Expanded Exercise List */}
            {isExpanded && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 p-4 space-y-2">
                    {routine.exercises.map((re, idx) => (
                        <div key={re.id} className="flex items-center gap-3 text-sm">
                            <span className="text-zinc-400 font-bold w-6">{idx + 1}.</span>
                            <div className="flex-1">
                                <span className="font-semibold text-zinc-900">{re.exercise.name}</span>
                                <span className="text-zinc-500 ml-2">
                                    {re.exercise.trackingType === "seconds" 
                                      ? `${re.duration ?? 60}s × ${re.sets}`
                                      : `${re.sets}×${re.reps ?? 10}`
                                    } • {re.restSeconds}s rest
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            {!routine.isSystem && (
                <div className="flex gap-2 p-4 border-t border-zinc-100">
                    <Link
                        href={`/routines/${routine.id}/build`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors"
                    >
                        <Edit2 size={14} />
                        Edit
                    </Link>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
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
