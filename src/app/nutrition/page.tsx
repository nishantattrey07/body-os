"use client";

import { NutritionGrid } from "@/components/nutrition/NutritionGrid";
import { BigButton } from "@/components/ui/BigButton";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NutritionPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLog = (protein: number) => {
    // Show quick feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

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

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg z-50 animate-in slide-in-from-top">
          ✓ Logged successfully!
        </div>
      )}

      <div className="flex-1">
        <NutritionGrid onLog={handleLog} />
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
