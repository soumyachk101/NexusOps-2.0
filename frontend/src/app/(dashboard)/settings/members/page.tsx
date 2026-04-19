import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default function MembersPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Settings
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-nexus-muted flex items-center justify-center border border-border-faint">
          <Users className="w-5 h-5 text-nexus-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Team Members</h1>
          <p className="text-sm text-text-secondary mt-1">Manage workspace members and permissions</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-faint rounded-xl p-8 text-center mt-8">
        <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Member Management</h3>
        <p className="text-sm text-text-secondary">This feature is currently under active development. You will soon be able to invite teammates and set granular RBAC roles.</p>
      </div>
    </div>
  );
}
