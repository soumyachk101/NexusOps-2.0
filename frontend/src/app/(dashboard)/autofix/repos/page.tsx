"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, CheckCircle, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { autofixApi, workspaceApi, Repository, Workspace } from "@/lib/api";

export default function ReposPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", full_name: "", default_branch: "main", token: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { workspaces } = await workspaceApi.list();
        if (workspaces && workspaces.length > 0) {
          setWorkspaces(workspaces);
          const data = await autofixApi.listRepos(workspaces[0].id);
          setRepos(data);
        }
      } catch (err) {
        console.error("Failed to load repositories:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (workspaces.length === 0) return;
    try {
      setSubmitting(true);
      setError(null);
      const newRepo = await autofixApi.connectRepo(
        workspaces[0].id,
        formData.name,
        formData.full_name,
        formData.default_branch,
        formData.token || undefined
      );
      setRepos([newRepo, ...repos]);
      setIsModalOpen(false);
      setFormData({ name: "", full_name: "", default_branch: "main", token: "" });
    } catch (err: unknown) {
      console.error("Failed to connect repo:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || "Failed to connect repository");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-text-muted text-sm animate-pulse">Loading Repositories...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Repositories
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Connected repositories monitored by AutoFix
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-autofix-primary text-bg-base rounded-lg text-sm font-medium hover:bg-autofix-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Connect Repo
        </button>
      </div>

      {repos.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border-default rounded-2xl">
          <GitBranch className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-medium">No repositories connected</p>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            Connect a GitHub repository to start monitoring for production errors with AutoFix.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-bg-surface border border-border-faint rounded-xl p-5 hover:border-autofix-border transition-all group cursor-pointer"
          >
            {/* Repo name */}
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-mono font-medium text-text-primary group-hover:text-autofix-primary transition-colors">
                {repo.full_name || repo.name}
              </span>
            </div>

            {/* Language + Branch */}
            <div className="flex items-center gap-3 mb-4 text-2xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-full", repo.language === "python" ? "bg-yellow-400" : repo.language === "typescript" ? "bg-blue-500" : "bg-green-500")} />
                {repo.language || "Unknown"}
              </div>
              <span className="font-mono">{repo.default_branch}</span>
              <span className="font-mono">{repo.is_private ? "Private" : "Public"}</span>
            </div>

            {/* Integration status */}
            <div className="flex items-center gap-4 text-2xs">
              <div className={cn("flex items-center gap-1", "text-status-success")}>
                <CheckCircle className="w-3 h-3" />
                GitHub
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-surface border border-border-default rounded-xl p-6 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">Connect Repository</h2>
            {error && (
              <div className="mb-4 p-3 bg-status-error/10 border border-status-error/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-status-error mt-0.5 shrink-0" />
                <p className="text-xs text-status-error">{error}</p>
              </div>
            )}
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Repository Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. frontend"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-bg-base border border-border-faint rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-autofix-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NexusOps/frontend"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-bg-base border border-border-faint rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-autofix-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Default Branch</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. main"
                  value={formData.default_branch}
                  onChange={(e) => setFormData({ ...formData, default_branch: e.target.value })}
                  className="w-full bg-bg-base border border-border-faint rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-autofix-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">GitHub Access Token (Optional)</label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  className="w-full bg-bg-base border border-border-faint rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-autofix-primary"
                />
                <p className="text-2xs text-text-muted mt-1">If provided, we will fetch the real branch and language from GitHub.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-bg-elevated text-text-secondary rounded-lg text-sm font-medium hover:bg-bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-autofix-primary text-bg-base rounded-lg text-sm font-medium hover:bg-autofix-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? "Connecting..." : "Connect"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
