"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Flame, ArrowRight, Phone, User, CheckCircle2, AlertCircle, Eye, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cn,
  formatRelativeTime,
  getStatusColor,
  getLeadScoreColor,
  DEMO_BUSINESS_ID,
} from "@/lib/utils";
import { toast } from "sonner";
import type { Lead } from "@/lib/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  async function fetchLeads() {
    try {
      const params = new URLSearchParams({ business_id: DEMO_BUSINESS_ID });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/leads?${params}`);
      if (res.ok) {
        setLeads(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/leads`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Lead status updated to ${newStatus.toUpperCase()}`);
        fetchLeads();
      }
    } catch {
      toast.error("Failed to update lead status");
    }
  }

  const pipelineCounts = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
    lost: leads.filter((l) => l.status === "lost").length,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Lead Intelligence & Pipeline</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20">AI Scored</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Automated intent detection, purchase score calculation (0-100), and stage management.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Stage Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New Leads", count: pipelineCounts.new, status: "new", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Contacted", count: pipelineCounts.contacted, status: "contacted", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Converted", count: pipelineCounts.converted, status: "converted", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Lost", count: pipelineCounts.lost, status: "lost", color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
        ].map((item) => (
          <Card
            key={item.status}
            className={cn(
              "border cursor-pointer transition-all duration-200 hover:scale-[1.01]",
              item.border,
              statusFilter === item.status ? "ring-2 ring-primary shadow-sm bg-card" : "bg-card/60 hover:bg-card"
            )}
            onClick={() => setStatusFilter(statusFilter === item.status ? "all" : item.status)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-extrabold mt-1">{item.count}</p>
              </div>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", item.bg, item.color)}>
                {item.status === "converted" ? "✓" : item.status === "new" ? "NEW" : item.status === "contacted" ? "💬" : "✕"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads List with Deep Intelligence Cards */}
      <div className="space-y-4">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5">
                  <div className="h-4 bg-muted rounded w-32 mb-2" />
                  <div className="h-3 bg-muted rounded w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && leads.length === 0 && (
          <Card className="border-border/60">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold">No leads found in this stage</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Interact with the AI Assistant in Demo Chat to automatically generate scored leads.
              </p>
            </CardContent>
          </Card>
        )}

        {leads.map((lead) => {
          const isHot = lead.score >= 70;
          const isWarm = lead.score >= 40 && lead.score < 70;
          const scoreTier = isHot ? "HOT" : isWarm ? "WARM" : "COLD";
          const scoreBadgeBg = isHot ? "bg-red-500/10 text-red-500 border-red-500/30" : isWarm ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-blue-500/10 text-blue-500 border-blue-500/30";

          return (
            <Card
              key={lead.id}
              className={cn(
                "border-border/60 bg-card hover:border-primary/40 transition-all duration-200 shadow-xs",
                isHot && "border-l-4 border-l-red-500"
              )}
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Customer & Intelligence Summary */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-base text-foreground">{lead.customer_name}</h3>
                        
                        {/* Score Badge Tier */}
                        <Badge variant="outline" className={cn("text-xs font-extrabold px-2.5 py-0.5", scoreBadgeBg)}>
                          {isHot && <Flame className="w-3.5 h-3.5 mr-1 text-red-500 fill-red-500/20" />}
                          {scoreTier} ({lead.score}/100)
                        </Badge>

                        {/* Pipeline Status */}
                        <Badge variant="outline" className={cn("text-xs px-2 py-0.5 font-semibold", getStatusColor(lead.status))}>
                          {lead.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* AI Summary */}
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {lead.details?.summary || lead.intent || "Qualified lead from customer chat interaction."}
                      </p>

                      {/* Structured Extracted Parameters Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        {lead.details?.group_size && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-accent/60 border border-border/60 px-2.5 py-1 rounded-md">
                            👥 <strong>Group:</strong> {lead.details.group_size} people
                          </span>
                        )}
                        {lead.details?.requested_date && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-accent/60 border border-border/60 px-2.5 py-1 rounded-md">
                            📅 <strong>Date:</strong> {lead.details.requested_date}
                          </span>
                        )}
                        {lead.details?.budget && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-accent/60 border border-border/60 px-2.5 py-1 rounded-md">
                            💰 <strong>Budget:</strong> {lead.details.budget}
                          </span>
                        )}
                        {lead.details?.package_interest && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-accent/60 border border-border/60 px-2.5 py-1 rounded-md">
                            📦 <strong>Package:</strong> {lead.details.package_interest}
                          </span>
                        )}
                      </div>

                      {/* Score Breakdown Factors if present */}
                      {lead.details?.score_breakdown && (
                        <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border/40 text-[11px]">
                          <span className="font-semibold text-muted-foreground block mb-1">AI Lead Score Breakdown Factors:</span>
                          <div className="flex flex-wrap gap-2 text-muted-foreground">
                            {Object.entries(lead.details.score_breakdown)
                              .filter(([key]) => key !== "total")
                              .map(([factor, pts]) => (
                                <span key={factor} className="bg-card px-2 py-0.5 rounded border border-border/40 font-mono">
                                  {factor.replace(/_/g, " ")}: +{pts}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Score Dial & Controls */}
                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-border/50 gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                        Lead Score
                      </span>
                      <span className={cn("text-3xl font-black tracking-tight", getLeadScoreColor(lead.score))}>
                        {lead.score}<span className="text-sm text-muted-foreground font-normal">/100</span>
                      </span>
                    </div>

                    {/* Stage Selector */}
                    <div className="flex items-center gap-2">
                      <Select
                        value={lead.status}
                        onValueChange={(val) => { if (val) updateLeadStatus(lead.id, val); }}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">NEW</SelectItem>
                          <SelectItem value="contacted">CONTACTED</SelectItem>
                          <SelectItem value="converted">CONVERTED</SelectItem>
                          <SelectItem value="lost">LOST</SelectItem>
                        </SelectContent>
                      </Select>

                      <Link href={`/dashboard/conversations/${lead.conversation_id}`}>
                        <Button size="sm" variant="default" className="h-8 gap-1.5 text-xs font-semibold">
                          <Eye className="w-3.5 h-3.5" />
                          View Chat & Take Over
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
