"use client";

import { motion } from "framer-motion";
import { AlertCircle, Play, RefreshCw, X } from "lucide-react";

interface ResumeModalProps {
  session: {
    id: string;
    routine?: { name: string } | null;
    startedAt: Date | string;
    exercises: Array<{
      completedAt: Date | null;
      skipped: boolean;
      exercise: { name: string };
    }>;
  };
  onResume: () => void;
  onAbandon: () => void;
  onStartFresh: () => void;
}

export function ResumeModal({ session, onResume, onAbandon, onStartFresh }: ResumeModalProps) {
  const completedCount = session.exercises.filter(e => e.completedAt || e.skipped).length;
  const totalCount = session.exercises.length;
  const currentExercise = session.exercises.find(e => !e.completedAt && !e.skipped);
  
  const startedAt = new Date(session.startedAt);
  const now = new Date();
  const diffMs = now.getTime() - startedAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  let timeAgo = "";
  if (diffHours > 0) {
    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    timeAgo = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = "just now";
  }

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
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-900">Unfinished Workout</h2>
              <p className="text-sm text-amber-700">Started {timeAgo}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Routine Name */}
          <div className="text-center">
            <p className="text-sm text-zinc-500 uppercase tracking-wider">Routine</p>
            <p className="text-2xl font-bold text-foreground">
              {session.routine?.name || "Custom Workout"}
            </p>
          </div>

          {/* Progress */}
          <div className="bg-zinc-50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Progress</span>
              <span className="font-bold text-foreground">
                {completedCount}/{totalCount} exercises
              </span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            {currentExercise && (
              <p className="text-sm text-zinc-600">
                Next up: <span className="font-medium">{currentExercise.exercise.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-zinc-100 space-y-3">
          <button
            onClick={onResume}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Play size={20} />
            Resume Workout
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onAbandon}
              className="flex-1 h-12 rounded-2xl bg-red-100 text-red-600 font-medium flex items-center justify-center gap-2"
            >
              <X size={18} />
              Abandon
            </button>
            <button
              onClick={onStartFresh}
              className="flex-1 h-12 rounded-2xl bg-zinc-100 text-zinc-600 font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Start Fresh
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
