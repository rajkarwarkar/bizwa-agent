"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, MessageSquare, User, Flame, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DEMO_BUSINESS_ID,
} from "@/lib/utils";
import type { Conversation } from "@/lib/types";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  async function fetchConversations() {
    try {
      const params = new URLSearchParams({ business_id: DEMO_BUSINESS_ID });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/conversations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = conversations.filter((c) =>
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.summary || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-sm text-muted-foreground">
          All customer conversations managed by AI and your team.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conversation List */}
      <div className="space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-32 mb-2" />
                  <div className="h-3 bg-muted rounded w-64" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No conversations found.</p>
              <Link href="/chat/demo" className="mt-3 inline-block">
                <Button size="sm" className="mt-3">Start a Demo Chat</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {filtered.map((conv) => (
          <Link
            key={conv.id}
            href={`/dashboard/conversations/${conv.id}`}
            className="block"
          >
            <Card className="border-border/50 hover:bg-accent/30 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">
                      {conv.customer_name}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", getStatusColor(conv.status))}
                    >
                      {conv.status}
                    </Badge>
                    {conv.controlled_by === "human" && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-500 border-amber-500/20">
                        Human Control
                      </Badge>
                    )}
                    {conv.controlled_by === "ai" && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <Bot className="w-2.5 h-2.5 mr-0.5" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.summary || "No summary yet"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(conv.updated_at)}
                  </span>
                  {conv.lead_score >= 70 && (
                    <div className="flex items-center gap-1 pulse-glow rounded-full px-1.5 py-0.5 bg-red-500/10">
                      <Flame className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] text-red-500 font-bold">
                        {conv.lead_score}
                      </span>
                    </div>
                  )}
                  {conv.lead_score >= 40 && conv.lead_score < 70 && (
                    <span className="text-[10px] text-amber-500 font-medium">
                      Score: {conv.lead_score}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
