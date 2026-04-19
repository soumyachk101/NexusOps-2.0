"use client";

import { motion } from "framer-motion";
import { GitPullRequest, MessageSquare, FileText, Database } from "lucide-react";

const NODES = [
  { id: 1, icon: GitPullRequest, label: "Deployment #82", x: "20%", y: "30%", color: "text-purple-500" },
  { id: 2, icon: MessageSquare, label: "Context Feed", x: "75%", y: "25%", color: "text-blue-500" },
  { id: 3, icon: FileText, label: "Technical Docs", x: "85%", y: "65%", color: "text-emerald-500" },
  { id: 4, icon: Database, label: "Production DB", x: "35%", y: "80%", color: "text-amber-500" },
];

export function DeepMemoryNetwork() {
  return (
    <div className="relative h-full min-h-[320px] bg-bg-surface flex flex-col group p-6 overflow-hidden">
      <div className="mb-8">
        <h3 className="text-[10px] font-semibold text-white tracking-widest uppercase mb-1">
          Contextual Mapping
        </h3>
        <p className="text-[10px] text-text-muted font-medium">
          Relational Intelligence Graph
        </p>
      </div>

      <div className="flex-1 relative">
        {/* Subtle Connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]">
          <line x1="20%" y1="30%" x2="75%" y2="25%" stroke="white" strokeWidth="1" />
          <line x1="75%" y1="25%" x2="85%" y2="65%" stroke="white" strokeWidth="1" />
          <line x1="85%" y1="65%" x2="35%" y2="80%" stroke="white" strokeWidth="1" />
          <line x1="35%" y1="80%" x2="20%" y2="30%" stroke="white" strokeWidth="1" />
        </svg>

        {/* Floating Nodes */}
        {NODES.map((node) => (
          <motion.div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
            style={{ left: node.x, top: node.y }}
            animate={{ 
              y: [0, -8, 0],
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              delay: node.id * 0.8,
              ease: "easeInOut"
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center backdrop-blur-md transition-all group-hover:border-[#C9B6FF]/20">
              <node.icon className={`w-5 h-5 ${node.color}`} />
            </div>
            <span className="text-[9px] font-bold text-text-muted/60 uppercase tracking-tighter">
              {node.label}
            </span>
          </motion.div>
        ))}

        {/* Central Intelligence Hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                    "0 0 0px rgba(201, 182, 255, 0)",
                    "0 0 40px rgba(201, 182, 255, 0.2)",
                    "0 0 0px rgba(201, 182, 255, 0)"
                ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-[#C9B6FF]/10 border border-[#C9B6FF]/30 flex items-center justify-center"
          >
            <div className="text-center">
                <p className="text-[9px] font-bold text-white uppercase tracking-tight">Intelligence</p>
                <p className="text-[10px] font-mono text-[#C9B6FF] font-bold">CORE</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-center text-[9px] font-bold text-text-muted uppercase tracking-tight">
            <span>Graph Confidence</span>
            <span className="text-[#C9B6FF]">98.4%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "98.4%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-[#C9B6FF] shadow-[0_0_10px_rgba(201,182,255,0.5)]"
            />
        </div>
      </div>
    </div>
  );
}
