import { supabaseAdmin } from "@/lib/supabase/server";
import type { KnowledgeItem } from "@/lib/types";

// Common stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  "i", "me", "my", "we", "you", "your", "the", "a", "an", "is", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "shall", "should", "may", "might", "can", "could", "to",
  "of", "in", "for", "on", "with", "at", "by", "from", "about", "as", "into",
  "through", "during", "before", "after", "and", "but", "or", "not", "no",
  "so", "if", "than", "that", "this", "what", "which", "who", "how", "when",
  "where", "why", "all", "each", "every", "any", "few", "more", "most",
  "some", "such", "it", "its", "they", "them", "their", "there", "here",
  "want", "need", "like", "please", "tell", "know", "get", "hi", "hello",
]);

function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

export async function retrieveKnowledge(
  businessId: string,
  query: string
): Promise<KnowledgeItem[]> {
  // Extract meaningful keywords from the user query
  const keywords = extractKeywords(query);

  // If we have keywords, try to find matching knowledge items first
  if (keywords.length > 0) {
    // Build OR filter: match any keyword in title or content
    const ilikeFilters = keywords
      .slice(0, 5) // Limit to top 5 keywords to avoid overly complex queries
      .flatMap((kw) => [
        `title.ilike.%${kw}%`,
        `content.ilike.%${kw}%`,
      ]);

    const { data: matched, error: matchError } = await supabaseAdmin
      .from("knowledge_items")
      .select("*")
      .eq("business_id", businessId)
      .or(ilikeFilters.join(","))
      .order("category");

    if (!matchError && matched && matched.length > 0) {
      return matched;
    }
  }

  // Fallback: return all knowledge items for the business
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
