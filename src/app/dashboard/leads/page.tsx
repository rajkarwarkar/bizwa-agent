"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Flame, ArrowRight, Phone, User } from "lucide-react";
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
  getLeadScoreLabel,
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
        toast.success(`Lead status updated to ${newStatus}`);
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage your lead pipeline.
        </p>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New", count: pipelineCounts.new, status: "new" },
          { label: "Contacted", count: pipelineCounts.contacted, status: "contacted" },
          { label: "Converted", count: pipelineCounts.converted, status: "converted" },
          { label: "Lost", count: pipelineCounts.lost, status: "lost" },
        ].map((item) => (
          <Card
            key={item.status}
            className={cn(
              "border-border/50 cursor-pointer hover:bg-accent/30 transition-colors",
              statusFilter === item.status && "ring-1 ring-primary"
            )}
            onClick={() => setStatusFilter(statusFilter === item.status ? "all" : item.status)}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{item.count}</p>
              <Badge
                variant="outline"
                className={cn("text-[10px] mt-1", getStatusColor(item.status))}
              >
                {item.label}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-32 mb-2" />
                  <div className="h-3 bg-muted rounded w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && leads.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No leads found.</p>
            </CardContent>
          </Card>
        )}

        {leads.map((lead) => (
          <Card key={lead.id} className="border-border/50 hover:bg-accent/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{lead.customer_name}</span>
                    {lead.score >= 70 && (
                      <div className="flex items-center gap-1 pulse-glow rounded-full px-2 py-0.5 bg-red-500/10">
                        <Flame className="w-3 h-3 text-red-500" />
                        <span className="text-[10px] text-red-500 font-bold">
                          HIGH INTENT
                        </span>
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", getStatusColor(lead.status))}
                    >
                      {lead.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {lead.details?.summary || lead.intent || "No details"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {lead.details?.group_size && (
                      <span className="bg-accent px-2 py-0.5 rounded">
                        👥 {lead.details.group_size} people
                      </span>
                    )}
                    {lead.details?.requested_date && (
                      <span className="bg-accent px-2 py-0.5 rounded">
                        📅 {lead.details.requested_date}
                      </span>
                    )}
                    {lead.details?.budget && (
                      <span className="bg-accent px-2 py-0.5 rounded">
                        💰 {lead.details.budget}
                      </span>
                    )}
                    {lead.details?.package_interest && (
                      <span className="bg-accent px-2 py-0.5 rounded">
                        📦 {lead.details.package_interest}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={cn("text-2xl font-bold", getLeadScoreColor(lead.score))}>
                    {lead.score}
                  </span>
                  <Select
                    value={lead.status}
                    onValueChange={(val) => { if (val) updateLeadStatus(lead.id, val); }}
                  >
                    <SelectTrigger className="w-[120px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Link href={`/dashboard/conversations/${lead.conversation_id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 text-[10px] h-6">
                      View Chat
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
