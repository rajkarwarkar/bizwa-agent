import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [convResult, msgResult, leadResult] = await Promise.all([
    supabaseAdmin.from("conversations").select("*").eq("id", id).single(),
    supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("leads")
      .select("*")
      .eq("conversation_id", id)
      .single(),
  ]);

  if (convResult.error) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json({
    conversation: convResult.data,
    messages: msgResult.data || [],
    lead: leadResult.data || null,
  });
}
