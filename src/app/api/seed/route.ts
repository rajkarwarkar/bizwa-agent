import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { DEMO_BUSINESS_ID } from "@/lib/utils";

export async function POST() {
  try {
    // Delete existing demo data in reverse dependency order
    await supabaseAdmin.from("analytics_events").delete().eq("business_id", DEMO_BUSINESS_ID);
    await supabaseAdmin.from("escalations").delete().eq("business_id", DEMO_BUSINESS_ID);
    await supabaseAdmin.from("leads").delete().eq("business_id", DEMO_BUSINESS_ID);
    
    // Delete messages via conversations
    const { data: convs } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("business_id", DEMO_BUSINESS_ID);
    
    if (convs) {
      for (const conv of convs) {
        await supabaseAdmin.from("messages").delete().eq("conversation_id", conv.id);
      }
    }
    
    await supabaseAdmin.from("conversations").delete().eq("business_id", DEMO_BUSINESS_ID);
    await supabaseAdmin.from("knowledge_items").delete().eq("business_id", DEMO_BUSINESS_ID);
    await supabaseAdmin.from("settings").delete().eq("business_id", DEMO_BUSINESS_ID);
    await supabaseAdmin.from("businesses").delete().eq("id", DEMO_BUSINESS_ID);

    // Re-insert business
    await supabaseAdmin.from("businesses").insert({
      id: DEMO_BUSINESS_ID,
      name: "GoaTrip Adventures",
      description: "Premium tour and travel company specializing in Goa tours, beach experiences, adventure sports, and cultural excursions. Based in Panaji, Goa.",
      greeting: "Hey there! 🌴 Welcome to GoaTrip Adventures! I'm your travel assistant. Whether you're looking for beach tours, adventure sports, or cultural experiences — I'm here to help you plan the perfect Goa trip. What are you looking for?",
      tone: "friendly",
      working_hours: { start: "09:00", end: "20:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], timezone: "Asia/Kolkata" },
      escalation_rules: { high_intent_threshold: 70, auto_escalate_keywords: ["speak to human", "talk to someone", "manager", "complaint", "refund"], max_ai_turns_before_escalation: 20 },
    });

    // Insert knowledge items
    const knowledgeItems = [
      { category: "tour_packages", title: "North Goa Beach Explorer", content: "**North Goa Beach Explorer** — Full Day Tour\n- Duration: 8 hours (9 AM - 5 PM)\n- Price: ₹2,499 per person\n- Group discount: 10% off for 5+ people, 15% off for 10+ people\n- Includes: AC transport, lunch, guide, water bottle\n- Covers: Baga Beach, Anjuna Beach, Vagator Beach, Chapora Fort, Aguada Fort\n- Available: Daily\n- Min group: 2 people | Max group: 15 people" },
      { category: "tour_packages", title: "South Goa Heritage Tour", content: "**South Goa Heritage Tour** — Full Day Tour\n- Duration: 9 hours (8 AM - 5 PM)\n- Price: ₹2,999 per person\n- Group discount: 10% off for 5+ people, 15% off for 10+ people\n- Includes: AC transport, lunch, guide, entrance fees\n- Covers: Basilica of Bom Jesus, Se Cathedral, Mangueshi Temple, Colva Beach, Benaulim Beach\n- Available: Daily except Monday\n- Min group: 2 people | Max group: 12 people" },
      { category: "tour_packages", title: "Adventure Water Sports Package", content: "**Adventure Water Sports Package** — Half Day\n- Duration: 4 hours\n- Price: ₹3,499 per person\n- Group discount: 10% off for 5+ people\n- Includes: All equipment, safety gear, instructor, photos/videos\n- Activities: Parasailing, Jet Ski, Banana Ride, Bumper Ride, Speed Boat\n- Location: Calangute-Baga Beach area\n- Available: Daily (weather permitting)\n- Age: 12+ years" },
      { category: "tour_packages", title: "Dudhsagar Falls Expedition", content: "**Dudhsagar Falls Expedition** — Full Day Adventure\n- Duration: 12 hours (6 AM - 6 PM)\n- Price: ₹3,999 per person\n- Group discount: 10% off for 5+ people, 15% off for 10+ people\n- Includes: Jeep safari, breakfast, lunch, guide, life jackets\n- Season: October to May only\n- Min group: 4 people\n- Difficulty: Moderate" },
      { category: "tour_packages", title: "Sunset Cruise & Casino Night", content: "**Sunset Cruise & Casino Night** — Evening Experience\n- Duration: 5 hours (5 PM - 10 PM)\n- Price: ₹4,499 per person\n- Includes: Welcome drink, dinner buffet, live music, casino chips (₹500 value)\n- Available: Wednesday, Friday, Saturday\n- Min age: 21+ for casino\n- Min group: 2 people" },
      { category: "tour_packages", title: "Budget Goa Explorer (2-Day)", content: "**Budget Goa Explorer** — 2-Day Complete Goa Experience\n- Price: ₹4,999 per person\n- Group discount: 10% off for 5+ people, 20% off for 10+ people\n- Day 1: North Goa beaches, forts, Anjuna flea market\n- Day 2: South Goa heritage sites, spice plantation, beach\n- Includes: AC transport, 2 lunches, guide, entrance fees\n- Hotel NOT included" },
      { category: "pricing", title: "Pricing Overview", content: "| Package | Price/Person |\n|---------|-------------|\n| North Goa Beach Explorer | ₹2,499 |\n| South Goa Heritage Tour | ₹2,999 |\n| Adventure Water Sports | ₹3,499 |\n| Dudhsagar Falls | ₹3,999 |\n| Sunset Cruise & Casino | ₹4,499 |\n| Budget Goa Explorer (2-Day) | ₹4,999 |\n\nDiscounts: 5+ people = 10%, 10+ people = 15-20%, Early bird (7+ days) = 5% extra, Students = 5%\nPayment: 30% advance, balance on tour day. UPI, Card, Cash accepted." },
      { category: "policies", title: "Cancellation Policy", content: "7+ days before: Full refund (minus 5% fee)\n3-6 days: 50% refund\n1-2 days: 25% refund\nSame day/No show: No refund\nWeather cancellations by us: Full refund or free reschedule\nFree reschedule if done 3+ days in advance." },
      { category: "policies", title: "Booking Rules", content: "Advance booking recommended (2+ days). 30% advance payment required. Valid ID required. Children under 12: 50% discount. Children under 5: Free. Custom/private tours: 15% surcharge. Pick-up within North/South Goa: Free for groups of 4+, ₹300/trip otherwise." },
      { category: "hours", title: "Operating Hours", content: "Office: Mon-Sun, 9:00 AM - 8:00 PM IST\nChat support: Mon-Sun, 9:00 AM - 8:00 PM IST\nEmergency support: 24/7 for active tours\nPeak Season: October - March\nMonsoon: June - September (limited availability)" },
      { category: "contact", title: "Contact Information", content: "Phone: +91 98765 43210\nWhatsApp: +91 98765 43210\nEmail: hello@goatripadventures.com\nOffice: Shop No. 12, Tourism Complex, Panaji, Goa 403001\nInstagram: @goatripadventures" },
      { category: "faq", title: "What to Wear & Bring", content: "Comfortable clothes and walking shoes, Sunscreen, sunglasses, hat, Swimwear for beach/water sports, Change of clothes for water activities, Camera with waterproof pouch for water sports, Cash for personal shopping/tips." },
      { category: "faq", title: "Safety & Insurance", content: "All tours led by certified guides. Safety equipment provided. First aid kits on all vehicles. Travel insurance can be arranged at ₹199/person/day. Emergency contacts shared before tour start." },
    ];

    await supabaseAdmin.from("knowledge_items").insert(
      knowledgeItems.map((item) => ({
        business_id: DEMO_BUSINESS_ID,
        ...item,
      }))
    );

    // Insert sample conversations
    const convIds = {
      rahul: "00000000-0000-0000-0000-000000000010",
      priya: "00000000-0000-0000-0000-000000000011",
      amit: "00000000-0000-0000-0000-000000000012",
      sarah: "00000000-0000-0000-0000-000000000013",
      vikram: "00000000-0000-0000-0000-000000000014",
    };

    await supabaseAdmin.from("conversations").insert([
      { id: convIds.rahul, business_id: DEMO_BUSINESS_ID, customer_name: "Rahul Sharma", customer_phone: "+91 99887 76655", status: "escalated", controlled_by: "human", summary: "Customer wants to book North Goa Beach Explorer for 5 people tomorrow. Asking for group discount. High purchase intent.", intent: "booking", lead_score: 85, lead_status: "new" },
      { id: convIds.priya, business_id: DEMO_BUSINESS_ID, customer_name: "Priya Patel", customer_phone: "+91 88776 65544", status: "active", controlled_by: "ai", summary: "Customer inquiring about Dudhsagar Falls trip for next weekend.", intent: "inquiry", lead_score: 45, lead_status: "new" },
      { id: convIds.amit, business_id: DEMO_BUSINESS_ID, customer_name: "Amit Kumar", customer_phone: "+91 77665 54433", status: "resolved", controlled_by: "ai", summary: "Customer asked about cancellation policy and operating hours. Resolved.", intent: "faq", lead_score: 10, lead_status: null },
      { id: convIds.sarah, business_id: DEMO_BUSINESS_ID, customer_name: "Sarah Wilson", customer_phone: "+91 66554 43322", status: "active", controlled_by: "ai", summary: "International tourist interested in Budget Goa Explorer for couple.", intent: "inquiry", lead_score: 55, lead_status: "new" },
      { id: convIds.vikram, business_id: DEMO_BUSINESS_ID, customer_name: "Vikram Singh", customer_phone: "+91 55443 32211", status: "active", controlled_by: "ai", summary: "Corporate team outing for 20 people. Very high value lead.", intent: "booking", lead_score: 92, lead_status: "contacted" },
    ]);

    // Insert sample messages for key conversations
    await supabaseAdmin.from("messages").insert([
      { conversation_id: convIds.rahul, role: "customer", content: "Hi, I want to book a Goa tour for 5 people tomorrow." },
      { conversation_id: convIds.rahul, role: "ai", content: "Hey Rahul! 🌴 That sounds amazing! I'd love to help you plan a tour for 5 people tomorrow.\n\nHere are our popular options:\n\n🏖️ **North Goa Beach Explorer** — ₹2,499/person (Full day)\n🏛️ **South Goa Heritage Tour** — ₹2,999/person (Full day)\n🏄 **Adventure Water Sports** — ₹3,499/person (Half day)\n\nWith 5 people, you qualify for our **10% group discount**! 🎉\n\nWhich one catches your eye?" },
      { conversation_id: convIds.rahul, role: "customer", content: "Do you have a package under ₹5000 per person?" },
      { conversation_id: convIds.rahul, role: "ai", content: "Absolutely! Most of our packages are under ₹5,000 per person.\n\n✅ **North Goa Beach Explorer** — ₹2,249/person (with 10% group discount)\n✅ **South Goa Heritage Tour** — ₹2,699/person\n✅ **Adventure Water Sports** — ₹3,149/person\n✅ **Dudhsagar Falls** — ₹3,599/person\n✅ **Sunset Cruise** — ₹4,049/person\n\nThe **North Goa Beach Explorer** would be just **₹11,245 total** for 5 people — best value! 🌊" },
      { conversation_id: convIds.rahul, role: "customer", content: "I want to book the North Goa Beach Explorer. Can you give me an extra discount for 5 people?" },
      { conversation_id: convIds.rahul, role: "ai", content: "Great choice! 🎉\n\nFor your group of 5:\n- Regular: ₹2,499 × 5 = ₹12,495\n- With 10% group discount: **₹11,245 total** (₹2,249/person)\n\nFor any additional discount, let me connect you with our team lead who can discuss special pricing! 🤝" },
      { conversation_id: convIds.priya, role: "customer", content: "Hi! I'm interested in the Dudhsagar Falls trip. Is it available this weekend?" },
      { conversation_id: convIds.priya, role: "ai", content: "Hi Priya! 🌊 The Dudhsagar Falls Expedition is available this weekend!\n\n🏞️ Duration: Full day (6 AM - 6 PM)\n💰 Price: ₹3,999/person\n📋 Includes: Jeep safari, breakfast, lunch, guide\n\n**Important:** Minimum 4 people required. Will you be coming with friends/family?" },
      { conversation_id: convIds.amit, role: "customer", content: "What is your cancellation policy?" },
      { conversation_id: convIds.amit, role: "ai", content: "Here's our cancellation policy:\n\n📋 7+ days before: Full refund (minus 5% fee)\n📋 3-6 days: 50% refund\n📋 1-2 days: 25% refund\n📋 Same day/No show: No refund\n\n🌧️ Weather cancellations by us: Full refund or free reschedule\n✅ Free reschedule if done 3+ days in advance!" },
    ]);

    // Insert sample leads
    await supabaseAdmin.from("leads").insert([
      { conversation_id: convIds.rahul, business_id: DEMO_BUSINESS_ID, customer_name: "Rahul Sharma", score: 85, status: "new", intent: "booking", details: { group_size: 5, requested_date: "tomorrow", budget: "under ₹5000/person", package_interest: "North Goa Beach Explorer", summary: "Ready to book, asking for group discount", score_breakdown: { booking_intent: 30, purchase_intent: 20, specific_date: 15, group_size: 15, price_inquiry: 10, availability_inquiry: 0, total: 90 } } },
      { conversation_id: convIds.sarah, business_id: DEMO_BUSINESS_ID, customer_name: "Sarah Wilson", score: 55, status: "new", intent: "inquiry", details: { group_size: 2, package_interest: "Budget Goa Explorer", summary: "International tourist, 2-day tour for couple" } },
      { conversation_id: convIds.vikram, business_id: DEMO_BUSINESS_ID, customer_name: "Vikram Singh", score: 92, status: "contacted", intent: "booking", details: { group_size: 20, package_interest: "Custom corporate outing", summary: "Corporate team building, 20 people, high-value", score_breakdown: { booking_intent: 30, purchase_intent: 20, specific_date: 15, group_size: 15, price_inquiry: 10, availability_inquiry: 10, total: 100 } }, notes: "Called back. Discussing custom corporate package." },
    ]);

    // Insert escalation
    await supabaseAdmin.from("escalations").insert([
      { conversation_id: convIds.rahul, business_id: DEMO_BUSINESS_ID, reason: "High purchase intent — customer wants additional discount. Needs human negotiation.", priority: "high", status: "pending" },
    ]);

    return NextResponse.json({ success: true, message: "Demo data seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}
