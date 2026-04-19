import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

export default function NotificationsPage() {
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
        <div className="w-10 h-10 rounded-xl bg-autofix-muted flex items-center justify-center border border-border-faint">
          <Bell className="w-5 h-5 text-autofix-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">Configure alert channels and notification preferences</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-faint rounded-xl p-8 text-center mt-8">
        <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">Notification Preferences</h3>
        <p className="text-sm text-text-secondary">This feature is currently under active development. You will soon be able to configure email, Slack, and in-app alerts here.</p>
      </div>
    </div>
  );
}
