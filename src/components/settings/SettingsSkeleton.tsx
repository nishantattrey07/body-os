"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-12 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10 mb-8">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full bg-zinc-200/50" />
          <Skeleton className="h-10 w-64 rounded-lg bg-zinc-200/50" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Nutritional Targets */}
          <section>
             <Skeleton className="h-6 w-48 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 4 Small Target Cards */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative rounded-3xl p-5 border border-zinc-100 bg-zinc-50/50">
                  <div className="absolute top-5 right-5">
                    <Skeleton className="h-8 w-8 rounded-xl bg-zinc-200" />
                  </div>
                  <Skeleton className="h-3 w-20 rounded bg-zinc-200 mb-2" />
                  <div className="flex items-baseline gap-2">
                    <Skeleton className="h-10 w-24 rounded bg-zinc-300/50" />
                    <Skeleton className="h-6 w-8 rounded bg-zinc-200/50" />
                  </div>
                </div>
              ))}
              
              {/* Wide Water Card */}
              <div className="md:col-span-2 relative rounded-3xl p-5 border border-zinc-100 bg-zinc-50/50">
                  <div className="absolute top-5 right-5">
                    <Skeleton className="h-8 w-8 rounded-xl bg-zinc-200" />
                  </div>
                  <Skeleton className="h-3 w-24 rounded bg-zinc-200 mb-2" />
                  <div className="flex items-baseline gap-2">
                    <Skeleton className="h-10 w-32 rounded bg-zinc-300/50" />
                    <Skeleton className="h-6 w-8 rounded bg-zinc-200/50" />
                  </div>
              </div>
            </div>
          </section>

          {/* Section: System Configuration */}
           <section>
             <Skeleton className="h-6 w-56 rounded mb-4" />
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                 <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded bg-zinc-200" />
                    <Skeleton className="h-4 w-64 rounded bg-zinc-100" />
                 </div>
                 <div className="flex items-center gap-2 bg-zinc-50 rounded-2xl p-2 border border-zinc-100">
                    <Skeleton className="h-12 w-20 rounded-xl bg-zinc-200" />
                    <span className="text-2xl font-bold text-zinc-200 px-1">:</span>
                    <Skeleton className="h-12 w-20 rounded-xl bg-zinc-200" />
                 </div>
               </div>
               <Skeleton className="h-8 w-64 rounded-xl bg-purple-50" />
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 sticky top-32">
             <Skeleton className="h-6 w-24 rounded mb-6" />
            
            <Skeleton className="h-20 w-full rounded-2xl bg-zinc-200 mb-4" />
            <Skeleton className="h-16 w-full rounded-2xl bg-zinc-100" />
            
            <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-center">
              <Skeleton className="h-3 w-32 rounded bg-zinc-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
