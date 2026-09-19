"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  User,
  UserCheck,
  Send,
  Flame,
  AlertTriangle,
  Undo2,
  Phone,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  cn,
  formatTime,
  formatRelativeTime,
  getStatusColor,
  getLeadScoreLabel,
  getLeadScoreColor,
} from "@/lib/utils";
import { toast } from "sonner";
import type { Conversation, Message, Lead } from "@/lib/types";

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [humanMessage, setHumanMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [handbackOpen, setHandbackOpen] = useState(false);
  const [handbackNote, setHandbackNote] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversationDetail();
    const interval = setInterval(fetchConversationDetail, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversationDetail() {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages);
        setLead(data.lead);
      }
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTakeover() {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/takeover`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("You have taken over this conversation");
        fetchConversationDetail();
      }
    } catch {
      toast.error("Failed to take over conversation");
    }
  }

  async function handleHandback() {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/handback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: handbackNote }),
      });
      if (res.ok) {
        toast.success("Control returned to AI");
        setHandbackOpen(false);
        setHandbackNote("");
        fetchConversationDetail();
      }
    } catch {
      toast.error("Failed to hand back to AI");
    }
  }

  async function handleSendHumanMessage() {
    if (!humanMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: humanMessage, role: "human" }),
        }
      );
      if (res.ok) {
        setHumanMessage("");
        fetchConversationDetail();
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Conversation not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Message Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border/50 p-4 flex items-center gap-3 bg-card/30">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/dashboard/conversations")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{conversation.customer_name}</span>
              <Badge
                variant="outline"
                className={cn("text-[10px] px-1.5 py-0", getStatusColor(conversation.status))}
              >
                {conversation.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{conversation.customer_phone}</p>
          </div>
          <div className="flex items-center gap-2">
            {conversation.controlled_by === "ai" ? (
              <Button size="sm" variant="outline" onClick={handleTakeover} className="gap-1.5 text-xs">
                <UserCheck className="w-3.5 h-3.5" />
                Take Over
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setHandbackOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Hand Back to AI
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-2xl mx-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "message-animate flex",
                  msg.role === "customer" ? "justify-start" : "justify-end"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "customer"
                      ? "bg-accent text-foreground rounded-bl-md"
                      : msg.role === "ai"
                      ? "bg-primary/15 text-foreground rounded-br-md"
                      : "bg-amber-500/15 text-foreground rounded-br-md border border-amber-500/20"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.role === "ai" && <Bot className="w-3 h-3 text-primary" />}
                    {msg.role === "human" && <UserCheck className="w-3 h-3 text-amber-500" />}
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">
                      {msg.role === "customer"
                        ? conversation.customer_name
                        : msg.role === "ai"
                        ? "AI Assistant"
                        : "You (Human)"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Human Message Input (only when human is in control) */}
        {conversation.controlled_by === "human" && (
          <div className="border-t border-border/50 p-4 bg-card/30">
            <div className="max-w-2xl mx-auto flex gap-2">
              <Input
                value={humanMessage}
                onChange={(e) => setHumanMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendHumanMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendHumanMessage}
                disabled={!humanMessage.trim() || sending}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {conversation.controlled_by === "ai" && (
          <div className="border-t border-border/50 p-3 bg-card/30">
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-primary" />
              AI is handling this conversation. Click &quot;Take Over&quot; to respond manually.
            </p>
          </div>
        )}
      </div>

      {/* Sidebar — Lead Info */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/50 bg-card/20">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Control Status */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {conversation.controlled_by === "ai" ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium">
                    {conversation.controlled_by === "ai"
                      ? "AI Controlled"
                      : "Human Controlled"}
                  </span>
                </div>
                {conversation.handback_note && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: {conversation.handback_note}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Lead Score */}
            {conversation.lead_score > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    {conversation.lead_score >= 70 && (
                      <Flame className="w-4 h-4 text-red-500" />
                    )}
                    Lead Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn("text-3xl font-bold", getLeadScoreColor(conversation.lead_score))}>
                      {conversation.lead_score}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        conversation.lead_score >= 70
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : conversation.lead_score >= 40
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}
                    >
                      {getLeadScoreLabel(conversation.lead_score)} Intent
                    </Badge>
                  </div>

                  {/* Score Breakdown */}
                  {lead?.details?.score_breakdown && (
                    <div className="space-y-1.5 mt-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Score Breakdown
                      </p>
                      {Object.entries(lead.details.score_breakdown)
                        .filter(([key]) => key !== "total")
                        .map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className={cn("font-medium", (val as number) > 0 ? "text-emerald-400" : "text-muted-foreground/40")}>
                              +{val as number}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lead Details */}
            {lead && (
              <Card className="border-border/50">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-sm">Lead Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {lead.details.group_size && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Group Size</span>
                      <span>{lead.details.group_size} people</span>
                    </div>
                  )}
                  {lead.details.requested_date && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Requested Date</span>
                      <span>{lead.details.requested_date}</span>
                    </div>
                  )}
                  {lead.details.budget && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Budget</span>
                      <span>{lead.details.budget}</span>
                    </div>
                  )}
                  {lead.details.package_interest && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Package</span>
                      <span>{lead.details.package_interest}</span>
                    </div>
                  )}
                  {lead.intent && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Intent</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {lead.intent}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            {conversation.summary && (
              <Card className="border-border/50">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-sm">AI Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {conversation.summary}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Handback Dialog */}
      <Dialog open={handbackOpen} onOpenChange={setHandbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hand Back to AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Return control of this conversation to the AI assistant. You can
              optionally leave a note for context.
            </p>
            <Textarea
              placeholder="Optional note for the AI (e.g., 'Customer agreed to 10% discount, confirm booking')"
              value={handbackNote}
              onChange={(e) => setHandbackNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandbackOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleHandback}>Hand Back</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
