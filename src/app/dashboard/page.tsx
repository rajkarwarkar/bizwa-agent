"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Flame,
  Bot,
  User,
  Sparkles,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  cn,
  formatRelativeTime,
  getStatusColor,
  DEMO_BUSINESS_ID,
} from "@/lib/utils";
import type { DashboardStats } from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 4000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch(`/api/dashboard?business_id=${DEMO_BUSINESS_ID}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-24 mb-3" />
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Conversations",
      value: stats?.active_conversations ?? 0,
      subtext: `Total: ${stats?.total_conversations ?? 0}`,
      icon: MessageSquare,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "New Leads",
      value: stats?.new_leads ?? 0,
      subtext: "Captured from AI chats",
      icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "Hot Leads (Score 70+)",
      value: stats?.high_intent_leads ?? 0,
      subtext: "High purchase intent",
      icon: Flame,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      label: "Pending Escalations",
      value: stats?.pending_escalations ?? 0,
      subtext: "Requires human review",
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  // Derive live alerts from recent conversations
  const recentConvs = stats?.recent_conversations || [];
  const hotLeadConvs = recentConvs.filter((c) => c.lead_score >= 70);
  const escalatedConvs = recentConvs.filter((c) => c.status === "escalated" || c.controlled_by === "human");
  const aiResolvedConvs = recentConvs.filter((c) => c.status === "resolved" && c.controlled_by === "ai");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Live Sync Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-violet-500/10 to-emerald-500/10 border border-primary/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base">Real-Time AI Synchronization</h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-semibold">
                Live Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              BizWa AI is monitoring WhatsApp customer inquiries, scoring lead intent, and managing real-time escalations.
            </p>
          </div>
        </div>
        <Link href="/chat/demo" target="_blank" className="shrink-0 w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto gap-2 font-semibold shadow-xs">
            <ExternalLink className="w-4 h-4" />
            Open Customer Assistant
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Owner Control Center</h1>
          <p className="text-sm text-muted-foreground">
            Monitor real-time AI customer interactions, high-intent leads, and human escalations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Account: <strong>GoaTrip Adventures</strong></span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className={cn("border bg-card shadow-xs transition-all duration-200 hover:shadow-md", stat.border)}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight mb-1">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Live Activity Feed + Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Activity & Lead Alerts (1 col) */}
        <Card className="border-border/60 shadow-xs lg:col-span-1">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                AI Activity & Lead Alerts
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">Real-Time</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {hotLeadConvs.length === 0 && escalatedConvs.length === 0 && aiResolvedConvs.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No recent activity. Send a message in Customer Assistant to see live updates!
              </div>
            )}

            {/* Hot Leads Alerts */}
            {hotLeadConvs.slice(0, 3).map((conv) => (
              <Link key={`hot-${conv.id}`} href={`/dashboard/conversations/${conv.id}`}>
                <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                      🔥 HOT LEAD DETECTED
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/30 font-bold">
                      Score {conv.lead_score}/100
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground">{conv.customer_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.summary || "High purchase intent identified"}</p>
                </div>
              </Link>
            ))}

            {/* Human Escalation Alerts */}
            {escalatedConvs.slice(0, 3).map((conv) => (
              <Link key={`esc-${conv.id}`} href={`/dashboard/conversations/${conv.id}`}>
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                      ⚠️ HUMAN ESCALATION
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold">
                      {conv.controlled_by === "human" ? "Human Active" : "Action Needed"}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground">{conv.customer_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.summary || "Customer requested human takeover"}</p>
                </div>
              </Link>
            ))}

            {/* AI Resolved Alerts */}
            {aiResolvedConvs.slice(0, 2).map((conv) => (
              <Link key={`res-${conv.id}`} href={`/dashboard/conversations/${conv.id}`}>
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      ✓ AI RESOLVED
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatRelativeTime(conv.updated_at)}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground">{conv.customer_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.summary || "Inquiry answered automatically by AI"}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Conversations List (2 cols) */}
        <Card className="border-border/60 shadow-xs lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div>
              <CardTitle className="text-base font-bold">Recent Customer Conversations</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Click any conversation to inspect or take over</p>
            </div>
            <Link href="/dashboard/conversations">
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-medium">
                View All Conversations
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[360px]">
              <div className="space-y-2.5">
                {recentConvs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No active conversations found.
                  </p>
                )}
                {recentConvs.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/dashboard/conversations/${conv.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:bg-accent/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {conv.customer_name}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-2 py-0.5 font-medium", getStatusColor(conv.status))}
                          >
                            {conv.status}
                          </Badge>
                          {conv.controlled_by === "human" ? (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold">
                              👤 Human Agent Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/30 font-semibold">
                              🤖 AI Assistant Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.summary || "Active inquiry in progress..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-3">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {formatRelativeTime(conv.updated_at)}
                      </span>
                      {conv.lead_score > 0 && (
                        <div className="flex items-center gap-1 bg-accent/60 px-2 py-0.5 rounded-full border border-border/60">
                          <Flame className={cn("w-3 h-3", conv.lead_score >= 70 ? "text-red-500 fill-red-500/20" : "text-amber-500")} />
                          <span className={cn("text-[10px] font-bold", conv.lead_score >= 70 ? "text-red-500" : "text-foreground")}>
                            {conv.lead_score}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Conversion Rate</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {((stats?.conversion_rate ?? 0) * 100).toFixed(1)}%
              </p>
              <p className="text-[11px] text-emerald-500 font-medium mt-0.5">High conversion pipeline</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avg AI Response Speed</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {stats?.avg_response_time ? `${Math.round(stats.avg_response_time)}s` : "2.5s"}
              </p>
              <p className="text-[11px] text-blue-500 font-medium mt-0.5">Instant WhatsApp response</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">AI Automation Level</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">
                {stats?.total_conversations ? `${Math.round(((stats.total_conversations - (stats.pending_escalations ?? 0)) / stats.total_conversations) * 100)}%` : "90%"}
              </p>
              <p className="text-[11px] text-violet-500 font-medium mt-0.5">Handled autonomously</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
