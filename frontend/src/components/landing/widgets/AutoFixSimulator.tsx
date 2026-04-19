"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Search, CheckCircle2, AlertCircle } from "lucide-react";

const CODE_STAGES = [
  {
    id: "detect",
    title: "Vulnerability Scan",
    icon: Search,
    color: "text-[#A7C6FF]",
    bg: "bg-[#A7C6FF]/5",
    border: "border-[#A7C6FF]/20",
    code: `async function processOrder(orderId) {
  const order = await db.orders.find(orderId);
  // Missing validation
  return order.status;
}`,
    highlight: 2,
  },
  {
    id: "analyze",
    title: "Anomaly Detected",
    icon: AlertCircle,
    color: "text-[#FFD7C2]",
    bg: "bg-[#FFD7C2]/5",
    border: "border-[#FFD7C2]/20",
    code: `async function processOrder(orderId) {
  const order = await db.orders.find(orderId);
  // [!] Null pointer risk
  return order.status;
}`,
    highlight: 2,
  },
  {
    id: "fix",
    title: "Applying Patch",
    icon: Zap,
    color: "text-[#C9B6FF]",
    bg: "bg-[#C9B6FF]/5",
    border: "border-[#C9B6FF]/20",
    code: `async function processOrder(orderId) {
  const order = await db.orders.find(orderId);
  if (!order) return null; // Added safety check
  return order.status;
}`,
    highlight: 2,
  },
  {
    id: "done",
    title: "Verification Complete",
    icon: CheckCircle2,
    color: "text-[#9FE8C3]",
    bg: "bg-[#9FE8C3]/5",
    border: "border-[#9FE8C3]/20",
    code: `async function processOrder(orderId) {
  const order = await db.orders.find(orderId);
  if (!order) return null;
  return order.status;
}`,
    highlight: -1,
  },
];

export function AutoFixSimulator() {
  const [stageIndex, setStageIndex] = useState(0);
  const currentStage = CODE_STAGES[stageIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % CODE_STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full min-h-[320px] bg-bg-surface flex flex-col group">
      {/* Tab Header */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-tight">order_processor.ts</span>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[9px] font-mono text-text-muted/50">84 lines</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${currentStage.border} ${currentStage.bg} transition-colors duration-700`}>
          <currentStage.icon className={`w-2.5 h-2.5 ${currentStage.color}`} />
          <span className={`text-[9px] font-semibold uppercase tracking-wider ${currentStage.color}`}>
            {currentStage.id}
          </span>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 p-6 font-mono text-[12px] leading-relaxed relative overflow-hidden bg-[#0a0c10]">
        <div className="relative z-10 space-y-1">
          {currentStage.code.split("\n").map((line, i) => (
            <motion.div 
              key={`${stageIndex}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-4 ${i === currentStage.highlight ? (currentStage.bg + ' -mx-2 px-2 rounded-sm border-l-2 ' + currentStage.border) : ''}`}
            >
              <span className="w-4 text-right text-text-muted/20 select-none text-[10px] mt-0.5">{i + 1}</span>
              <span className={`whitespace-pre ${i === currentStage.highlight ? 'text-white' : 'text-text-secondary/80'}`}>
                {line}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Scan line effect (only for detect) */}
        {currentStage.id === "detect" && (
            <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-[20%] bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none"
            />
        )}
      </div>

      {/* Modern Footer Info */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStage.id}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            className="flex flex-col gap-0.5"
          >
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
              {currentStage.title}
            </span>
            <span className="text-[10px] text-text-muted leading-tight">
              {stageIndex === 0 && "Continuous monitoring of production path calls."}
              {stageIndex === 1 && "Detected potential runtime exception in db query."}
              {stageIndex === 2 && "Patch synthesized from historical PR context."}
              {stageIndex === 3 && "Verified via production-shadow tests."}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
