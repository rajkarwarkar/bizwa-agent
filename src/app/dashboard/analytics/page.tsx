"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  MessageSquare,
  Users,
  Clock,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_BUSINESS_ID } from "@/lib/utils";
import type { AnalyticsData } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "oklch(0.65 0.2 160)",
  "oklch(0.7 0.15 200)",
  "oklch(0.65 0.18 280)",
  "oklch(0.75 0.18 70)",
  "oklch(0.62 0.22 25)",
  "oklch(0.6 0.15 320)",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await fetch(`/api/analytics?business_id=${DEMO_BUSINESS_ID}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Insights into your customer conversations and lead generation.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Avg Response Time
              </span>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">
              {data?.avg_response_time ? `${Math.round(data.avg_response_time)}s` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Escalation Rate
              </span>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">
              {data?.escalation_rate != null
                ? `${(data.escalation_rate * 100).toFixed(1)}%`
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Leads
              </span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">
              {data?.leads_generated?.reduce((s, d) => s + d.count, 0) ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Intent Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {data?.intent_distribution && data.intent_distribution.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.intent_distribution}
                      dataKey="count"
                      nameKey="intent"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={((props: any) => `${props.intent} (${props.count})`) as any}
                      labelLine={false}
                    >
                      {data.intent_distribution.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.17 0.005 270)",
                        border: "1px solid oklch(0.26 0.008 270)",
                        borderRadius: "8px",
                        color: "oklch(0.96 0 0)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Score Distribution */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lead Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {data?.lead_score_distribution &&
            data.lead_score_distribution.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.lead_score_distribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.26 0.008 270)"
                    />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: "oklch(0.65 0.01 270)", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.65 0.01 270)", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.17 0.005 270)",
                        border: "1px solid oklch(0.26 0.008 270)",
                        borderRadius: "8px",
                        color: "oklch(0.96 0 0)",
                      }}
                    />
                    <Bar dataKey="count" fill="oklch(0.65 0.2 160)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Questions */}
        <Card className="border-border/50 col-span-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Top Customer Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {data?.top_questions && data.top_questions.length > 0 ? (
              <div className="space-y-2">
                {data.top_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      &quot;{q.question}&quot;
                    </span>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-3">
                      {q.count}×
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-6">
                No question data yet. Start chatting to see insights.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
