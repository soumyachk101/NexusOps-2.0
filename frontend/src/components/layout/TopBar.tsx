"use client";

import { Menu, Bell, ChevronDown, Search } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { currentWorkspace, workspaces, setCurrentWorkspace } =
    useWorkspaceStore();

  return (
    <header className="h-14 border-b border-border-faint bg-bg-surface/90 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20 gap-4">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global search */}
        <Link
          href="/memory/ask"
          className="hidden sm:flex items-center gap-2.5 flex-1 max-w-sm px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-faint hover:border-border-default transition-all duration-150 text-text-muted text-xs group"
        >
          <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
          <span className="flex-1 truncate">Search incidents, runbooks&hellip;</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-2xs font-mono bg-bg-base border border-border-faint rounded text-text-muted shrink-0">
            ⌘K
          </kbd>
        </Link>
      </div>

      {/* Right: notifications + workspace switcher */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell */}
        <button
          className="relative text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-bg-elevated"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sev-critical rounded-full ring-1 ring-bg-surface" />
        </button>

        {/* Workspace Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-elevated border border-border-faint hover:border-border-default transition-all">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-nexus-primary/30 to-nexus-primary/10 flex items-center justify-center text-2xs font-bold text-nexus-primary shrink-0">
              {currentWorkspace ? currentWorkspace.name.charAt(0).toUpperCase() : "N"}
            </div>
            <span className="text-text-primary text-xs font-medium max-w-[100px] truncate hidden sm:block">
              {currentWorkspace ? currentWorkspace.name : "Select Workspace"}
            </span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1.5 w-56 bg-bg-elevated border border-border-default rounded-xl shadow-2xl shadow-black/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="p-1 border-b border-border-faint">
              <p className="px-3 py-1.5 text-2xs text-text-muted font-mono uppercase tracking-wider">
                Workspaces
              </p>
            </div>
            <div className="p-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setCurrentWorkspace(ws)}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition-colors",
                    ws.id === currentWorkspace?.id
                      ? "bg-nexus-muted text-nexus-primary"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  )}
                >
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-nexus-primary/30 to-nexus-primary/10 flex items-center justify-center text-2xs font-bold text-nexus-primary shrink-0">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate text-left">{ws.name}</span>
                  {ws.id === currentWorkspace?.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-nexus-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
