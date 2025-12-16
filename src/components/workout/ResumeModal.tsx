"use client";

import { BigButton } from "@/components/ui/BigButton";
import { motion } from "framer-motion";
import { Play, RefreshCw, Timer, X } from "lucide-react";

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
    timeAgo = `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    timeAgo = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  } else {
    timeAgo = "just now";
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center gap-6 bg-white p-8 rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/50"
      >
        {/* Header */}
        <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Timer className="text-primary w-8 h-8 ml-0.5" /> {/* Optically centered */}
                </div>
            </div>
          <h2 className="text-4xl font-bold uppercase tracking-tighter font-heading text-primary leading-none">
            Unfinished Workout
          </h2>
          <p className="text-zinc-400 font-medium text-sm tracking-wide flex items-center justify-center gap-2">
            Started {timeAgo}
          </p>
        </div>

        {/* Routine Info & Progress */}
        <div className="w-full space-y-4 bg-zinc-50 rounded-3xl p-6 border border-zinc-100/50">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-heading">
                Current Routine
            </p>
            <p className="text-2xl font-bold uppercase tracking-tight font-heading text-foreground">
              {session.routine?.name || "Custom Workout"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-heading">Progress</span>
              <span className="text-sm font-bold font-heading text-primary">
                {completedCount}<span className="text-zinc-300 mx-0.5">/</span>{totalCount}
              </span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          </div>

          {currentExercise && (
             <div className="text-center pt-2">
                <p className="text-xs text-zinc-400 mb-1">Up Next</p>
                <p className="text-sm font-bold text-zinc-700">{currentExercise.exercise.name}</p>
             </div>
          )}
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <BigButton 
            onClick={onResume}
            className="w-full shadow-[0_10px_30px_-10px_rgba(239,68,68,0.4)] flex flex-row items-center justify-center gap-3 !text-2xl py-6"
          >
            <Play className="w-6 h-6 fill-current shrink-0" />
            <span className="whitespace-nowrap mt-1">Resume Session</span>
          </BigButton>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onAbandon}
              className="h-14 rounded-2xl bg-zinc-100 hover:bg-red-50 text-zinc-500 hover:text-red-500 font-bold text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2 font-heading group"
            >
              <X size={18} className="group-hover:scale-110 transition-transform" />
              <span className="mt-0.5">Abandon</span>
            </button>
            <button
              onClick={onStartFresh}
              className="h-14 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 font-bold text-sm uppercase tracking-wide transition-colors flex items-center justify-center gap-2 font-heading group"
            >
              <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="mt-0.5">Restart</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
