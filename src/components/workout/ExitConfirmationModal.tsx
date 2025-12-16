"use client";

import { BigButton } from "@/components/ui/BigButton";
import { motion } from "framer-motion";
import { Pause } from "lucide-react";

interface ExitConfirmationModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitConfirmationModal({ onCancel, onConfirm }: ExitConfirmationModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center mb-2 shadow-inner">
            <Pause className="text-orange-500 fill-orange-500" size={32} />
          </div>
        </div>

        <h2 className="text-4xl font-bold uppercase tracking-tighter font-heading text-zinc-800 mb-3">
          Pause Session?
        </h2>
        
        <p className="text-zinc-500 font-medium leading-relaxed mb-8 px-2 font-sans">
          Your progress is automatically saved. You can resume this workout exactly where you left off later.
        </p>

        <div className="space-y-3">
          <BigButton 
            onClick={onCancel}
            className="w-full text-xl py-5 shadow-lg shadow-zinc-200 bg-zinc-800 hover:bg-zinc-900 text-white border-none"
          >
            KEEP TRAINING
          </BigButton>
          
          <button
            onClick={onConfirm}
            className="w-full py-4 text-zinc-400 font-bold uppercase tracking-wider text-sm hover:text-red-500 transition-colors font-heading"
          >
            Exit to Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
