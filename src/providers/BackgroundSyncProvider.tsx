"use client";

import { useBackgroundSync } from "@/lib/background-sync";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * BackgroundSyncProvider - Initializes background sync once on mount
 * 
 * Shows a loading screen for first-time users while initial sync completes.
 * For returning users, sync happens silently in background.
 */
export function BackgroundSyncProvider({ children }: { children: React.ReactNode }) {
  const { syncState, isFirstTimeUser } = useBackgroundSync();
  const [showSyncScreen, setShowSyncScreen] = useState(isFirstTimeUser);

  useEffect(() => {
    // Hide sync screen once initial sync complete
    if (syncState.status === 'complete' && showSyncScreen) {
      // Small delay for smooth transition
      setTimeout(() => setShowSyncScreen(false), 500);
    }
  }, [syncState.status, showSyncScreen]);

  // Show loading screen for first-time users only
  if (showSyncScreen && isFirstTimeUser) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50/30 to-white"
        >
          <div className="flex flex-col items-center gap-6 p-8">
            {/* Logo / Brand */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-5xl font-bold uppercase tracking-tighter text-zinc-900 font-heading">
                Body OS
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mt-2" />
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative w-24 h-24">
                {/* Spinning Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-400 border-r-amber-400"
                />
                
                {/* Inner Pulse */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-300/40 to-amber-300/40"
                />
              </div>

              {/* Status Text */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-zinc-700 font-semibold">
                  {syncState.status === 'syncing' ? 'Setting up your data...' : 'Almost ready...'}
                </p>
                {syncState.progress > 0 && (
                  <p className="text-zinc-500 text-sm">
                    {syncState.progress}% complete
                  </p>
                )}
              </div>

              {/* Error State */}
              {syncState.status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm max-w-sm text-center"
                >
                  {syncState.error || 'Sync failed. Please check your connection.'}
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // For returning users or after initial sync: render children immediately
  return <>{children}</>;
}
