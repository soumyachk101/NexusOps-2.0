"use client";

import { motion } from "framer-motion";
import { SourceBadge } from "./SourceBadge";
import { DocumentChunk } from "@/lib/api";

interface AnswerCardProps {
  content: string;
  sources?: Array<Record<string, unknown>>;
  confidence?: number;
}

export function AnswerCard({ content, sources, confidence }: AnswerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-memory-tag-bg border-l-[3px] border-l-memory-primary rounded-xl px-5 py-4 max-w-[85%]"
    >
      {/* Answer text */}
      <div className="text-sm text-text-primary leading-[1.8] whitespace-pre-wrap">
        {content.split('\n').map((line, i) => {
          // Handle bold markdown
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {parts.map((part, j) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={j} className="text-text-primary font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={j}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>

      {/* Confidence */}
      {confidence && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 max-w-[120px] bg-bg-base rounded-full overflow-hidden">
            <div
              className="h-full bg-memory-primary rounded-full transition-all duration-500"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span className="text-2xs font-mono text-memory-primary">
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>
      )}

      {/* Source badges */}
      {sources && sources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-memory-tag-border">
          <p className="text-2xs text-text-muted uppercase tracking-wider mb-2 font-medium">
            Sources
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, idx) => (
              <SourceBadge key={(source.id as string) || idx} chunk={source as unknown as DocumentChunk} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
