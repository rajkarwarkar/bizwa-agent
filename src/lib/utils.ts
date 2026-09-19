export { cn } from "cn";

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getLeadScoreColor(score: number): string {
  if (score >= 70) return "text-red-500";
  if (score >= 40) return "text-amber-500";
  return "text-emerald-500";
}

export function getLeadScoreLabel(score: number): string {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "escalated": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "resolved": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "closed": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "new": return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    case "contacted": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "converted": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "lost": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export const DEMO_BUSINESS_ID = "00000000-0000-0000-0000-000000000001";
