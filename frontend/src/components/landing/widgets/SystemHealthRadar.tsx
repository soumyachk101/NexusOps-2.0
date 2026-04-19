"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, Server, Globe } from "lucide-react";

export function SystemHealthRadar() {
  return (
    <div className="relative h-full min-h-[320px] bg-bg-surface flex flex-col group p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[10px] font-semibold text-white tracking-widest uppercase mb-1">
            System Infrastructure
          </h3>
          <p className="text-[10px] text-text-muted font-medium">
            Global Node Distribution
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#9FE8C3]/5 border border-[#9FE8C3]/20">
          <div className="w-1 h-1 rounded-full bg-[#9FE8C3] animate-pulse" />
          <span className="text-[9px] font-bold text-[#9FE8C3] uppercase">Stable</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {/* Subtle Background Rings */}
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="absolute rounded-full border border-white/[0.03]"
            style={{ 
              width: `${i * 100}px`, 
              height: `${i * 100}px` 
            }}
          />
        ))}

        {/* Central Pulse */}
        <motion.div
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute w-32 h-32 rounded-full bg-[#C9B6FF]/20 blur-2xl"
        />

        {/* Data Points */}
        <div className="relative z-10 grid grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all group-hover:border-[#C9B6FF]/20">
                    <ShieldCheck className="w-5 h-5 text-[#C9B6FF]" />
                </div>
                <span className="text-[9px] font-semibold text-text-muted uppercase tracking-tight">Security</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all group-hover:border-[#A7C6FF]/20">
                    <Activity className="w-5 h-5 text-[#A7C6FF]" />
                </div>
                <span className="text-[9px] font-semibold text-text-muted uppercase tracking-tight">Latency</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all group-hover:border-[#9FE8C3]/20">
                    <Server className="w-5 h-5 text-[#9FE8C3]" />
                </div>
                <span className="text-[9px] font-semibold text-text-muted uppercase tracking-tight">Compute</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all group-hover:border-[#FFD7C2]/20">
                    <Globe className="w-5 h-5 text-[#FFD7C2]" />
                </div>
                <span className="text-[9px] font-semibold text-text-muted uppercase tracking-tight">Edge</span>
            </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/5 pt-5">
        <div>
          <p className="text-[8px] text-text-muted font-bold uppercase tracking-tighter mb-1">Health Score</p>
          <p className="text-sm font-medium text-white">99.8</p>
        </div>
        <div>
          <p className="text-[8px] text-text-muted font-bold uppercase tracking-tighter mb-1">Requests</p>
          <p className="text-sm font-medium text-white">1.2M/s</p>
        </div>
        <div>
          <p className="text-[8px] text-text-muted font-bold uppercase tracking-tighter mb-1">Avg Latency</p>
          <p className="text-sm font-medium text-white">14ms</p>
        </div>
      </div>
    </div>
  );
}
