"use client";

import { getActiveBlockers, logBlockerSeverity, resolveBlocker } from "@/app/actions/blockers";
import { BlockerStatus } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Minus, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateBlockerModal } from "./CreateBlockerModal";

interface BlockerDashboardProps {
  compact?: boolean;
}

export function BlockerDashboard({ compact = false }: BlockerDashboardProps) {
  const [blockers, setBlockers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedBlockerId, setExpandedBlockerId] = useState<string | null>(null);

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

  const handleSeverityUpdate = async (blockerId: string, newSeverity: number) => {
    try {
      await logBlockerSeverity(blockerId, newSeverity);
      loadBlockers(); // Refresh
    } catch (error) {
      console.error("Failed to update severity:", error);
    }
  };

  const handleResolve = async (blockerId: string) => {
    if (!confirm("Mark this issue as resolved?")) return;
    
    try {
      await resolveBlocker(blockerId);
      loadBlockers(); // Refresh
    } catch (error) {
      console.error("Failed to resolve blocker:", error);
    }
  };

  const getStatusColor = (status: BlockerStatus) => {
    switch (status) {
      case "ACTIVE": return "bg-red-100 text-red-700 border-red-300";
      case "RECOVERING": return "bg-amber-100 text-amber-700 border-amber-300";
      case "CHRONIC": return "bg-purple-100 text-purple-700 border-purple-300";
      default: return "bg-green-100 text-green-700 border-green-300";
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "text-green-600";
    if (severity <= 6) return "text-amber-600";
    return "text-red-600";
  };

  const getTrend = (entries: any[]) => {
    if (!entries || entries.length < 2) return null;
    const latest = entries[0].severity;
    const previous = entries[1].severity;
    if (latest < previous) return "down";
    if (latest > previous) return "up";
    return "same";
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-zinc-400">
        Loading body status...
      </div>
    );
  }

  // Compact view for dashboard
  if (compact) {
    return (
      <div className="space-y-3">
        {blockers.length === 0 ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full p-4 rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-colors"
          >
            <AlertTriangle size={24} className="mx-auto mb-2" />
            <p className="text-sm font-medium">No active issues</p>
            <p className="text-xs">Tap to report one</p>
          </button>
        ) : (
          <>
            {blockers.slice(0, 2).map((blocker) => (
              <div
                key={blocker.id}
                className={`p-4 rounded-2xl border ${getStatusColor(blocker.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{blocker.name}</p>
                    <p className="text-xs opacity-70">{blocker.bodyPart}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getSeverityColor(blocker.severity)}`}>
                      {blocker.severity}
                    </span>
                    {getTrend(blocker.entries) === "down" && (
                      <TrendingDown size={16} className="text-green-500" />
                    )}
                    {getTrend(blocker.entries) === "up" && (
                      <TrendingUp size={16} className="text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {blockers.length > 2 && (
              <p className="text-xs text-center text-zinc-400">
                +{blockers.length - 2} more issues
              </p>
            )}
          </>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateBlockerModal
              onClose={() => setShowCreateModal(false)}
              onCreated={() => {
                setShowCreateModal(false);
                loadBlockers();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Body Status</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-medium text-sm hover:bg-red-200 transition-colors"
        >
          + Report Issue
        </button>
      </div>

      {/* Blockers List */}
      {blockers.length === 0 ? (
        <div className="p-8 text-center bg-green-50 rounded-3xl border border-green-200">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
          <p className="font-bold text-green-700">All Clear!</p>
          <p className="text-sm text-green-600">No active body issues</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blockers.map((blocker) => (
            <motion.div
              key={blocker.id}
              layout
              className="bg-white rounded-3xl border border-zinc-200 overflow-hidden"
            >
              {/* Main Card */}
              <button
                onClick={() => setExpandedBlockerId(
                  expandedBlockerId === blocker.id ? null : blocker.id
                )}
                className="w-full p-5 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      blocker.status === "ACTIVE" 
                        ? "bg-red-100" 
                        : blocker.status === "RECOVERING" 
                        ? "bg-amber-100" 
                        : "bg-purple-100"
                    }`}>
                      <AlertTriangle className={`${
                        blocker.status === "ACTIVE" 
                          ? "text-red-600" 
                          : blocker.status === "RECOVERING" 
                          ? "text-amber-600" 
                          : "text-purple-600"
                      }`} size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{blocker.name}</p>
                      <p className="text-sm text-zinc-500">{blocker.bodyPart}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getStatusColor(blocker.status)}`}>
                        {blocker.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-bold ${getSeverityColor(blocker.severity)}`}>
                        {blocker.severity}
                      </span>
                      <span className="text-zinc-400">/10</span>
                    </div>
                    {getTrend(blocker.entries) === "down" && (
                      <span className="text-xs text-green-600 flex items-center gap-1 justify-end">
                        <TrendingDown size={12} /> Improving
                      </span>
                    )}
                    {getTrend(blocker.entries) === "up" && (
                      <span className="text-xs text-red-600 flex items-center gap-1 justify-end">
                        <TrendingUp size={12} /> Worsening
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Section */}
              <AnimatePresence>
                {expandedBlockerId === blocker.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-100"
                  >
                    <div className="p-5 space-y-4">
                      {/* Quick Update */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-500">Update Severity</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleSeverityUpdate(blocker.id, Math.max(1, blocker.severity - 1))}
                            className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
                          >
                            <Minus size={20} />
                          </button>
                          <div className="flex-1 h-3 bg-zinc-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500"
                              style={{ width: `${blocker.severity * 10}%` }}
                            />
                          </div>
                          <button
                            onClick={() => handleSeverityUpdate(blocker.id, Math.min(10, blocker.severity + 1))}
                            className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>

                      {/* History Mini Graph */}
                      {blocker.entries && blocker.entries.length > 1 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-zinc-500">Recent History</p>
                          <div className="flex items-end gap-1 h-16">
                            {blocker.entries.slice(0, 7).reverse().map((entry: any, i: number) => (
                              <div
                                key={entry.id}
                                className="flex-1 rounded-t-sm bg-gradient-to-t from-zinc-200 to-zinc-100"
                                style={{ 
                                  height: `${entry.severity * 10}%`,
                                  backgroundColor: entry.severity <= 3 
                                    ? '#22c55e' 
                                    : entry.severity <= 6 
                                    ? '#f59e0b' 
                                    : '#ef4444'
                                }}
                                title={`${entry.severity}/10`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolve Button */}
                      <button
                        onClick={() => handleResolve(blocker.id)}
                        className="w-full py-3 rounded-xl bg-green-100 text-green-700 font-medium hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle size={16} className="inline mr-2" />
                        Mark as Resolved
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateBlockerModal
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              loadBlockers();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
