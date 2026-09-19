import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("conversations")
    .update({
      controlled_by: "human",
      status: "escalated",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark related escalations as handled (if any), then create a new one
  await supabaseAdmin
    .from("escalations")
    .update({ status: "handled" })
    .eq("conversation_id", id)
    .eq("status", "pending");

  return NextResponse.json({ success: true });
}
