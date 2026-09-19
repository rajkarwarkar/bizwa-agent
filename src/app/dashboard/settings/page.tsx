"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DEMO_BUSINESS_ID } from "@/lib/utils";
import { toast } from "sonner";
import type { Business } from "@/lib/types";

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch(`/api/settings?business_id=${DEMO_BUSINESS_ID}`);
      if (res.ok) {
        setBusiness(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!business) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business),
      });
      if (res.ok) {
        toast.success("Settings saved successfully");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-32 mb-3" />
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your AI assistant&apos;s behavior and business information.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Business Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Name</label>
            <Input
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={business.description}
              onChange={(e) =>
                setBusiness({ ...business, description: e.target.value })
              }
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">AI Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Greeting</label>
            <Textarea
              value={business.greeting}
              onChange={(e) =>
                setBusiness({ ...business, greeting: e.target.value })
              }
              rows={3}
              placeholder="The first message customers see..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Tone / Persona</label>
            <Select
              value={business.tone}
              onValueChange={(val) => { if (val) setBusiness({ ...business, tone: val }); }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly & Casual</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic & Energetic</SelectItem>
                <SelectItem value="concise">Concise & Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Working Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="time"
                value={business.working_hours.start}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    working_hours: {
                      ...business.working_hours,
                      start: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="time"
                value={business.working_hours.end}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    working_hours: {
                      ...business.working_hours,
                      end: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Rules */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Escalation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              High Intent Threshold (0-100)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={business.escalation_rules.high_intent_threshold}
              onChange={(e) =>
                setBusiness({
                  ...business,
                  escalation_rules: {
                    ...business.escalation_rules,
                    high_intent_threshold: parseInt(e.target.value) || 70,
                  },
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Conversations with lead scores above this threshold will trigger
              automatic escalation.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Auto-Escalate Keywords
            </label>
            <Input
              value={business.escalation_rules.auto_escalate_keywords.join(", ")}
              onChange={(e) =>
                setBusiness({
                  ...business,
                  escalation_rules: {
                    ...business.escalation_rules,
                    auto_escalate_keywords: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              placeholder="speak to human, manager, complaint"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated keywords that trigger automatic escalation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seed Data */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Demo Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Reset and re-seed the demo data for GoaTrip Adventures. This will
            delete all existing data and create fresh sample conversations,
            leads, and knowledge items.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const res = await fetch("/api/seed", { method: "POST" });
                if (res.ok) {
                  toast.success("Demo data seeded successfully!");
                  fetchSettings();
                } else {
                  toast.error("Failed to seed demo data");
                }
              } catch {
                toast.error("Failed to seed demo data");
              }
            }}
          >
            Re-seed Demo Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
