"use client";

import Link from "next/link";
import {
  MessageSquare,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  Bot,
  Shield,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              BizWa <span className="text-primary">Agent</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/chat/demo">
              <Button variant="outline" size="sm" className="gap-2 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Try Assistant
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 font-medium shadow-sm">
                Owner Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-4">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold mb-8 shadow-sm">
            <Zap className="w-4 h-4" />
            <span>Autonomous AI Employee for WhatsApp Business</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            BizWa — Your AI Employee
            <br />
            <span className="gradient-text">for WhatsApp Business</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Automate FAQs, qualify high-intent leads in real-time with automated scoring, 
            remember conversation context, and intelligently escalate complex inquiries to human agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/chat/demo" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2.5 text-base px-8 h-12 shadow-md font-bold">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
                Try Customer Assistant
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2.5 text-base px-8 h-12 border-border/80 font-bold">
                <BarChart3 className="w-5 h-5" />
                Open Dashboard
              </Button>
            </Link>
          </div>

          {/* Active Account Indicator */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Active Business Account: <strong>GoaTrip Adventures</strong> (Goa Tours & Experiences)</span>
          </div>
        </div>
      </section>

      {/* Visual End-to-End Workflow Diagram */}
      <section className="py-16 px-4 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider text-primary border-primary/30 font-semibold">
              End-To-End Business Automation
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">How BizWa Drives Conversions</h2>
            <p className="text-muted-foreground text-sm mt-2">
              From first customer hello to closed deal
            </p>
          </div>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
            {[
              {
                step: "01",
                title: "Customer Message",
                desc: "Customer asks about services, pricing or bookings on WhatsApp",
                icon: MessageSquare,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                step: "02",
                title: "RAG & Knowledge",
                desc: "AI retrieves exact facts from business Knowledge Base",
                icon: Bot,
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
              {
                step: "03",
                title: "Intent Classification",
                desc: "Classifies intent: Booking, Pricing, FAQ, Inquiry",
                icon: Zap,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                step: "04",
                title: "Lead Scoring",
                desc: "Scores purchase intent from 0 to 100 in real-time",
                icon: Flame,
                color: "text-red-500",
                bg: "bg-red-500/10",
              },
              {
                step: "05",
                title: "Human Escalation",
                desc: "Alerts team on high intent or explicit takeover request",
                icon: AlertTriangle,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
              },
              {
                step: "06",
                title: "Human Conversion",
                desc: "Agent takes over, negotiates, and closes the deal",
                icon: CheckCircle2,
                color: "text-teal-500",
                bg: "bg-teal-500/10",
              },
            ].map((item) => (
              <Card key={item.step} className="border-border/60 bg-card relative group hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Step {item.step}
                  </span>
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h3 className="text-xs font-bold mb-1">{item.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Built for Commercial Scale & Revenue Growth
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combines cutting-edge AI intelligence, vector knowledge retrieval, and real-time dashboard monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "24/7 AI Customer Assistant",
                desc: "Answers complex inquiries using business Knowledge Base items without hallucinatory claims.",
              },
              {
                icon: Flame,
                title: "Automated Lead Scoring",
                desc: "Evaluates purchase signals, group sizes, specific dates, and budget details to flag 🔥 HOT Leads.",
              },
              {
                icon: Shield,
                title: "Intelligent Escalation & Takeover",
                desc: "Detects when customers ask for a human or reach high intent, instantly alerting the business team.",
              },
              {
                icon: Users,
                title: "Lead Pipeline Management",
                desc: "Organizes leads seamlessly across NEW → CONTACTED → CONVERTED → LOST stages.",
              },
              {
                icon: Headphones,
                title: "Owner Control Center",
                desc: "Live activity feeds, real-time message streaming, conversation filters, and seamless handback notes.",
              },
              {
                icon: TrendingUp,
                title: "Real-Time Business Analytics",
                desc: "Tracks conversion rates, average AI response times, intent distributions, and top customer inquiries.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-primary text-primary-foreground font-semibold">Production Ready</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Transform Your WhatsApp Customer Experience</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Interact with the WhatsApp Assistant, observe real-time intent scoring, and manage active customer conversations from the Control Center.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat/demo">
              <Button size="lg" className="gap-2 px-8 h-12 font-bold">
                <MessageSquare className="w-5 h-5" />
                Try Customer Assistant
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 font-bold">
                <BarChart3 className="w-5 h-5" />
                Open Owner Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 bg-card/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>BizWa Agent &mdash; WhatsApp Business AI Assistant</span>
          </div>
          <span>Enterprise SaaS Platform 2026</span>
        </div>
      </footer>
    </div>
  );
}
