"use client";

import { motion } from "framer-motion";
import {
  Key,
  Bell,
  Users,
  Webhook,
  Database,
  Shield,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    title: "Integrations",
    description: "Connect external services like Telegram, Sentry, and GitHub",
    icon: Webhook,
    href: "/settings/integrations",
    color: "text-memory-primary",
    bg: "bg-memory-muted",
  },
  {
    title: "Notifications",
    description: "Configure alert channels and notification preferences",
    icon: Bell,
    href: "/settings/notifications",
    color: "text-autofix-primary",
    bg: "bg-autofix-muted",
  },
  {
    title: "Team Members",
    description: "Manage workspace members and permissions",
    icon: Users,
    href: "/settings/members",
    color: "text-nexus-primary",
    bg: "bg-nexus-muted",
  },
  {
    title: "API Keys",
    description: "Manage API keys for external access",
    icon: Key,
    href: "/settings/api-keys",
    color: "text-text-secondary",
    bg: "bg-bg-elevated",
  },
  {
    title: "Security",
    description: "Encryption, sanitization, and access control settings",
    icon: Shield,
    href: "/settings/security",
    color: "text-text-secondary",
    bg: "bg-bg-elevated",
  },
  {
    title: "Data Management",
    description: "Storage, retention policies, and data export",
    icon: Database,
    href: "/settings/data-management",
    color: "text-text-secondary",
    bg: "bg-bg-elevated",
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Configure your NexusOps workspace
        </p>
      </div>

      <div className="space-y-2.5">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link
                href={section.href}
                className="flex items-center gap-4 p-4 bg-bg-surface border border-border-faint rounded-xl hover:border-border-default transition-colors group"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", section.bg)}>
                  <Icon className={cn("w-5 h-5", section.color)} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-text-primary group-hover:text-white transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-2xs text-text-muted mt-0.5">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
