"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Copy, Eye, EyeOff, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKeyEntry {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const mockKeys: ApiKeyEntry[] = [
  {
    id: "1",
    name: "Production Webhook",
    key: "nxo_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    created: "2026-04-10",
    lastUsed: "2 hours ago",
  },
  {
    id: "2",
    name: "Sentry Integration",
    key: "nxo_live_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    created: "2026-04-15",
    lastUsed: "5 min ago",
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyEntry[]>(mockKeys);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const createKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKeyEntry = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `nxo_live_${Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
    };
    setKeys((prev) => [newKey, ...prev]);
    setNewKeyName("");
    setShowCreate(false);
  };

  const maskKey = (key: string) => key.slice(0, 12) + "••••••••••••••••••••••••";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Settings
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center border border-border-faint">
            <Key className="w-5 h-5 text-text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">API Keys</h1>
            <p className="text-sm text-text-secondary mt-1">Manage API keys for external access to NexusOps</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-memory-primary hover:bg-memory-hover text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      </div>

      {/* Create new key */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-bg-surface border border-memory-primary/30 rounded-xl p-4 flex items-center gap-3"
        >
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., 'Production Webhook')"
            className="flex-1 px-3 py-2 bg-bg-elevated border border-border-faint rounded-lg text-sm text-text-primary placeholder-text-muted focus:ring-1 focus:ring-memory-primary outline-none"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && createKey()}
          />
          <button onClick={createKey} className="px-4 py-2 bg-memory-primary text-white text-sm rounded-lg hover:bg-memory-hover transition-colors">
            Generate
          </button>
          <button onClick={() => setShowCreate(false)} className="px-3 py-2 text-text-muted text-sm hover:text-text-secondary transition-colors">
            Cancel
          </button>
        </motion.div>
      )}

      {/* Key list */}
      <div className="space-y-2.5">
        {keys.map((apiKey, i) => (
          <motion.div
            key={apiKey.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-bg-surface border border-border-faint rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-primary">{apiKey.name}</h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleReveal(apiKey.id)}
                  className="p-1.5 text-text-muted hover:text-text-secondary rounded-lg hover:bg-bg-elevated transition-colors"
                  title={revealedKeys.has(apiKey.id) ? "Hide" : "Reveal"}
                >
                  {revealedKeys.has(apiKey.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => copyKey(apiKey.id, apiKey.key)}
                  className={cn("p-1.5 rounded-lg hover:bg-bg-elevated transition-colors", copiedId === apiKey.id ? "text-green-400" : "text-text-muted hover:text-text-secondary")}
                  title="Copy"
                >
                  {copiedId === apiKey.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => deleteKey(apiKey.id)}
                  className="p-1.5 text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  title="Revoke"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs font-mono text-text-code bg-bg-base rounded-lg px-3 py-2 mb-2">
              {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
            </p>
            <div className="flex items-center gap-4 text-2xs text-text-muted">
              <span>Created: {apiKey.created}</span>
              <span>Last used: {apiKey.lastUsed}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage info */}
      <div className="bg-bg-surface border border-border-faint rounded-xl p-5 mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Usage</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          Use API keys to authenticate requests to the NexusOps webhook endpoints. Include the key in your request header:
        </p>
        <pre className="mt-3 text-xs font-mono text-text-code bg-bg-base rounded-lg p-3 overflow-x-auto">
          {`curl -X POST https://your-nexusops.com/webhook/error/YOUR_KEY \\
  -H "Content-Type: application/json" \\
  -d '{"workspace_id": "...", "error_message": "...", "severity": "high"}'`}
        </pre>
      </div>
    </div>
  );
}
