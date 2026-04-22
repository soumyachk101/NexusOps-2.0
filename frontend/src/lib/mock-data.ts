import { ActivityItem, DashboardStats } from "./types";

export const mockDashboardStats: DashboardStats = {
  nexus: {
    queries_today: 128,
    active_incidents: 3,
    prs_created: 12,
    memory_items: 450,
  },
  memory: {
    messages_indexed: 5420,
    tasks_detected: 85,
    decisions_logged: 312,
    avg_answer_time_ms: 1200,
  },
  autofix: {
    total_incidents: 42,
    avg_mttr_seconds: 270,
    auto_reverts: 5,
    safety_blocks: 8,
  },
};

export const mockActivityFeed: ActivityItem[] = [
  {
    id: "1",
    module: "memory",
    type: "memory_enrichment",
    title: "New source ingested",
    description: "nexus-docs-v2 processed successfully",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    module: "autofix",
    type: "incident_received",
    title: "Incident detected",
    description: "HTTP 500 in auth-service",
    timestamp: new Date().toISOString(),
  },
  {
    id: "3",
    module: "nexus",
    type: "pr_created",
    title: "Fix PR created",
    description: "Resolved memory leak in worker process",
    timestamp: new Date().toISOString(),
  },
  {
    id: "4",
    module: "memory",
    type: "task_detected",
    title: "Action item identified",
    description: "Update documentation for webhook API",
    timestamp: new Date().toISOString(),
  },
];

export const mockChatMessages = [
  { id: "q1", role: "user", content: "How do I resolve the OOM error in production?" },
  { id: "a1", role: "assistant", content: "Based on recent logs, the OOM is coming from the image-processor service..." },
  { id: "q2", role: "user", content: "Show me all unresolved incidents for last 24h" },
];
