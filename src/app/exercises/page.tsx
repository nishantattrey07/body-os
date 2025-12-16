"use client";

import {
    createExercise,
    deleteExercise,
    getExerciseCategories,
    getExercisesPaginated,
    updateExercise,
} from "@/app/actions/exercises";
import { ExerciseCard } from "@/components/exercises/ExerciseCard";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { useNavigation } from "@/providers/NavigationProvider";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Exercise {
    id: string;
    name: string;
    category: string;
    defaultSets: number;
    defaultReps: number;
    description?: string | null;
    isSystem: boolean;
}

type FilterType = "all" | "system" | "user";

export default function ExercisesPage() {
    const router = useRouter();
    const { navigateBack } = useNavigation();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
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

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 120);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load categories on mount
    useEffect(() => {
        getExerciseCategories().then(setCategories);
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCursor(null);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Load exercises when search, filter or category changes
    useEffect(() => {
        loadExercises(true);
    }, [debouncedSearch, filter, selectedCategory]);

    const loadExercises = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setCursor(null);
        }
        
        const { items, nextCursor, hasMore: more } = await getExercisesPaginated({
            search: debouncedSearch || undefined,
            category: selectedCategory || undefined,
            includeSystem: filter !== "user",
            includeUser: filter !== "system",
            limit: 20,
            cursor: reset ? undefined : (cursor || undefined),
        });
        
        if (reset) {
            setExercises(items as Exercise[]);
        } else {
            setExercises(prev => [...prev, ...(items as Exercise[])]);
        }
        
        setCursor(nextCursor);
        setHasMore(more);
        setLoading(false);
        setLoadingMore(false);
    };

    const loadMoreExercises = async () => {
        if (!hasMore || loadingMore || !cursor) return;
        setLoadingMore(true);
        await loadExercises(false);
    };

    // Intersection Observer for infinite scroll
    const observerRef = useRef<IntersectionObserver | undefined>(undefined);
    const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreExercises();
            }
        });
        if (node) observerRef.current.observe(node);
    }, [loadingMore, hasMore, cursor]);

    const handleCreate = async (data: any) => {
        try {
            await createExercise(data);
            await loadExercises(true);
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
            await loadExercises(true);
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
            await loadExercises(true);
        } catch (error) {
            alert("Failed to delete exercise");
        }
    };

    const filterLabels: Record<FilterType, string> = {
        all: "All",
        system: "System",
        user: "My Exercises",
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-30">
                <button
                    onClick={() => navigateBack()}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold font-heading">Exercise Library</h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Fixed Search + Filters */}
            <div className="fixed top-[74px] left-0 right-0 z-20 bg-orange-50">
                {/* Floating Search Bar */}
                <div className="px-6 pt-2 pb-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-zinc-100 p-4 mx-2 flex items-center gap-3">
                        <Search size={22} className="text-zinc-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
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

                {/* System/User Filter Tabs */}
                <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                    {(["all", "system", "user"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                filter === f
                                    ? "bg-orange-500 text-white shadow-sm transform scale-105"
                                    : "bg-white/80 text-zinc-600 border border-zinc-200 hover:border-orange-200"
                            }`}
                        >
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>

                {/* Category Filter Tabs */}
                <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${
                            selectedCategory === null
                                ? "bg-zinc-800 text-white"
                                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${
                                selectedCategory === cat
                                    ? "bg-zinc-800 text-white"
                                    : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Darkening gradient - only visible when scrolled */}
                <div className={`absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-orange-200/60 to-transparent pointer-events-none transform translate-y-full transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {/* Spacer for fixed elements */}
            <div className="h-72" />

            {/* Exercise Grid */}
            <div className="px-6 pt-4 pb-6 min-h-[50vh]">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-zinc-100 animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 bg-orange-100 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-5 w-32 bg-zinc-200 rounded mb-1" />
                                        <div className="h-4 w-16 bg-zinc-100 rounded" />
                                    </div>
                                    <div className="h-5 w-16 bg-blue-100 rounded-full" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-4 w-16 bg-zinc-100 rounded" />
                                    <div className="h-4 w-16 bg-zinc-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="text-center py-12">
                        <Dumbbell size={48} className="mx-auto text-zinc-300 mb-4" />
                        <p className="text-zinc-500 mb-4">
                            {search ? "No exercises match your search" : "No exercises found"}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Create Your First Exercise
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {exercises.map((exercise) => (
                                <ExerciseCard
                                    key={exercise.id}
                                    exercise={exercise}
                                    onEdit={() => handleEdit(exercise)}
                                    onDelete={() => handleDelete(exercise.id)}
                                />
                            ))}
                        </div>
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
