import type { ScoreBreakdown } from "@/lib/types";

interface IntentResult {
  intent: string;
  leadScore: number;
  scoreBreakdown: ScoreBreakdown;
  details: {
    group_size?: number;
    requested_date?: string;
    budget?: string;
    package_interest?: string;
    summary?: string;
  };
}

export function classifyIntent(
  message: string,
  conversationHistory: string[]
): IntentResult {
  const msg = message.toLowerCase();
  const allText = [msg, ...conversationHistory.map((m) => m.toLowerCase())].join(" ");

  // Score breakdown — transparent rule-based scoring
  const breakdown: ScoreBreakdown = {
    booking_intent: 0,
    purchase_intent: 0,
    specific_date: 0,
    group_size: 0,
    price_inquiry: 0,
    availability_inquiry: 0,
    total: 0,
  };

  const details: IntentResult["details"] = {};

  // Booking Intent (+30)
  const bookingWords = ["book", "reserve", "booking", "reservation", "schedule", "confirm"];
  if (bookingWords.some((w) => msg.includes(w))) {
    breakdown.booking_intent = 30;
  } else if (bookingWords.some((w) => allText.includes(w))) {
    breakdown.booking_intent = 15;
  }

  // Purchase Intent (+20)
  const purchaseWords = ["buy", "purchase", "pay", "payment", "order", "want to", "i want", "sign up", "interested in booking", "let's do it", "go ahead", "finalize"];
  if (purchaseWords.some((w) => msg.includes(w))) {
    breakdown.purchase_intent = 20;
  } else if (purchaseWords.some((w) => allText.includes(w))) {
    breakdown.purchase_intent = 10;
  }

  // Specific Date (+15)
  const dateWords = ["tomorrow", "today", "next week", "this weekend", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  const datePattern = /\d{1,2}[\/-]\d{1,2}|\d{1,2}(st|nd|rd|th)/;
  if (dateWords.some((w) => msg.includes(w)) || datePattern.test(msg)) {
    breakdown.specific_date = 15;
    const dateMatch = dateWords.find((w) => msg.includes(w));
    if (dateMatch) details.requested_date = dateMatch;
  } else if (dateWords.some((w) => allText.includes(w))) {
    breakdown.specific_date = 8;
  }

  // Group Size (+15)
  const groupPattern = /(\d+)\s*(people|person|persons|members|guests|pax|of us|friends|family)/i;
  const groupMatch = msg.match(groupPattern) || allText.match(groupPattern);
  if (groupMatch) {
    breakdown.group_size = 15;
    details.group_size = parseInt(groupMatch[1]);
  }

  // Price Inquiry (+10)
  const priceWords = ["price", "cost", "rate", "charges", "fee", "how much", "₹", "rupee", "budget", "affordable", "cheap", "expensive", "discount", "offer"];
  if (priceWords.some((w) => msg.includes(w))) {
    breakdown.price_inquiry = 10;
  }

  // Availability Inquiry (+10)
  const availWords = ["available", "availability", "open", "slot", "can i", "is it possible", "do you have"];
  if (availWords.some((w) => msg.includes(w))) {
    breakdown.availability_inquiry = 10;
  }

  // Calculate total
  breakdown.total = Math.min(
    100,
    breakdown.booking_intent +
      breakdown.purchase_intent +
      breakdown.specific_date +
      breakdown.group_size +
      breakdown.price_inquiry +
      breakdown.availability_inquiry
  );

  // Budget detection
  const budgetPattern = /(?:under|below|within|budget|max)\s*₹?\s*(\d[\d,]*)/i;
  const budgetMatch = msg.match(budgetPattern);
  if (budgetMatch) {
    details.budget = `₹${budgetMatch[1]}`;
  }

  // Package interest detection
  const packageNames = [
    "north goa", "south goa", "water sports", "dudhsagar", "sunset cruise",
    "casino", "budget goa", "beach explorer", "heritage tour", "adventure",
  ];
  const packageMatch = packageNames.find((p) => allText.includes(p));
  if (packageMatch) {
    details.package_interest = packageMatch.charAt(0).toUpperCase() + packageMatch.slice(1);
  }

  // Classify intent
  let intent = "general";

  const complaintWords = ["complaint", "unhappy", "terrible", "worst", "refund", "angry", "disappointed", "bad experience"];
  const humanWords = ["speak to human", "talk to someone", "real person", "manager", "agent", "human"];
  const faqWords = ["policy", "cancellation", "hours", "timing", "what to bring", "safety", "contact"];

  if (complaintWords.some((w) => msg.includes(w))) {
    intent = "complaint";
  } else if (humanWords.some((w) => msg.includes(w))) {
    intent = "human_needed";
  } else if (breakdown.booking_intent >= 30 || (breakdown.booking_intent >= 15 && breakdown.purchase_intent >= 10)) {
    intent = "booking";
  } else if (breakdown.purchase_intent >= 10 || breakdown.price_inquiry >= 10) {
    intent = "inquiry";
  } else if (faqWords.some((w) => msg.includes(w))) {
    intent = "faq";
  }

  // Generate summary
  const summaryParts: string[] = [];
  if (details.package_interest) summaryParts.push(`Interested in ${details.package_interest}`);
  if (details.group_size) summaryParts.push(`group of ${details.group_size}`);
  if (details.requested_date) summaryParts.push(`for ${details.requested_date}`);
  if (details.budget) summaryParts.push(`budget: ${details.budget}`);
  details.summary = summaryParts.length > 0 ? summaryParts.join(", ") : undefined;

  return {
    intent,
    leadScore: breakdown.total,
    scoreBreakdown: breakdown,
    details,
  };
}

export function getLeadScoreLevel(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
