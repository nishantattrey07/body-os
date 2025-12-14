"use client";

import { motion } from "framer-motion";
import { Brain, Clock, Dumbbell, ThumbsUp, Trophy, Zap } from "lucide-react";
import { useState } from "react";

interface PostWorkoutModalProps {
  routineName: string;
  duration: number; // in minutes
  setsCompleted: number;
  onComplete: (data: PostWorkoutData) => void;
}

export interface PostWorkoutData {
  postWorkoutEnergy: number;
  pumpRating: number;
  focusRating: number;
  overallRating: number;
  notes?: string;
}

export function PostWorkoutModal({ 
  routineName, 
  duration, 
  setsCompleted,
  onComplete 
}: PostWorkoutModalProps) {
  const [energy, setEnergy] = useState(3);
  const [pump, setPump] = useState(3);
  const [focus, setFocus] = useState(3);
  const [overall, setOverall] = useState(4);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onComplete({
      postWorkoutEnergy: energy,
      pumpRating: pump,
      focusRating: focus,
      overallRating: overall,
      notes: notes || undefined,
    });
  };

  const StarRating = ({ 
    value, 
    onChange, 
    icon: Icon, 
    label,
    color = "yellow"
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    icon: any; 
    label: string;
    color?: string;
  }) => {
    const gradients: Record<string, string> = {
      yellow: "from-yellow-400 to-amber-500",
      green: "from-green-400 to-green-600",
      blue: "from-blue-400 to-blue-600",
      purple: "from-purple-400 to-purple-600",
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-zinc-500" />
            <span className="text-sm font-medium text-zinc-700">{label}</span>
          </div>
          <span className="text-lg font-bold text-foreground">{value}/5</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`flex-1 h-12 rounded-xl font-bold transition-all ${
                value >= n 
                  ? `bg-gradient-to-r ${gradients[color]} text-white shadow-lg transform scale-[1.02]` 
                  : "bg-zinc-100 text-zinc-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header - Celebration */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center rounded-t-3xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
          >
            <Trophy size={32} className="text-yellow-300" />
          </motion.div>
          <h2 className="text-2xl font-bold">Workout Complete!</h2>
          <p className="text-green-100 text-sm mt-1">{routineName}</p>
        </div>

        {/* Stats */}
        <div className="flex border-b border-zinc-100">
          <div className="flex-1 p-4 text-center border-r border-zinc-100">
            <Clock size={20} className="mx-auto text-zinc-400 mb-1" />
            <p className="text-2xl font-bold text-foreground">{duration}</p>
            <p className="text-xs text-zinc-500">minutes</p>
          </div>
          <div className="flex-1 p-4 text-center">
            <Dumbbell size={20} className="mx-auto text-zinc-400 mb-1" />
            <p className="text-2xl font-bold text-foreground">{setsCompleted}</p>
            <p className="text-xs text-zinc-500">sets</p>
          </div>
        </div>

        {/* Ratings */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-zinc-500 uppercase tracking-wider font-medium">
            Rate Your Session
          </p>

          <StarRating
            value={energy}
            onChange={setEnergy}
            icon={Zap}
            label="Energy After"
            color="green"
          />

          <StarRating
            value={pump}
            onChange={setPump}
            icon={Dumbbell}
            label="Muscle Pump"
            color="purple"
          />

          <StarRating
            value={focus}
            onChange={setFocus}
            icon={Brain}
            label="Mind-Muscle Focus"
            color="blue"
          />

          <StarRating
            value={overall}
            onChange={setOverall}
            icon={ThumbsUp}
            label="Overall Rating"
            color="yellow"
          />

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any issues?"
              className="w-full p-4 rounded-2xl border border-zinc-200 text-sm resize-none h-24"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 border-t border-zinc-100">
          <button
            onClick={handleSubmit}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg uppercase tracking-wider shadow-lg"
          >
            Save & Finish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
