"use client";

import { getActiveBlockers } from "@/app/actions/blockers";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BlockerPickerProps {
  onSelect: (blockerId: string | null) => void;
  selectedBlockerId?: string | null;
}

export function BlockerPicker({ onSelect, selectedBlockerId }: BlockerPickerProps) {
  const [blockers, setBlockers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadBlockers();
  }, []);

  const loadBlockers = async () => {
    try {
      const data = await getActiveBlockers();
      setBlockers(data);
    } catch (error) {
      console.error("Failed to load blockers:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBlocker = blockers.find(b => b.id === selectedBlockerId);

  if (loading) {
    return null;
  }

  // If no active blockers, don't show the picker
  if (blockers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-amber-700">Is this pain from an existing issue?</p>
      
      {/* Selected Blocker or Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
          selectedBlockerId
            ? "border-red-400 bg-red-50"
            : "border-amber-300 bg-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className={selectedBlockerId ? "text-red-600" : "text-amber-500"} />
          <span className={selectedBlockerId ? "font-medium text-red-700" : "text-amber-600"}>
            {selectedBlocker ? `${selectedBlocker.name} (${selectedBlocker.bodyPart})` : "Link to existing issue"}
          </span>
        </div>
        {selectedBlockerId ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
            }}
            className="p-1 rounded-full hover:bg-red-200"
          >
            <X size={14} className="text-red-600" />
          </button>
        ) : (
          <Plus size={16} className="text-amber-500" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 py-2">
              {blockers.map((blocker) => (
                <button
                  key={blocker.id}
                  type="button"
                  onClick={() => {
                    onSelect(blocker.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    selectedBlockerId === blocker.id
                      ? "border-red-400 bg-red-50"
                      : "border-zinc-200 bg-white hover:border-red-300 hover:bg-red-25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{blocker.name}</p>
                      <p className="text-xs text-zinc-500">{blocker.bodyPart}</p>
                    </div>
                    <span className={`text-lg font-bold ${
                      blocker.severity <= 3 ? "text-green-600" : 
                      blocker.severity <= 6 ? "text-amber-600" : 
                      "text-red-600"
                    }`}>
                      {blocker.severity}/10
                    </span>
                  </div>
                </button>
              ))}
              
              {/* None Option */}
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className="w-full p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 text-center hover:bg-zinc-100 transition-all"
              >
                Not related to existing issue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
