"use client";

import { submitDailyReview } from "@/app/actions/daily-log";
import { BigButton } from "@/components/ui/BigButton";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

interface DailyReviewProps {
  onComplete: () => void;
}

export function DailyReview({ onComplete }: DailyReviewProps) {
  const [tookSoya, setTookSoya] = useState<boolean | null>(null);
  const [elbowStatus, setElbowStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      await submitDailyReview({
        tookSoya: tookSoya ?? undefined,
        elbowStatus: elbowStatus || undefined,
        notes: notes || undefined,
      });
      onComplete();
    } catch (error) {
      console.error("Failed to submit daily review:", error);
      alert("Failed to save review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = tookSoya !== null && elbowStatus !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-heading text-foreground mb-2">
          Daily Review
        </h2>
        <p className="text-zinc-500 text-sm">
          Quick end-of-day check-in
        </p>
      </div>

      {/* Question 1: Took Soya? */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
          Did you consume soya today?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => setTookSoya(true)}
            whileTap={{ scale: 0.98 }}
            className={`h-14 rounded-2xl font-bold text-lg transition-all ${
              tookSoya === true
                ? 'bg-blue-600 text-white'
                : 'bg-white border-2 border-zinc-200 text-zinc-600'
            }`}
          >
            Yes
          </motion.button>
          <motion.button
            onClick={() => setTookSoya(false)}
            whileTap={{ scale: 0.98 }}
            className={`h-14 rounded-2xl font-bold text-lg transition-all ${
              tookSoya === false
                ? 'bg-blue-600 text-white'
                : 'bg-white border-2 border-zinc-200 text-zinc-600'
            }`}
          >
            No
          </motion.button>
        </div>
      </div>

      {/* Question 2: Elbow Status */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
          How are your elbows?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Good', 'Mild Pain', 'Bad'].map((status) => (
            <motion.button
              key={status}
              onClick={() => setElbowStatus(status)}
              whileTap={{ scale: 0.98 }}
              className={`h-12 rounded-xl font-bold text-sm transition-all ${
                elbowStatus === status
                  ? status === 'Good'
                    ? 'bg-green-600 text-white'
                    : status === 'Mild Pain'
                    ? 'bg-amber-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-white border-2 border-zinc-200 text-zinc-600'
              }`}
            >
              {status}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Question 3: Notes (Optional) */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you feel today? Any observations?"
          className="w-full h-24 p-4 rounded-2xl border-2 border-zinc-200 text-foreground placeholder-zinc-400 resize-none focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Submit Button */}
      <BigButton
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="mt-8"
      >
        {submitting ? (
          "Submitting..."
        ) : (
          <>
            <CheckCircle size={20} />
            Complete Day
          </>
        )}
      </BigButton>
    </motion.div>
  );
}
