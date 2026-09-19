import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) {
    return NextResponse.json({ error: "business_id required" }, { status: 400 });
  }

  // First fetch conversation IDs for this business to scope messages
  const { data: bizConvs } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .eq("business_id", businessId);

  const convIds = (bizConvs || []).map((c) => c.id);

  const [convResult, leadsResult, escalationsResult, messagesResult] =
    await Promise.all([
      supabaseAdmin
        .from("conversations")
        .select("id, intent, status, created_at")
        .eq("business_id", businessId),
      supabaseAdmin
        .from("leads")
        .select("id, score, created_at")
        .eq("business_id", businessId),
      supabaseAdmin
        .from("escalations")
        .select("id")
        .eq("business_id", businessId),
      // Only fetch messages belonging to this business's conversations
      convIds.length > 0
        ? supabaseAdmin
            .from("messages")
            .select("role, content, created_at, conversation_id")
            .eq("role", "customer")
            .in("conversation_id", convIds)
            .order("created_at", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const conversations = convResult.data || [];
  const leads = leadsResult.data || [];
  const escalations = escalationsResult.data || [];
  const customerMessages = messagesResult.data || [];

  // Escalation rate
  const escalationRate =
    conversations.length > 0
      ? escalations.length / conversations.length
      : 0;

  // Intent distribution
  const intentCounts: Record<string, number> = {};
  conversations.forEach((c) => {
    if (c.intent) {
      intentCounts[c.intent] = (intentCounts[c.intent] || 0) + 1;
    }
  });
  const intentDistribution = Object.entries(intentCounts).map(
    ([intent, count]) => ({ intent, count })
  );

  // Lead score distribution
  const scoreRanges = [
    { range: "0-39 (Low)", min: 0, max: 39 },
    { range: "40-69 (Medium)", min: 40, max: 69 },
    { range: "70-100 (High)", min: 70, max: 100 },
  ];
  const leadScoreDistribution = scoreRanges.map((r) => ({
    range: r.range,
    count: leads.filter((l) => l.score >= r.min && l.score <= r.max).length,
  }));

  // Top questions (basic — first 50 chars of customer messages)
  const questionCounts: Record<string, number> = {};
  customerMessages.forEach((m) => {
    const q = m.content.substring(0, 60).trim();
    if (q.length > 10) {
      questionCounts[q] = (questionCounts[q] || 0) + 1;
    }
  });
  const topQuestions = Object.entries(questionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([question, count]) => ({ question, count }));

  return NextResponse.json({
    conversation_count: [],
    leads_generated: [],
    top_questions: topQuestions,
    avg_response_time: 2.5,
    escalation_rate: escalationRate,
    lead_score_distribution: leadScoreDistribution,
    intent_distribution: intentDistribution,
  });
}
