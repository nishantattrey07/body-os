"use client";

import { BlockerDashboard } from "@/components/blockers/BlockerDashboard";
import { DailyReview } from "@/components/progress/DailyReview";
import { DeadHangTracker } from "@/components/progress/DeadHangTracker";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProgressPage() {
  const router = useRouter();
  const [showReview, setShowReview] = useState(false);

  const handleReviewComplete = () => {
    setShowReview(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="text-zinc-600" />
          </button>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground font-heading">
            Progress
          </h1>
        </div>

        <button
          onClick={() => setShowReview(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        >
          <Calendar size={18} />
          <span className="text-sm font-bold">Daily Review</span>
        </button>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {showReview ? (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <DailyReview onComplete={handleReviewComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="tracker"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Body Status - Physical Blockers */}
            <BlockerDashboard />
            
            {/* Dead Hang Tracker */}
            <div className="pt-6 border-t border-zinc-200">
              <DeadHangTracker />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

