import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");
  const status = searchParams.get("status");

  if (!businessId) {
    return NextResponse.json({ error: "business_id required" }, { status: 400 });
  }

  let query = supabaseAdmin
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .order("score", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update({ status: body.status, notes: body.notes })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also update conversation lead_status
  if (data) {
    await supabaseAdmin
      .from("conversations")
      .update({ lead_status: body.status })
      .eq("id", data.conversation_id);
  }

  return NextResponse.json(data);
}
