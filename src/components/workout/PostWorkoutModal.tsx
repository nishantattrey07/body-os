"use client";

import { motion } from "framer-motion";
import { Brain, Clock, Dumbbell, Sparkles, ThumbsUp, Trophy, Zap } from "lucide-react";
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

// Format duration as MM:SS or "X min"
function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
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

  // Premium segmented rating control
  const RatingControl = ({ 
    value, 
    onChange, 
    icon: Icon, 
    label,
    color
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    icon: React.ElementType; 
    label: string;
    color: string;
  }) => {
    const colorClasses: Record<string, { active: string; inactive: string }> = {
      emerald: { active: "bg-emerald-500 text-white", inactive: "bg-zinc-100 text-zinc-400" },
      purple: { active: "bg-purple-500 text-white", inactive: "bg-zinc-100 text-zinc-400" },
      blue: { active: "bg-blue-500 text-white", inactive: "bg-zinc-100 text-zinc-400" },
      amber: { active: "bg-amber-500 text-white", inactive: "bg-zinc-100 text-zinc-400" },
    };

    const colors = colorClasses[color] || colorClasses.emerald;

    return (
      <div className="bg-white rounded-2xl p-4 border border-zinc-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon size={18} className="text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-700">{label}</span>
          </div>
          <span className="text-lg font-black text-zinc-900">{value}/5</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button
              key={n}
              onClick={() => onChange(n)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all ${
                value >= n ? colors.active : colors.inactive
              }`}
            >
              {n}
            </motion.button>
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-50 rounded-[2rem] w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl"
      >
        {/* Header - Celebration */}
        <div className="relative p-8 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white text-center rounded-t-[2rem] overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 opacity-20">
            <Sparkles size={24} />
          </div>
          <div className="absolute top-6 right-6 opacity-20">
            <Sparkles size={16} />
          </div>
          <div className="absolute bottom-4 left-8 opacity-20">
            <Sparkles size={12} />
          </div>
          
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm"
          >
            <Trophy size={40} className="text-yellow-300 drop-shadow-lg" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black uppercase tracking-tight font-heading"
          >
            Workout Complete!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-green-100 text-sm mt-1 font-medium"
          >
            {routineName}
          </motion.p>
        </div>

        {/* Stats Row */}
        <div className="flex bg-white border-b border-zinc-100">
          <div className="flex-1 p-5 text-center border-r border-zinc-100">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-zinc-100 rounded-full mb-2">
              <Clock size={18} className="text-zinc-500" />
            </div>
            <p className="text-3xl font-black text-zinc-900">{formatDuration(duration)}</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Duration</p>
          </div>
          <div className="flex-1 p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-zinc-100 rounded-full mb-2">
              <Dumbbell size={18} className="text-zinc-500" />
            </div>
            <p className="text-3xl font-black text-zinc-900">{setsCompleted}</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Sets</p>
          </div>
        </div>

        {/* Ratings */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-2">
            Rate Your Session
          </p>

          <RatingControl
            value={energy}
            onChange={setEnergy}
            icon={Zap}
            label="Energy After"
            color="emerald"
          />

          <RatingControl
            value={pump}
            onChange={setPump}
            icon={Dumbbell}
            label="Muscle Pump"
            color="purple"
          />

          <RatingControl
            value={focus}
            onChange={setFocus}
            icon={Brain}
            label="Mind-Muscle Focus"
            color="blue"
          />

          <RatingControl
            value={overall}
            onChange={setOverall}
            icon={ThumbsUp}
            label="Overall Rating"
            color="amber"
          />

          {/* Notes */}
          <div className="bg-white rounded-2xl p-4 border border-zinc-100">
            <label className="text-sm font-semibold text-zinc-700 block mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any issues?"
              className="w-full p-3 rounded-xl border border-zinc-200 text-sm resize-none h-20 focus:border-zinc-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="p-5 pt-2">
          <motion.button
            onClick={handleSubmit}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg uppercase tracking-wider shadow-lg transition-colors"
          >
            Save & Finish
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
