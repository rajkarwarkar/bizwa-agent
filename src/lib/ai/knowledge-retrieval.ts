import { supabaseAdmin } from "@/lib/supabase/server";
import type { KnowledgeItem } from "@/lib/types";

export async function retrieveKnowledge(
  businessId: string,
  query: string
): Promise<KnowledgeItem[]> {
  // For the MVP, fetch all knowledge items for the business
  // A production system would use embeddings/vector search
  const { data, error } = await supabaseAdmin
    .from("knowledge_items")
    .select("*")
    .eq("business_id", businessId)
    .order("category");

  if (error) {
    console.error("Knowledge retrieval error:", error);
    return [];
  }

  return data || [];
}
