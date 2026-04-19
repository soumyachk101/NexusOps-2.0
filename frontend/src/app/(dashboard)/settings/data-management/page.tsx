"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Database, HardDrive, Clock, Download, Trash2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageStat {
  label: string;
  value: string;
  percentage: number;
  color: string;
}

const storageStats: StorageStat[] = [
  { label: "Memory Sources", value: "12.4 MB", percentage: 35, color: "bg-memory-primary" },
  { label: "Incidents", value: "8.7 MB", percentage: 25, color: "bg-autofix-primary" },
  { label: "AI Fix History", value: "5.2 MB", percentage: 15, color: "bg-nexus-primary" },
  { label: "Logs & Metadata", value: "3.1 MB", percentage: 9, color: "bg-yellow-500" },
];

export default function DataManagementPage() {
  const [retentionDays, setRetentionDays] = useState(90);
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = () => {
    setExportLoading(true);
    setTimeout(() => {
      setExportLoading(false);
      alert("Export complete! Your data has been downloaded.");
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Settings
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center border border-border-faint">
          <Database className="w-5 h-5 text-text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Data Management</h1>
          <p className="text-sm text-text-secondary mt-1">Storage, retention policies, and data export</p>
        </div>
      </div>

      {/* Storage Overview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-surface border border-border-faint rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary">Storage Usage</h2>
          </div>
          <span className="text-xs text-text-muted font-mono">29.4 MB / 1 GB</span>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-bg-base rounded-full overflow-hidden flex mb-4">
          {storageStats.map((stat) => (
            <div key={stat.label} className={cn("h-full", stat.color)} style={{ width: `${stat.percentage}%` }} />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {storageStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2"
            >
              <div className={cn("w-2.5 h-2.5 rounded-sm", stat.color)} />
              <span className="text-2xs text-text-secondary">{stat.label}</span>
              <span className="text-2xs text-text-muted font-mono ml-auto">{stat.value}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Retention Policy */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-bg-surface border border-border-faint rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-text-secondary" />
          <h2 className="text-sm font-semibold text-text-primary">Retention Policy</h2>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Automatically delete old incident data and resolved fixes after a specified period.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {[30, 60, 90, 180, 365].map((days) => (
              <button
                key={days}
                onClick={() => setRetentionDays(days)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  retentionDays === days
                    ? "bg-memory-primary/20 border-memory-primary/50 text-memory-primary"
                    : "bg-bg-elevated border-border-faint text-text-muted hover:text-text-secondary"
                )}
              >
                {days}d
              </button>
            ))}
          </div>
          <span className="text-xs text-text-secondary ml-2">
            Keep data for <strong className="text-text-primary">{retentionDays} days</strong>
          </span>
        </div>
      </motion.div>

      {/* Data Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-bg-surface border border-border-faint rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-text-secondary" />
          <h2 className="text-sm font-semibold text-text-primary">Data Actions</h2>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="w-full flex items-center justify-between p-3 bg-bg-elevated border border-border-faint rounded-xl hover:border-memory-primary/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-memory-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Export All Data</p>
                <p className="text-2xs text-text-muted">Download incidents, fixes, and memory as JSON</p>
              </div>
            </div>
            {exportLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-memory-primary/30 border-t-memory-primary animate-spin" />
            ) : (
              <span className="text-xs text-text-muted group-hover:text-memory-primary transition-colors">Export →</span>
            )}
          </button>

          <button className="w-full flex items-center justify-between p-3 bg-bg-elevated border border-border-faint rounded-xl hover:border-red-500/30 transition-colors group">
            <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4 text-red-400/60" />
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Clear Resolved Incidents</p>
                <p className="text-2xs text-text-muted">Delete all incidents with status: resolved or dismissed</p>
              </div>
            </div>
            <span className="text-xs text-text-muted group-hover:text-red-400 transition-colors">Clear →</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
