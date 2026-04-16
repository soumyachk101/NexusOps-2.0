"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-base backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-2xl bg-nexus-primary/20 border border-nexus-primary/30 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(var(--nexus-primary-rgb),0.5)]">
          <Activity className="w-8 h-8 text-nexus-primary" />
        </div>
        
        {/* Pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl border border-nexus-primary"
        />
        <motion.div
          animate={{ scale: [1, 2], opacity: [0.3, 0] }}
          transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl border border-nexus-primary"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-6 text-sm font-medium tracking-widest text-nexus-primary uppercase select-none"
      >
        <span className="flex items-center gap-1">
           Loading<span className="animate-[bounce_1s_infinite_0ms]">.</span><span className="animate-[bounce_1s_infinite_100ms]">.</span><span className="animate-[bounce_1s_infinite_200ms]">.</span>
        </span>
      </motion.div>
    </div>
  );
}
