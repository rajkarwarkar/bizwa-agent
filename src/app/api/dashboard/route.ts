import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) {
    return NextResponse.json({ error: "business_id required" }, { status: 400 });
  }

  const [convResult, leadsResult, escalationsResult, recentConvResult] =
    await Promise.all([
      supabaseAdmin
        .from("conversations")
        .select("id, status, lead_status")
        .eq("business_id", businessId),
      supabaseAdmin
        .from("leads")
        .select("id, score, status")
        .eq("business_id", businessId),
      supabaseAdmin
        .from("escalations")
        .select("id, status")
        .eq("business_id", businessId),
      supabaseAdmin
        .from("conversations")
        .select("*")
        .eq("business_id", businessId)
        .order("updated_at", { ascending: false })
        .limit(10),
    ]);

  const conversations = convResult.data || [];
  const leads = leadsResult.data || [];
  const escalations = escalationsResult.data || [];

  const activeConversations = conversations.filter(
    (c) => c.status === "active" || c.status === "escalated"
  ).length;

  const newLeads = leads.filter((l) => l.status === "new").length;
  const highIntentLeads = leads.filter((l) => l.score >= 70).length;
  const pendingEscalations = escalations.filter(
    (e) => e.status === "pending"
  ).length;

  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const conversionRate = leads.length > 0 ? convertedLeads / leads.length : 0;

  return NextResponse.json({
    active_conversations: activeConversations,
    total_conversations: conversations.length,
    new_leads: newLeads,
    high_intent_leads: highIntentLeads,
    pending_escalations: pendingEscalations,
    conversion_rate: conversionRate,
    avg_response_time: 2.5, // Simulated for demo
    recent_conversations: recentConvResult.data || [],
  });
}
