"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 max-w-md mx-auto relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50/30 to-white">
      
      {/* Decorative Background Elements (Static to match Client) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-200/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      
      <div className="flex-1 flex flex-col items-center w-full h-full relative z-10 w-full animate-in fade-in duration-500">
        {/* Settings Button Skeleton */}
        <div className="absolute top-4 right-0 z-20">
             <Skeleton className="h-12 w-12 rounded-2xl bg-white/50" />
        </div>

        {/* Header Skeleton */}
        <div className="w-full flex flex-col z-10 mb-6 mt-4">
          <div className="space-y-2">
            <Skeleton className="h-12 w-48 rounded-lg bg-zinc-900/10" />
            <Skeleton className="h-1 w-16 rounded-full bg-orange-200" />
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <Skeleton className="h-4 w-24 rounded-md bg-orange-100" />
            <Skeleton className="h-8 w-24 rounded-full bg-zinc-900/5" />
          </div>
        </div>

        {/* Core Vitals Skeleton */}
        <div className="flex-1 flex flex-col items-center justify-center w-full z-10 space-y-8">
          {/* MacroGauge Skeleton */}
          <div className="relative w-64 h-64 flex items-center justify-center">
             <Skeleton className="w-64 h-64 rounded-full bg-slate-100/50" />
             <div className="absolute inset-4 rounded-full border-4 border-dashed border-zinc-200/50" />
          </div>
          
          {/* Quick Stats Grid Skeleton */}
          <div className="grid grid-cols-2 gap-4 w-full px-4">
            <Skeleton className="h-24 rounded-3xl bg-white/40" />
            <Skeleton className="h-24 rounded-3xl bg-white/40" />
          </div>

          {/* Water Tracker Skeleton - Detailed */}
          <div className="w-full px-4 mt-2">
            <div className="bg-blue-50/20 rounded-3xl p-6 border border-blue-100/30 space-y-6">
               {/* Header Row */}
               <div className="flex justify-between items-start">
                 <div className="space-y-2">
                   <Skeleton className="h-3 w-20 rounded bg-blue-200/40" />
                   <Skeleton className="h-8 w-16 rounded bg-blue-300/40" />
                 </div>
                 <div className="space-y-2 flex flex-col items-end">
                   <Skeleton className="h-3 w-12 rounded bg-blue-200/40" />
                   <Skeleton className="h-6 w-12 rounded bg-blue-300/40" />
                 </div>
               </div>
               
               {/* Progress Bar */}
               <Skeleton className="h-3 w-full rounded-full bg-blue-200/30" />

               {/* Button */}
               <Skeleton className="h-14 w-full rounded-2xl bg-white/60" />
            </div>
          </div>
        </div>

        {/* Action Grid Skeleton - Detailed */}
        <div className="w-full z-10 mt-8 mb-8 grid grid-cols-2 gap-4 px-4">
          {/* Log Food Card Skeleton */}
          <div className="h-40 rounded-3xl bg-orange-50/30 p-4 flex flex-col justify-between border border-orange-100/20">
             <Skeleton className="h-8 w-8 rounded-full bg-orange-200/40" />
             <div className="space-y-2">
               <Skeleton className="h-4 w-20 rounded bg-orange-300/40" />
               <Skeleton className="h-3 w-24 rounded bg-orange-200/30" />
             </div>
          </div>
          
          {/* Workout Card Skeleton */}
          <div className="h-40 rounded-3xl bg-zinc-50/30 p-4 flex flex-col justify-between border border-zinc-100/20">
             <Skeleton className="h-8 w-8 rounded-full bg-zinc-200/40" />
             <div className="space-y-2">
               <Skeleton className="h-4 w-20 rounded bg-zinc-300/40" />
               <Skeleton className="h-3 w-24 rounded bg-zinc-200/30" />
             </div>
          </div>

          {/* Progress Card Skeleton */}
          <div className="col-span-2 h-24 rounded-3xl bg-blue-50/30 p-4 flex items-center justify-between border border-blue-100/20">
             <div className="space-y-2">
               <Skeleton className="h-4 w-24 rounded bg-blue-300/40" />
               <Skeleton className="h-3 w-32 rounded bg-blue-200/30" />
             </div>
             <Skeleton className="h-10 w-10 rounded-full bg-blue-200/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
