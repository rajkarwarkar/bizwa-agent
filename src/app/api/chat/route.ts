import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateAIResponse } from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/ai/chat";
import { retrieveKnowledge } from "@/lib/ai/knowledge-retrieval";
import { classifyIntent, getLeadScoreLevel } from "@/lib/ai/intent";
import type { ChatRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, business_id, customer_name, customer_phone } = body;
    let { conversation_id } = body;

    if (!message || !business_id) {
      return NextResponse.json(
        { error: "message and business_id are required" },
        { status: 400 }
      );
    }

    // Fetch business
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .eq("id", business_id)
      .single();

    if (bizError || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Create or fetch conversation
    if (!conversation_id) {
      const { data: newConv, error: convError } = await supabaseAdmin
        .from("conversations")
        .insert({
          business_id,
          customer_name: customer_name || "Customer",
          customer_phone: customer_phone || "",
          status: "active",
          controlled_by: "ai",
        })
        .select()
        .single();

      if (convError || !newConv) {
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
      }
      conversation_id = newConv.id;
    }

    // Check if AI is in control
    const { data: conv } = await supabaseAdmin
      .from("conversations")
      .select("controlled_by, handback_note")
      .eq("id", conversation_id)
      .single();

    // Save customer message
    await supabaseAdmin.from("messages").insert({
      conversation_id,
      role: "customer",
      content: message,
    });

    // If human is in control, don't generate AI response
    if (conv?.controlled_by === "human") {
      return NextResponse.json({
        conversation_id,
        ai_message: null,
        human_controlled: true,
      });
    }

    // Fetch conversation history (last 20 messages)
    const { data: historyMessages } = await supabaseAdmin
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const history = (historyMessages || []).slice(0, -1); // exclude the message we just inserted

    // Retrieve knowledge
    const knowledgeItems = await retrieveKnowledge(business_id, message);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(business, knowledgeItems, conv?.handback_note);

    // Generate AI response
    const aiText = await generateAIResponse(
      systemPrompt,
      history.map((m) => ({ role: m.role, content: m.content })),
      message
    );

    // Classify intent and score lead
    const customerMessages = (historyMessages || [])
      .filter((m) => m.role === "customer")
      .map((m) => m.content);
    const intentResult = classifyIntent(message, customerMessages);

    // Save AI message
    const { data: aiMessage, error: aiMsgError } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id,
        role: "ai",
        content: aiText,
        metadata: {
          intent: intentResult.intent,
          lead_score: intentResult.leadScore,
          score_breakdown: intentResult.scoreBreakdown,
        },
      })
      .select()
      .single();

    // Update conversation with latest intent/score
    const updateData: Record<string, unknown> = {
      intent: intentResult.intent,
      lead_score: Math.max(intentResult.leadScore, 0),
      updated_at: new Date().toISOString(),
    };

    // Set lead_status if score is meaningful
    if (intentResult.leadScore >= 40) {
      updateData.lead_status = "new";
    }

    // Generate summary for high-scoring conversations
    if (intentResult.leadScore >= 40 && intentResult.details.summary) {
      updateData.summary = `Customer: ${customer_name || "Customer"}. ${intentResult.details.summary}. Intent: ${intentResult.intent}. Score: ${intentResult.leadScore}/100.`;
    }

    // Check for escalation
    const level = getLeadScoreLevel(intentResult.leadScore);
    const shouldEscalate =
      level === "high" ||
      intentResult.intent === "complaint" ||
      intentResult.intent === "human_needed" ||
      business.escalation_rules?.auto_escalate_keywords?.some(
        (kw: string) => message.toLowerCase().includes(kw.toLowerCase())
      );

    if (shouldEscalate && conv?.controlled_by === "ai") {
      updateData.status = "escalated";

      // Create escalation record
      await supabaseAdmin.from("escalations").insert({
        conversation_id,
        business_id,
        reason:
          intentResult.intent === "complaint"
            ? "Customer complaint detected"
            : intentResult.intent === "human_needed"
            ? "Customer requested human assistance"
            : `High purchase intent detected (score: ${intentResult.leadScore})`,
        priority: level === "high" ? "high" : "medium",
      });
    }

    await supabaseAdmin
      .from("conversations")
      .update(updateData)
      .eq("id", conversation_id);

    // Create or update lead if score >= 40
    if (intentResult.leadScore >= 40) {
      const { data: existingLead } = await supabaseAdmin
        .from("leads")
        .select("id")
        .eq("conversation_id", conversation_id)
        .single();

      if (existingLead) {
        await supabaseAdmin
          .from("leads")
          .update({
            score: intentResult.leadScore,
            intent: intentResult.intent,
            details: {
              ...intentResult.details,
              score_breakdown: intentResult.scoreBreakdown,
            },
          })
          .eq("id", existingLead.id);
      } else {
        await supabaseAdmin.from("leads").insert({
          conversation_id,
          business_id,
          customer_name: customer_name || "Customer",
          score: intentResult.leadScore,
          intent: intentResult.intent,
          details: {
            ...intentResult.details,
            score_breakdown: intentResult.scoreBreakdown,
          },
        });
      }
    }

    // Log analytics event
    await supabaseAdmin.from("analytics_events").insert([
      {
        business_id,
        event_type: "message_sent",
        metadata: { role: "customer", conversation_id },
      },
      {
        business_id,
        event_type: "message_sent",
        metadata: { role: "ai", conversation_id },
      },
    ]);

    return NextResponse.json({
      conversation_id,
      ai_message: aiMessage,
      intent: intentResult.intent,
      lead_score: intentResult.leadScore,
      escalated: shouldEscalate,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
