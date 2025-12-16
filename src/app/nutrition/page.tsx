"use client";

import { NutritionGrid } from "@/components/nutrition/NutritionGrid";
import { BigButton } from "@/components/ui/BigButton";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NutritionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="text-zinc-600" />
        </button>
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground font-heading">
          Nutrition Protocol
        </h1>
      </div>

      <div className="flex-1">
        <NutritionGrid />
      </div>

      {/* Manual Entry Fallback */}
      <div className="mt-8 border-t border-zinc-100 pt-6">
        <p className="text-center text-zinc-400 text-sm font-medium mb-4">Item not listed?</p>
        <BigButton variant="secondary" className="opacity-50 text-xl py-4">
          Manual Entry
        </BigButton>
      </div>
    </div>
  );
}
