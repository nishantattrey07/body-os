"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check, Lock, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WorkoutPage() {
  const router = useRouter();
  const [checklist, setChecklist] = useState({
    wrist: false,
    catCow: false,
    shoulder: false
  });
  
  const allChecked = Object.values(checklist).every(Boolean);

  const toggle = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUnlock = () => {
    if (allChecked) {
        // Unlock animation here?
        alert("Workout Unlocked! (Logic TBD)");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 max-w-md mx-auto flex flex-col items-center justify-between text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-black pointer-events-none" />

      {/* Header */}
      <div className="flex items-center w-full justify-between z-10 mb-8">
        <button 
            onClick={() => router.back()}
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800"
        >
            <ArrowLeft className="text-zinc-400" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-900/50">
            <Lock size={14} className="text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">System Locked</span>
        </div>
      </div>

      <div className="w-full z-10 space-y-8">
        <h1 className="text-5xl font-bold uppercase tracking-tighter text-white font-heading text-center leading-[0.9]">
            Pre-Flight<br /><span className="text-red-600">Checks</span>
        </h1>

        <div className="space-y-4">
            <CheckItem 
                label="Wrist Rotations" 
                checked={checklist.wrist} 
                onClick={() => toggle("wrist")} 
            />
            <CheckItem 
                label="Cat-Cow Stretch" 
                checked={checklist.catCow} 
                onClick={() => toggle("catCow")} 
            />
            <CheckItem 
                label="Shoulder Dislocates" 
                checked={checklist.shoulder} 
                onClick={() => toggle("shoulder")} 
            />
        </div>
      </div>

      <div className="w-full z-10 mt-12 mb-8">
        <motion.button
            onClick={handleUnlock}
            disabled={!allChecked}
            whileTap={{ scale: 0.98 }}
            className={`w-full relative h-20 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${allChecked ? 'bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'bg-zinc-900 border border-zinc-800'}`}
        >
             {/* Slide Track Visual */}
             {!allChecked && (
                 <div className="absolute left-2 top-2 bottom-2 w-16 bg-zinc-800 rounded-xl flex items-center justify-center shadow-inner">
                     <Lock size={20} className="text-zinc-500" />
                 </div>
             )}
             
             <span className={`text-2xl font-bold uppercase tracking-widest font-heading ${allChecked ? 'text-white' : 'text-zinc-600 pl-12'}`}>
                 {allChecked ? "Initiate Sequence" : "Slide to Unlock"}
             </span>

             {allChecked && <Unlock className="absolute right-6 text-white/50" />}
        </motion.button>
      </div>
    </div>
  );
}

function CheckItem({ label, checked, onClick }: { label: string, checked: boolean, onClick: () => void }) {
    return (
        <motion.button 
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all duration-200 ${checked ? 'bg-red-500/10 border-red-500' : 'bg-zinc-900 border-zinc-800'}`}
        >
            <span className={`text-xl font-bold uppercase tracking-wide font-heading ${checked ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${checked ? 'bg-red-500' : 'bg-zinc-800'}`}>
                {checked && <Check size={18} className="text-white" />}
            </div>
        </motion.button>
    )
}
