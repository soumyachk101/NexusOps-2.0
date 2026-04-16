"use client";

import { Menu, Bell, ChevronDown } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { currentWorkspace, workspaces, setCurrentWorkspace } =
    useWorkspaceStore();

  return (
    <header className="h-14 border-b border-border-faint bg-bg-surface/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: workspace switcher + notifications */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-bg-hover">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-autofix-primary rounded-full" />
        </button>

        {/* Workspace Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-faint hover:border-border-default transition-all text-sm">
            <div className="w-5 h-5 rounded bg-nexus-primary/20 flex items-center justify-center text-2xs font-bold text-nexus-primary">
              {currentWorkspace ? currentWorkspace.name.charAt(0) : "N"}
            </div>
            <span className="text-text-primary text-xs font-medium max-w-[120px] truncate">
              {currentWorkspace ? currentWorkspace.name : "Select Workspace"}
            </span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-56 bg-bg-elevated border border-border-default rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="p-1.5">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setCurrentWorkspace(ws)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors",
                    ws.id === currentWorkspace?.id
                      ? "bg-bg-selected text-text-primary"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  )}
                >
                  <div className="w-5 h-5 rounded bg-nexus-primary/20 flex items-center justify-center text-2xs font-bold text-nexus-primary">
                    {ws.name.charAt(0)}
                  </div>
                  {ws.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
