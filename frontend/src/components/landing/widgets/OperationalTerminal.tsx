"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, Clock } from "lucide-react";

const LOGS = [
  { type: "info", msg: "Initializing contextual analysis engine..." },
  { type: "success", msg: "Infrastrucure handshake complete." },
  { type: "info", msg: "Scanning codebase for pattern matches..." },
  { type: "warning", msg: "Anomalous error rate detected in Auth-Service." },
  { type: "info", msg: "Cross-referencing historical PR documentation..." },
  { type: "success", msg: "Potential root cause identified: PR #902." },
  { type: "info", msg: "Synthesizing remediation strategy..." },
  { type: "success", msg: "Fix verified via shadow environment." },
  { type: "info", msg: "Applying verified patch to production..." },
  { type: "success", msg: "Incident resolved. Monitoring for regressions." },
  { type: "info", msg: "System health optimized. Standing by." },
];

export function OperationalTerminal() {
  const [visibleLogs, setVisibleLogs] = useState<typeof LOGS>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setVisibleLogs((prev) => [...prev, LOGS[i]].slice(-7));
      i = (i + 1) % LOGS.length;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full min-h-[320px] bg-bg-surface flex flex-col group font-sans">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-black/10">
        <div className="flex items-center gap-2">
            <ScrollText className="w-3.5 h-3.5 text-[#C9B6FF]" />
            <span className="text-[10px] font-semibold text-white tracking-widest uppercase">
                Operational Log
            </span>
        </div>
        <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-[9px] font-mono text-text-muted uppercase">Real-time</span>
        </div>
      </div>

      <div className="flex-1 p-5 overflow-hidden relative bg-[#333333]/30">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleLogs.map((log, idx) => (
              <motion.div
                key={`${log.msg}-${idx}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4"
              >
                <span className="text-[9px] font-mono text-text-muted mt-0.5 opacity-40">
                    {new Date().toLocaleTimeString([], { hour12: false })}
                </span>
                <div className="flex items-start gap-2.5">
                    <div className={`mt-1.5 w-1 h-1 rounded-full ${
                        log.type === 'success' ? 'bg-[#9FE8C3]' : 
                        log.type === 'warning' ? 'bg-[#FFD7C2]' : 'bg-[#A7C6FF]'
                    }`} />
                    <span className={`text-[11px] leading-snug tracking-tight font-medium ${
                        log.type === 'success' ? 'text-text-primary' : 
                        log.type === 'warning' ? 'text-[#FFD7C2]/80' : 'text-text-secondary'
                    }`}>
                        {log.msg}
                    </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-white/5 bg-black/10 flex items-center justify-between text-[9px] font-bold text-text-muted uppercase tracking-tighter">
        <div className="flex gap-4">
            <span>Status: Connected</span>
            <span>Uptime: 99.9%</span>
        </div>
        <span className="text-[#C9B6FF]">Secure Feed</span>
      </div>
    </div>
  );
}
