"use client";

import { createRoutine, deleteRoutine, getRoutinesPaginated, updateRoutine } from "@/app/actions/routines";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { RoutineForm } from "@/components/routines/RoutineForm";
import { useRoutinesList } from "@/hooks/queries/useRoutinesList";
import { useNavigation } from "@/providers/NavigationProvider";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Dumbbell, Loader2, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Routine {
    id: string;
    name: string;
    description?: string | null;
    isSystem: boolean;
    exercises: any[];
}

type FilterType = "all" | "system" | "user";

interface RoutinesClientProps {
    initialRoutines: Routine[];
    initialCursor: string | null;
    initialHasMore: boolean;
}

/**
 * RoutinesClient - Client Component for routines management
 * 
 * Uses React Query with initialData from Server Component.
 * This enables:
 * - Instant render on client-side navigation (from cache)
 * - Background refetch on window focus
 * - No loading skeleton when data is cached
 */
export function RoutinesClient({ initialRoutines, initialCursor, initialHasMore }: RoutinesClientProps) {
    const router = useRouter();
    const { navigateBack } = useNavigation();
    const queryClient = useQueryClient();
    
    // Search & Filter State
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    
    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    
    // Pagination state for infinite scroll
    const [allRoutines, setAllRoutines] = useState<Routine[]>(initialRoutines);
    const [cursor, setCursor] = useState<string | null>(initialCursor);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loadingMore, setLoadingMore] = useState(false);
    
    // Scroll state for gradient visibility
    const [isScrolled, setIsScrolled] = useState(false);

    // React Query for routines - uses cache for instant navigation
    const { data, isLoading, refetch } = useRoutinesList(
        { search: debouncedSearch, filter },
        { items: initialRoutines, nextCursor: initialCursor, hasMore: initialHasMore }
    );

    // Sync local state with React Query data
    useEffect(() => {
        if (data) {
            setAllRoutines(data.items as Routine[]);
            setCursor(data.nextCursor);
            setHasMore(data.hasMore);
        }
    }, [data]);

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
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const loadMoreRoutines = async () => {
        if (!hasMore || loadingMore || !cursor) return;
        setLoadingMore(true);
        
        const result = await getRoutinesPaginated({
            search: debouncedSearch || undefined,
            includeSystem: filter !== "user",
            includeUser: filter !== "system",
            limit: 20,
            cursor,
        });
        
        setAllRoutines(prev => [...prev, ...(result.items as Routine[])]);
        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
        setLoadingMore(false);
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

    const handleCreate = async (data: any) => {
        try {
            await createRoutine(data);
            await refetch();
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
            await refetch();
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
            await refetch();
        } catch (error) {
            alert("Failed to delete routine");
        }
    };

    const filterLabels: Record<FilterType, string> = {
        all: "All",
        system: "System",
        user: "My Routines",
    };

    // Show skeleton only when genuinely loading with no data
    const showSkeleton = isLoading && allRoutines.length === 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white pb-20 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50/90 to-white/90 backdrop-blur-md border-b border-orange-100/50 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-30">
                <button
                    onClick={() => navigateBack()}
                    className="p-2.5 rounded-2xl bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all shadow-sm border border-white/50"
                >
                    <ArrowLeft size={24} className="text-zinc-600" />
                </button>
                <h1 className="text-xl font-bold font-heading">Workout Routines</h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Fixed Search + Filters */}
            <div className="fixed top-[74px] left-0 right-0 z-20 bg-gradient-to-b from-orange-50/95 to-orange-50/80 backdrop-blur-sm">
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
                <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar">
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

                {/* Orange gradient - only visible when scrolled */}
                <div className={`absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-orange-200/40 to-transparent pointer-events-none transform translate-y-full transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />
            </div>

            {/* Spacer for fixed elements */}
            <div className="h-56" />

            {/* Routines Grid */}
            <div className="px-6 pt-4 pb-6 min-h-[50vh]">
                {showSkeleton ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-zinc-100 animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-6 w-32 bg-zinc-200 rounded" />
                                    <div className="h-5 w-16 bg-blue-100 rounded-full" />
                                </div>
                                <div className="h-4 w-3/4 bg-zinc-100 rounded mb-2" />
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-20 bg-zinc-100 rounded" />
                                    <div className="h-4 w-12 bg-orange-100 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : allRoutines.length === 0 ? (
                    <div className="text-center py-12">
                        <Dumbbell size={48} className="mx-auto text-zinc-300 mb-4" />
                        <p className="text-zinc-500 mb-4">
                            {search ? "No routines match your search" : "No routines found"}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setIsFormOpen(true)}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Create Your First Routine
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allRoutines.map((routine) => (
                                <RoutineCard
                                    key={routine.id}
                                    routine={routine}
                                    onEdit={() => handleEdit(routine)}
                                    onDelete={() => handleDelete(routine.id)}
                                />
                            ))}
                        </div>

                        {/* Load More Trigger */}
                        {hasMore && (
                            <div ref={loadMoreRef} className="py-8 text-center">
                                {loadingMore && (
                                    <Loader2 className="animate-spin mx-auto text-zinc-400" size={24} />
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
