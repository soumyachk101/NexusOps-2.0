"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, FileWarning, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: "sanitization" | "access" | "encryption";
}

const initialSettings: SecuritySetting[] = [
  {
    id: "pii_stripping",
    title: "PII Auto-Stripping",
    description: "Automatically strip emails, names, and personal data before AI processing",
    enabled: true,
    category: "sanitization",
  },
  {
    id: "secret_redaction",
    title: "Secret Redaction",
    description: "Detect and redact API keys, tokens, passwords in error data",
    enabled: true,
    category: "sanitization",
  },
  {
    id: "stack_trace_sanitize",
    title: "Stack Trace Sanitization",
    description: "Clean file paths and environment variables from stack traces",
    enabled: true,
    category: "sanitization",
  },
  {
    id: "rbac_enforce",
    title: "Role-Based Access Control",
    description: "Enforce workspace member roles (owner, admin, member, viewer)",
    enabled: true,
    category: "access",
  },
  {
    id: "jwt_rotation",
    title: "JWT Token Rotation",
    description: "Automatically rotate access tokens every 24 hours",
    enabled: true,
    category: "access",
  },
  {
    id: "ip_whitelist",
    title: "IP Whitelisting",
    description: "Restrict webhook access to specific IP addresses",
    enabled: false,
    category: "access",
  },
  {
    id: "at_rest_encryption",
    title: "Encryption at Rest",
    description: "Encrypt all stored incident data and memory entries",
    enabled: true,
    category: "encryption",
  },
  {
    id: "transit_encryption",
    title: "Encryption in Transit",
    description: "Force TLS for all API communications",
    enabled: true,
    category: "encryption",
  },
];

export default function SecurityPage() {
  const [settings, setSettings] = useState<SecuritySetting[]>(initialSettings);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const categories = [
    { key: "sanitization", title: "Data Sanitization", icon: FileWarning, color: "text-yellow-400" },
    { key: "access", title: "Access Control", icon: Lock, color: "text-blue-400" },
    { key: "encryption", title: "Encryption", icon: Shield, color: "text-green-400" },
  ] as const;

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
          <Shield className="w-5 h-5 text-text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Security</h1>
          <p className="text-sm text-text-secondary mt-1">Encryption, sanitization, and access control settings</p>
        </div>
      </div>

      {/* Security Score */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-surface border border-green-500/30 rounded-xl p-5 flex items-center gap-4"
      >
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#242b3d" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${Math.round((settings.filter((s) => s.enabled).length / settings.length) * 100)}, 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-text-primary font-mono">
              {Math.round((settings.filter((s) => s.enabled).length / settings.length) * 100)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-green-400">Security Score</p>
          <p className="text-xs text-text-muted mt-0.5">
            {settings.filter((s) => s.enabled).length} of {settings.length} security measures enabled
          </p>
        </div>
      </motion.div>

      {/* Settings by category */}
      {categories.map(({ key, title, icon: Icon, color }) => (
        <div key={key}>
          <div className="flex items-center gap-2 mb-3">
            <Icon className={cn("w-4 h-4", color)} />
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          </div>
          <div className="space-y-2">
            {settings
              .filter((s) => s.category === key)
              .map((setting, i) => (
                <motion.div
                  key={setting.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-bg-surface border border-border-faint rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {setting.enabled ? (
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">{setting.title}</h3>
                      <p className="text-2xs text-text-muted mt-0.5">{setting.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting(setting.id)}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0",
                      setting.enabled ? "bg-green-500" : "bg-bg-elevated border border-border-faint"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                        setting.enabled ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
