// ============================================================
// BizWa Agent — TypeScript Type Definitions
// ============================================================

export interface Business {
  id: string;
  name: string;
  description: string;
  greeting: string;
  tone: string;
  working_hours: WorkingHours;
  escalation_rules: EscalationRules;
  created_at: string;
}

export interface WorkingHours {
  start: string; // "09:00"
  end: string;   // "18:00"
  days: string[]; // ["Mon","Tue","Wed","Thu","Fri","Sat"]
  timezone: string;
}

export interface EscalationRules {
  high_intent_threshold: number;
  auto_escalate_keywords: string[];
  max_ai_turns_before_escalation: number;
}

export interface Conversation {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  status: ConversationStatus;
  controlled_by: 'ai' | 'human';
  handback_note: string | null;
  summary: string | null;
  intent: string | null;
  lead_score: number;
  lead_status: LeadStatus | null;
  created_at: string;
  updated_at: string;
  // Joined
  messages?: Message[];
  last_message?: Message;
}

export type ConversationStatus = 'active' | 'escalated' | 'resolved' | 'closed';

export interface Message {
  id: string;
  conversation_id: string;
  role: 'customer' | 'ai' | 'human';
  content: string;
  metadata: MessageMetadata | null;
  created_at: string;
}

export interface MessageMetadata {
  intent?: string;
  lead_score?: number;
  score_breakdown?: ScoreBreakdown;
  confidence?: number;
}

export interface ScoreBreakdown {
  booking_intent: number;
  purchase_intent: number;
  specific_date: number;
  group_size: number;
  price_inquiry: number;
  availability_inquiry: number;
  total: number;
}

export interface KnowledgeItem {
  id: string;
  business_id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type KnowledgeCategory =
  | 'tour_packages'
  | 'pricing'
  | 'policies'
  | 'faq'
  | 'contact'
  | 'hours'
  | 'general';

export interface Lead {
  id: string;
  conversation_id: string;
  business_id: string;
  customer_name: string;
  score: number;
  status: LeadStatus;
  intent: string;
  details: LeadDetails;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  conversation?: Conversation;
}

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';

export interface LeadDetails {
  group_size?: number;
  requested_date?: string;
  budget?: string;
  package_interest?: string;
  summary?: string;
  score_breakdown?: ScoreBreakdown;
}

export interface Escalation {
  id: string;
  conversation_id: string;
  business_id: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'handled';
  created_at: string;
}

export interface Setting {
  id: string;
  business_id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  business_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ChatRequest {
  conversation_id?: string;
  customer_name?: string;
  customer_phone?: string;
  message: string;
  business_id: string;
}

export interface ChatResponse {
  conversation_id: string;
  ai_message: Message;
  intent?: string;
  lead_score?: number;
  lead_status?: string;
  escalated?: boolean;
}

export interface DashboardStats {
  active_conversations: number;
  total_conversations: number;
  new_leads: number;
  high_intent_leads: number;
  pending_escalations: number;
  conversion_rate: number;
  avg_response_time: number;
  recent_conversations: Conversation[];
}

export interface AnalyticsData {
  conversation_count: { date: string; count: number }[];
  leads_generated: { date: string; count: number }[];
  top_questions: { question: string; count: number }[];
  avg_response_time: number;
  escalation_rate: number;
  lead_score_distribution: { range: string; count: number }[];
  intent_distribution: { intent: string; count: number }[];
}
