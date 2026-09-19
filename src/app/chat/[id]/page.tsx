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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    // Fetch greeting
    fetch(`/api/settings?business_id=${DEMO_BUSINESS_ID}`)
      .then((r) => r.json())
      .then((biz) => setGreeting(biz.greeting || "Hello! How can I help you today?"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (conversation?.id) {
      const interval = setInterval(fetchMessages, 2000);
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

  async function handleSend() {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
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
          customer_phone: "+91 99999 00000",
          message: msg,
          business_id: DEMO_BUSINESS_ID,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Set conversation ID if new
        if (!conversation) {
          setConversation({ id: data.conversation_id } as Conversation);
        }

        // Replace temp message + add AI response
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempMsg.id);
          return [
            ...withoutTemp,
            {
              id: `cust-${Date.now()}`,
              conversation_id: data.conversation_id,
              role: "customer" as const,
              content: msg,
              metadata: null,
              created_at: new Date().toISOString(),
            },
            data.ai_message,
          ];
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  // Pre-chat screen
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="border-b border-border/50 backdrop-blur-md bg-background/80 h-14 flex items-center px-4 gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold">GoaTrip Adventures</span>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome to GoaTrip Adventures
              </h1>
              <p className="text-sm text-muted-foreground">
                Chat with our AI assistant to learn about tours, get pricing,
                and book your perfect Goa adventure!
              </p>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Your name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-center"
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
              <Button onClick={handleStart} className="w-full gap-2" size="lg">
                <MessageSquare className="w-4 h-4" />
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
      <div className="border-b border-border/50 backdrop-blur-md bg-background/80 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto h-14 flex items-center px-4 gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">GoaTrip Adventures</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {conversation?.controlled_by === "human" ? "Team member is here" : "AI Assistant Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-3">
          {/* Greeting Message */}
          <div className="message-animate flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-primary/15 px-4 py-2.5 text-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <Bot className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  AI ASSISTANT
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{greeting}</p>
            </div>
          </div>

          {/* Conversation Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "message-animate flex",
                msg.role === "customer" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "customer"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : msg.role === "ai"
                    ? "bg-primary/15 text-foreground rounded-bl-md"
                    : "bg-amber-500/15 text-foreground rounded-bl-md border border-amber-500/20"
                )}
              >
                {msg.role !== "customer" && (
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.role === "ai" ? (
                      <Bot className="w-3 h-3 text-primary" />
                    ) : (
                      <UserCheck className="w-3 h-3 text-amber-500" />
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">
                      {msg.role === "ai" ? "AI Assistant" : "Team Member"}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1 text-right",
                    msg.role === "customer"
                      ? "text-primary-foreground/60"
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
            <div className="message-animate flex justify-start">
              <div className="bg-primary/15 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-md sticky bottom-0">
        <div className="max-w-2xl mx-auto p-4 flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
