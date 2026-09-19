"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Send,
  Bot,
  User,
  UserCheck,
  ArrowLeft,
  Zap,
  MessageSquare,
  Sparkles,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatTime, DEMO_BUSINESS_ID } from "@/lib/utils";
import type { Message, Conversation } from "@/lib/types";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch business greeting
    fetch(`/api/settings?business_id=${DEMO_BUSINESS_ID}`)
      .then((r) => r.json())
      .then((biz) => setGreeting(biz.greeting || "Hello! Welcome to GoaTrip Adventures. How can I help you today?"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (conversation?.id) {
      const interval = setInterval(fetchMessages, 2500);
      return () => clearInterval(interval);
    }
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    if (!conversation?.id) return;
    try {
      const res = await fetch(`/api/conversations/${conversation.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setConversation(data.conversation);
      }
    } catch {}
  }

  async function handleStart() {
    const name = customerName.trim() || "Customer";
    setCustomerName(name);
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function handleSend(textToSend?: string) {
    const msg = (textToSend || input).trim();
    if (!msg || sending) return;
    if (!textToSend) setInput("");
    setSending(true);

    // Optimistically add customer message
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation?.id || "",
      role: "customer",
      content: msg,
      metadata: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversation?.id || undefined,
          customer_name: customerName || "Customer",
          customer_phone: "+91 98765 43210",
          message: msg,
          business_id: DEMO_BUSINESS_ID,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Save new conversation object
        if (!conversation || conversation.id !== data.conversation_id) {
          setConversation({
            id: data.conversation_id,
            business_id: DEMO_BUSINESS_ID,
            customer_name: customerName || "Customer",
            status: "active",
            controlled_by: "ai",
            lead_score: data.lead_score || 0,
            intent: data.intent || "general",
          } as Conversation);
        }

        // Replace temp message + append AI response (only if present)
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempMsg.id);
          const newMessages = [
            ...withoutTemp,
            {
              id: `cust-${Date.now()}`,
              conversation_id: data.conversation_id,
              role: "customer" as const,
              content: msg,
              metadata: null,
              created_at: new Date().toISOString(),
            },
          ];
          if (data.ai_message) {
            newMessages.push(data.ai_message);
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  // Pre-chat Welcome Screen
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="border-b border-border/50 backdrop-blur-md bg-background/80 h-14 flex items-center justify-between px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs font-medium">
              <ArrowLeft className="w-4 h-4" /> Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold">GoaTrip Adventures Assistant</span>
          </div>
          <Link href="/dashboard" target="_blank">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5" /> Dashboard &rarr;
            </Button>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-sm">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <Badge className="mb-2 bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-medium">
                Official Business Assistant
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight">
                GoaTrip Customer Assistant
              </h1>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Chat with our AI assistant to explore tour packages, check pricing, book excursions, or speak with an agent.
              </p>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Enter your name (e.g. Rahul)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-center font-medium"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
              <Button onClick={handleStart} className="w-full gap-2 h-11 font-bold shadow-sm" size="lg">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b border-border/50 backdrop-blur-md bg-background/95 sticky top-0 z-10 shadow-xs">
        <div className="max-w-3xl mx-auto h-16 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold leading-none">GoaTrip Adventures</p>
                {conversation?.controlled_by === "human" ? (
                  <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold">
                    👤 Human Agent Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-semibold">
                    🤖 AI Assistant Active
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                WhatsApp Business Assistant &bull; Panaji, Goa
              </p>
            </div>
          </div>

          <Link href="/dashboard" target="_blank">
            <Button variant="outline" size="sm" className="gap-1 text-xs font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />
              Owner Dashboard &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          
          {/* Quick Prompts Bar */}
          <Card className="border-border/60 bg-card/80 backdrop-blur-xs mb-4 shadow-xs">
            <CardContent className="p-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "🏖️ Tour Packages",
                    prompt: "What tour packages do you offer and what are the prices?",
                  },
                  {
                    label: "🔥 Group Booking",
                    prompt: "I want to book a tour for 5 people tomorrow. Is there a group discount?",
                  },
                  {
                    label: "👤 Human Agent",
                    prompt: "Can I speak with a human agent for custom pricing?",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSend(item.prompt)}
                    disabled={sending}
                    className="text-xs font-medium bg-background border border-border/70 hover:border-primary/50 hover:bg-primary/5 px-3 py-1.5 rounded-lg text-left transition-colors shadow-2xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Greeting Message */}
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-bl-xs bg-card border border-border/60 px-4 py-3 shadow-xs text-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
                  AI ASSISTANT &bull; GOATRIP
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{greeting}</p>
            </div>
          </div>

          {/* Message History */}
          {messages.map((msg, idx) => (
            <div
              key={msg.id ? `${msg.id}-${idx}` : idx}
              className={cn(
                "flex",
                msg.role === "customer" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-xs",
                  msg.role === "customer"
                    ? "bg-primary text-primary-foreground rounded-br-xs font-medium"
                    : msg.role === "ai"
                    ? "bg-card border border-border/60 text-foreground rounded-bl-xs"
                    : "bg-amber-500/10 text-foreground rounded-bl-xs border border-amber-500/30"
                )}
              >
                {msg.role !== "customer" && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-border/40 pb-1">
                    <div className="flex items-center gap-1.5">
                      {msg.role === "ai" ? (
                        <Bot className="w-4 h-4 text-primary" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        {msg.role === "ai" ? "AI Assistant" : "Human Representative"}
                      </span>
                    </div>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1.5 text-right font-medium",
                    msg.role === "customer"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground/60"
                  )}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border/60 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary animate-bounce" />
                  <span className="text-xs text-muted-foreground font-medium">AI is typing a response...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-border/50 bg-background/95 sticky bottom-0 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
            className="flex-1 h-11 text-sm bg-card border-border/70"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            size="icon"
            className="h-11 w-11 shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
