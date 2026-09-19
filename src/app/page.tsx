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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold">
              BizWa <span className="text-primary">Agent</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/chat/demo">
              <Button variant="ghost" size="sm">
                Try Demo Chat
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5">
                Owner Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Business Assistant
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your AI Business Employee
            <br />
            <span className="gradient-text">for Customer Conversations</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            BizWa Agent handles customer inquiries, qualifies leads, books
            appointments, and intelligently escalates to you — all through a
            beautiful chat interface. Like having a 24/7 employee who never
            sleeps.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat/demo">
              <Button size="lg" className="gap-2 text-base px-8">
                <MessageSquare className="w-4 h-4" />
                Try Customer Chat
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8"
              >
                <BarChart3 className="w-4 h-4" />
                View Owner Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/30 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Everything You Need to Automate Customer Conversations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bot,
                title: "AI Chat Assistant",
                desc: "Answers FAQs, handles inquiries, and qualifies leads using your business knowledge.",
              },
              {
                icon: Users,
                title: "Lead Detection",
                desc: "Automatically scores and identifies high-intent leads with transparent scoring.",
              },
              {
                icon: Shield,
                title: "Human Takeover",
                desc: "Seamlessly take over any conversation and hand back to AI when done.",
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                desc: "Never miss a customer inquiry. AI responds instantly, any time of day.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-muted-foreground mb-8">
            This demo is pre-loaded with <strong>GoaTrip Adventures</strong> — a
            Goa tour company. Try the customer chat to see AI responses, lead
            detection, and the full owner dashboard experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat/demo">
              <Button size="lg" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Start Demo Chat
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>BizWa Agent</span>
          </div>
          <span>Built for Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
