-- ============================================================
-- BizWa Agent — Supabase Database Schema
-- ============================================================
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- BUSINESSES
-- ============================================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  greeting TEXT DEFAULT 'Hello! Welcome to our business. How can I help you today?',
  tone TEXT DEFAULT 'friendly',
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00", "days": ["Mon","Tue","Wed","Thu","Fri","Sat"], "timezone": "Asia/Kolkata"}',
  escalation_rules JSONB DEFAULT '{"high_intent_threshold": 70, "auto_escalate_keywords": ["speak to human", "talk to someone", "manager", "complaint"], "max_ai_turns_before_escalation": 20}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT 'Customer',
  customer_phone TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'escalated', 'resolved', 'closed')),
  controlled_by TEXT NOT NULL DEFAULT 'ai' CHECK (controlled_by IN ('ai', 'human')),
  handback_note TEXT,
  summary TEXT,
  intent TEXT,
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT CHECK (lead_status IN ('new', 'contacted', 'converted', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_business ON conversations(business_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_lead_status ON conversations(lead_status);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'ai', 'human')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================================
-- KNOWLEDGE ITEMS
-- ============================================================
CREATE TABLE knowledge_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_business ON knowledge_items(business_id);
CREATE INDEX idx_knowledge_category ON knowledge_items(category);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  intent TEXT,
  details JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_business ON leads(business_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score DESC);

-- ============================================================
-- ESCALATIONS
-- ============================================================
CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'handled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escalations_business ON escalations(business_id);
CREATE INDEX idx_escalations_status ON escalations(status);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, key)
);

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_business ON analytics_events(business_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER knowledge_items_updated_at
  BEFORE UPDATE ON knowledge_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA: GoaTrip Adventures
-- ============================================================

-- Demo Business
INSERT INTO businesses (id, name, description, greeting, tone, working_hours, escalation_rules)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'GoaTrip Adventures',
  'Premium tour and travel company specializing in Goa tours, beach experiences, adventure sports, and cultural excursions. Based in Panaji, Goa.',
  'Hey there! 🌴 Welcome to GoaTrip Adventures! I''m your travel assistant. Whether you''re looking for beach tours, adventure sports, or cultural experiences — I''m here to help you plan the perfect Goa trip. What are you looking for?',
  'friendly',
  '{"start": "09:00", "end": "20:00", "days": ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], "timezone": "Asia/Kolkata"}',
  '{"high_intent_threshold": 70, "auto_escalate_keywords": ["speak to human", "talk to someone", "manager", "complaint", "refund"], "max_ai_turns_before_escalation": 20}'
);

-- Knowledge Items
INSERT INTO knowledge_items (business_id, category, title, content) VALUES
('00000000-0000-0000-0000-000000000001', 'tour_packages', 'North Goa Beach Explorer',
'**North Goa Beach Explorer** — Full Day Tour
- Duration: 8 hours (9 AM - 5 PM)
- Price: ₹2,499 per person
- Group discount: 10% off for 5+ people, 15% off for 10+ people
- Includes: AC transport, lunch, guide, water bottle
- Covers: Baga Beach, Anjuna Beach, Vagator Beach, Chapora Fort, Aguada Fort
- Activities: Beach time, sightseeing, photography spots
- Available: Daily
- Min group: 2 people
- Max group: 15 people'),

('00000000-0000-0000-0000-000000000001', 'tour_packages', 'South Goa Heritage Tour',
'**South Goa Heritage Tour** — Full Day Tour
- Duration: 9 hours (8 AM - 5 PM)
- Price: ₹2,999 per person
- Group discount: 10% off for 5+ people, 15% off for 10+ people
- Includes: AC transport, lunch, guide, entrance fees
- Covers: Basilica of Bom Jesus, Se Cathedral, Mangueshi Temple, Colva Beach, Benaulim Beach
- Available: Daily except Monday
- Min group: 2 people
- Max group: 12 people'),

('00000000-0000-0000-0000-000000000001', 'tour_packages', 'Adventure Water Sports Package',
'**Adventure Water Sports Package** — Half Day
- Duration: 4 hours (flexible morning/afternoon slots)
- Price: ₹3,499 per person
- Group discount: 10% off for 5+ people
- Includes: All equipment, safety gear, instructor, photos/videos
- Activities: Parasailing, Jet Ski, Banana Ride, Bumper Ride, Speed Boat
- Location: Calangute-Baga Beach area
- Available: Daily (weather permitting)
- Age: 12+ years
- Min group: 1 person'),

('00000000-0000-0000-0000-000000000001', 'tour_packages', 'Dudhsagar Falls Expedition',
'**Dudhsagar Falls Expedition** — Full Day Adventure
- Duration: 12 hours (6 AM - 6 PM)
- Price: ₹3,999 per person
- Group discount: 10% off for 5+ people, 15% off for 10+ people
- Includes: Jeep safari, breakfast, lunch, guide, life jackets
- Covers: Dudhsagar Falls, Spice Plantation visit, Elephant bathing (ethical)
- Season: October to May only (closed during monsoon)
- Min group: 4 people
- Difficulty: Moderate
- What to bring: Comfortable shoes, change of clothes, waterproof phone pouch'),

('00000000-0000-0000-0000-000000000001', 'tour_packages', 'Sunset Cruise & Casino Night',
'**Sunset Cruise & Casino Night** — Evening Experience
- Duration: 5 hours (5 PM - 10 PM)
- Price: ₹4,499 per person
- Includes: Welcome drink, dinner buffet, live music, casino chips (₹500 value)
- Route: Mandovi River cruise with city lights view
- Dress code: Smart casual
- Available: Wednesday, Friday, Saturday
- Min age: 21+ for casino
- Min group: 2 people'),

('00000000-0000-0000-0000-000000000001', 'tour_packages', 'Budget Goa Explorer (2-Day)',
'**Budget Goa Explorer** — 2-Day Complete Goa Experience
- Duration: 2 full days
- Price: ₹4,999 per person
- Group discount: 10% off for 5+ people, 20% off for 10+ people
- Day 1: North Goa beaches, forts, Anjuna flea market
- Day 2: South Goa heritage sites, spice plantation, beach
- Includes: AC transport, 2 lunches, guide, entrance fees
- Hotel NOT included (can arrange at extra cost: ₹1,500-3,000/night)
- Available: Daily
- Min group: 2 people
- Best value package for first-time visitors'),

('00000000-0000-0000-0000-000000000001', 'pricing', 'Pricing Overview',
'**GoaTrip Adventures — Pricing Overview**

| Package | Duration | Price/Person |
|---------|----------|-------------|
| North Goa Beach Explorer | Full day | ₹2,499 |
| South Goa Heritage Tour | Full day | ₹2,999 |
| Adventure Water Sports | Half day | ₹3,499 |
| Dudhsagar Falls Expedition | Full day | ₹3,999 |
| Sunset Cruise & Casino Night | Evening | ₹4,499 |
| Budget Goa Explorer | 2 days | ₹4,999 |

**Discounts:**
- Groups of 5+: 10% discount
- Groups of 10+: 15-20% discount
- Early bird (7+ days advance): 5% extra discount
- Students with valid ID: 5% discount

**Payment:**
- Advance: 30% booking amount
- Balance: On the day of tour
- Methods: UPI, Credit/Debit Card, Net Banking, Cash
- Refund: As per cancellation policy'),

('00000000-0000-0000-0000-000000000001', 'policies', 'Cancellation Policy',
'**Cancellation Policy**
- 7+ days before tour: Full refund (minus 5% processing fee)
- 3-6 days before tour: 50% refund
- 1-2 days before tour: 25% refund
- Same day / No show: No refund
- Weather cancellations (by us): Full refund or free reschedule
- Medical emergency: Case-by-case basis with valid proof

Reschedule is free if done 3+ days in advance (subject to availability).'),

('00000000-0000-0000-0000-000000000001', 'policies', 'Booking Rules',
'**Booking Rules**
- Advance booking recommended (at least 2 days)
- 30% advance payment required to confirm
- Full payment due on tour day before departure
- Valid ID proof required for all participants
- Children under 12: 50% discount on most tours
- Children under 5: Free (no separate seat)
- Minimum group sizes apply per tour
- Custom/private tours available on request (15% surcharge)
- Pick-up and drop: Available within North/South Goa (free for groups of 4+, ₹300 per trip otherwise)'),

('00000000-0000-0000-0000-000000000001', 'hours', 'Operating Hours',
'**GoaTrip Adventures — Operating Hours**
- Office: Mon-Sun, 9:00 AM - 8:00 PM IST
- Tours: Start times vary (6 AM - 5 PM depending on package)
- Chat support: Mon-Sun, 9:00 AM - 8:00 PM IST
- Emergency support: 24/7 for active tours

**Peak Season:** October - March (advance booking strongly recommended)
**Off Season:** April - September (some tours may have limited availability)
**Monsoon:** June - September (Dudhsagar Falls & some water sports unavailable)'),

('00000000-0000-0000-0000-000000000001', 'contact', 'Contact Information',
'**GoaTrip Adventures — Contact**
- Phone: +91 98765 43210
- WhatsApp: +91 98765 43210
- Email: hello@goatripadventures.com
- Website: www.goatripadventures.com
- Office: Shop No. 12, Tourism Complex, Panaji, Goa 403001
- Instagram: @goatripadventures
- Google Maps: Search "GoaTrip Adventures Panaji"'),

('00000000-0000-0000-0000-000000000001', 'faq', 'What to Wear & Bring',
'**What to wear / bring on tours:**
- Comfortable clothes and walking shoes
- Sunscreen, sunglasses, hat
- Swimwear (for beach/water sports)
- Change of clothes (for water activities)
- Water bottle (we provide 1, bring extra if needed)
- Camera/phone (waterproof pouch recommended for water sports)
- Cash for personal shopping/tips
- Prescribed medications if any
- Light rain jacket (monsoon season)'),

('00000000-0000-0000-0000-000000000001', 'faq', 'Safety & Insurance',
'**Safety & Insurance:**
- All tours are led by certified, experienced guides
- Safety equipment provided for all adventure activities
- First aid kits on all vehicles
- Travel insurance: Not included, recommended for adventure tours
- We can help arrange travel insurance at ₹199/person/day
- Emergency contacts shared before tour start
- Vehicles: Well-maintained AC buses/SUVs with experienced drivers'),

('00000000-0000-0000-0000-000000000001', 'faq', 'Custom & Private Tours',
'**Custom & Private Tours:**
- Want a personalized itinerary? We do that!
- Private tours: 15% surcharge on group rate
- Customizable: Choose your own stops, timing, activities
- Corporate outings & team building: Special packages available
- Wedding/event planning assistance: Available on request
- Airport transfers: ₹800 (North Goa) / ₹1,200 (South Goa)
- Multi-day custom itineraries: Contact us for pricing'),

('00000000-0000-0000-0000-000000000001', 'faq', 'Best Time to Visit Goa',
'**Best Time to Visit Goa:**
- Peak Season (Nov-Feb): Best weather, all activities available, higher prices
- Shoulder Season (Oct, Mar): Good weather, fewer crowds, good deals
- Monsoon (Jun-Sep): Lush green scenery, limited water sports, best hotel rates
- Summer (Apr-May): Hot but good for budget travelers, indoor activities

We operate year-round with seasonal adjustments to tour availability.');

-- Sample Conversations
INSERT INTO conversations (id, business_id, customer_name, customer_phone, status, controlled_by, summary, intent, lead_score, lead_status, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Rahul Sharma', '+91 99887 76655', 'escalated', 'human', 'Customer wants to book North Goa Beach Explorer for 5 people tomorrow. Asking for group discount. High purchase intent — ready to book.', 'booking', 85, 'new', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '5 minutes'),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Priya Patel', '+91 88776 65544', 'active', 'ai', 'Customer inquiring about Dudhsagar Falls trip for next weekend. Asking about difficulty level and what to bring.', 'inquiry', 45, 'new', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes'),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Amit Kumar', '+91 77665 54433', 'resolved', 'ai', 'Customer asked about cancellation policy and operating hours. General FAQ inquiry resolved by AI.', 'faq', 10, NULL, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours'),
('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Sarah Wilson', '+91 66554 43322', 'active', 'ai', 'International tourist asking about Budget Goa Explorer package. Interested in 2-day tour for couple. Moderate interest.', 'inquiry', 55, 'new', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '20 minutes'),
('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Vikram Singh', '+91 55443 32211', 'active', 'ai', 'Corporate team outing inquiry. 20 people, looking for adventure + team building. Very high value lead.', 'booking', 92, 'contacted', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour');

-- Sample Messages for Rahul Sharma (high-intent demo conversation)
INSERT INTO messages (conversation_id, role, content, metadata, created_at) VALUES
('00000000-0000-0000-0000-000000000010', 'customer', 'Hi, I want to book a Goa tour for 5 people tomorrow.', NULL, NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000010', 'ai', 'Hey Rahul! 🌴 That sounds amazing! I''d love to help you plan a tour for 5 people tomorrow.\n\nHere are our popular options:\n\n🏖️ **North Goa Beach Explorer** — ₹2,499/person (Full day)\nCovers Baga, Anjuna, Vagator beaches + Chapora & Aguada Forts\n\n🏛️ **South Goa Heritage Tour** — ₹2,999/person (Full day)\nBasilica of Bom Jesus, Se Cathedral, temples + beautiful beaches\n\n🏄 **Adventure Water Sports** — ₹3,499/person (Half day)\nParasailing, Jet Ski, Banana Ride & more!\n\nGreat news — with 5 people, you qualify for our **10% group discount**! 🎉\n\nWhich one catches your eye?', '{"intent": "booking", "lead_score": 65}', NOW() - INTERVAL '1 hour 59 minutes'),
('00000000-0000-0000-0000-000000000010', 'customer', 'Do you have a package under ₹5000 per person?', NULL, NOW() - INTERVAL '1 hour 55 minutes'),
('00000000-0000-0000-0000-000000000010', 'ai', 'Absolutely! Most of our packages are under ₹5,000 per person. Here''s what fits your budget:\n\n✅ **North Goa Beach Explorer** — ₹2,499/person → With 10% group discount: **₹2,249/person**\n✅ **South Goa Heritage Tour** — ₹2,999/person → With discount: **₹2,699/person**\n✅ **Adventure Water Sports** — ₹3,499/person → With discount: **₹3,149/person**\n✅ **Dudhsagar Falls Expedition** — ₹3,999/person → With discount: **₹3,599/person**\n✅ **Sunset Cruise & Casino Night** — ₹4,499/person → With discount: **₹4,049/person**\n\nFor 5 people, the **North Goa Beach Explorer** would be just **₹11,245 total** — best value for a fun day! 🌊\n\nWould you like to go with that one?', '{"intent": "booking", "lead_score": 70}', NOW() - INTERVAL '1 hour 54 minutes'),
('00000000-0000-0000-0000-000000000010', 'customer', 'I want to book the North Goa Beach Explorer. Can you give me a discount for 5 people? Maybe something extra since it''s 5 of us?', NULL, NOW() - INTERVAL '1 hour 50 minutes'),
('00000000-0000-0000-0000-000000000010', 'ai', 'Great choice! The North Goa Beach Explorer is one of our most popular tours! 🎉\n\nFor your group of 5:\n- Regular price: ₹2,499 × 5 = ₹12,495\n- 10% group discount applied: **₹11,245 total**\n- That''s ₹2,249 per person!\n\nFor any additional discount beyond our group rate, let me connect you with our team lead who can discuss special pricing for you. They''ll be able to help with the best deal! 🤝\n\nLet me get someone from our team to assist you right away.', '{"intent": "booking", "lead_score": 85}', NOW() - INTERVAL '1 hour 49 minutes');

-- Sample Messages for Priya Patel
INSERT INTO messages (conversation_id, role, content, metadata, created_at) VALUES
('00000000-0000-0000-0000-000000000011', 'customer', 'Hi! I''m interested in the Dudhsagar Falls trip. Is it available this weekend?', NULL, NOW() - INTERVAL '1 hour'),
('00000000-0000-0000-0000-000000000011', 'ai', 'Hi Priya! 🌊 The Dudhsagar Falls Expedition is one of our most thrilling tours!\n\nGreat news — it''s available this weekend! Here are the details:\n\n🏞️ **Dudhsagar Falls Expedition**\n- Duration: Full day (6 AM - 6 PM)\n- Price: ₹3,999/person\n- Includes: Jeep safari, breakfast, lunch, guide, life jackets\n- You''ll also visit a spice plantation!\n\n**Important:** This tour requires a minimum of 4 people. Will you be coming with friends/family?\n\nThe difficulty is moderate — you''ll need comfortable shoes and be ready for some walking. Would you like more details about what to bring?', '{"intent": "inquiry", "lead_score": 45}', NOW() - INTERVAL '58 minutes'),
('00000000-0000-0000-0000-000000000011', 'customer', 'Yes, what should I bring? And is it safe? I''m a bit nervous about the jeep ride.', NULL, NOW() - INTERVAL '50 minutes'),
('00000000-0000-0000-0000-000000000011', 'ai', 'Totally understand, Priya! Let me put your mind at ease 😊\n\n**Safety First:**\n- All our jeep drivers are highly experienced with 5+ years on the Dudhsagar route\n- Safety equipment and life jackets are provided\n- Our guides are certified and carry first aid kits\n- We maintain our vehicles regularly\n\n**What to Bring:**\n- Comfortable shoes (no sandals/heels)\n- Change of clothes (you WILL get splashed! 💦)\n- Waterproof phone pouch\n- Sunscreen & sunglasses\n- Any prescribed medications\n- Light snacks if needed\n- Camera for amazing photos!\n\nThe jeep ride is actually the most fun part — bumpy but safe, and the views are incredible! 🌿\n\nWould you like to book for this weekend?', '{"intent": "inquiry", "lead_score": 50}', NOW() - INTERVAL '48 minutes');

-- Sample Messages for Amit Kumar (resolved FAQ)
INSERT INTO messages (conversation_id, role, content, metadata, created_at) VALUES
('00000000-0000-0000-0000-000000000012', 'customer', 'What is your cancellation policy?', NULL, NOW() - INTERVAL '5 hours'),
('00000000-0000-0000-0000-000000000012', 'ai', 'Hi Amit! Here''s our cancellation policy:\n\n📋 **Cancellation Policy:**\n- **7+ days before tour:** Full refund (minus 5% processing fee)\n- **3-6 days before:** 50% refund\n- **1-2 days before:** 25% refund\n- **Same day / No show:** No refund\n\n🌧️ **Weather cancellations** (by us): Full refund or free reschedule\n🏥 **Medical emergency:** Case-by-case with valid proof\n\n✅ **Free reschedule** if done 3+ days in advance!\n\nAnything else you''d like to know?', '{"intent": "faq", "lead_score": 5}', NOW() - INTERVAL '4 hours 58 minutes'),
('00000000-0000-0000-0000-000000000012', 'customer', 'What are your operating hours?', NULL, NOW() - INTERVAL '4 hours 55 minutes'),
('00000000-0000-0000-0000-000000000012', 'ai', 'Our hours are:\n\n🕐 **Office & Chat Support:** Daily, 9:00 AM - 8:00 PM IST\n🌅 **Tours:** Start times vary (6 AM - 5 PM depending on the package)\n🆘 **Emergency Support:** 24/7 for guests on active tours\n\n📅 **Peak Season:** October - March (book early!)\n📅 **Off Season:** April - September (great deals available)\n\nIs there anything else I can help with?', '{"intent": "faq", "lead_score": 10}', NOW() - INTERVAL '4 hours 53 minutes'),
('00000000-0000-0000-0000-000000000012', 'customer', 'No, that''s all. Thanks!', NULL, NOW() - INTERVAL '4 hours 50 minutes'),
('00000000-0000-0000-0000-000000000012', 'ai', 'You''re welcome, Amit! 😊 Feel free to reach out anytime when you''re ready to plan your Goa adventure. Have a great day! 🌴', '{"intent": "faq", "lead_score": 10}', NOW() - INTERVAL '4 hours 49 minutes');

-- Sample Leads
INSERT INTO leads (id, conversation_id, business_id, customer_name, score, status, intent, details, notes, created_at) VALUES
('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Rahul Sharma', 85, 'new', 'booking',
'{"group_size": 5, "requested_date": "tomorrow", "budget": "under ₹5000/person", "package_interest": "North Goa Beach Explorer", "summary": "Ready to book, asking for additional group discount", "score_breakdown": {"booking_intent": 30, "purchase_intent": 20, "specific_date": 15, "group_size": 15, "price_inquiry": 10, "availability_inquiry": 0, "total": 90}}',
NULL, NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Sarah Wilson', 55, 'new', 'inquiry',
'{"group_size": 2, "package_interest": "Budget Goa Explorer", "summary": "International tourist interested in 2-day tour for couple"}',
NULL, NOW() - INTERVAL '45 minutes'),
('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Vikram Singh', 92, 'contacted', 'booking',
'{"group_size": 20, "package_interest": "Custom corporate outing", "summary": "Corporate team building event, 20 people, high-value lead", "score_breakdown": {"booking_intent": 30, "purchase_intent": 20, "specific_date": 15, "group_size": 15, "price_inquiry": 10, "availability_inquiry": 10, "total": 100}}',
'Called back. Discussing custom corporate package. Very interested.', NOW() - INTERVAL '3 hours');

-- Sample Escalations
INSERT INTO escalations (conversation_id, business_id, reason, priority, status, created_at) VALUES
('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'High purchase intent — customer wants to book and is requesting additional discount beyond standard group rate. Needs human negotiation.', 'high', 'pending', NOW() - INTERVAL '1 hour 49 minutes'),
('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Corporate inquiry for 20 people. Custom package needed. High-value lead requires personal attention.', 'high', 'handled', NOW() - INTERVAL '2 hours 30 minutes');

-- Analytics Events
INSERT INTO analytics_events (business_id, event_type, metadata, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'message_sent', '{"role": "customer", "conversation_id": "00000000-0000-0000-0000-000000000010"}', NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000001', 'message_sent', '{"role": "ai", "conversation_id": "00000000-0000-0000-0000-000000000010"}', NOW() - INTERVAL '1 hour 59 minutes'),
('00000000-0000-0000-0000-000000000001', 'lead_created', '{"lead_id": "00000000-0000-0000-0000-000000000020", "score": 85}', NOW() - INTERVAL '1 hour 50 minutes'),
('00000000-0000-0000-0000-000000000001', 'escalation_created', '{"conversation_id": "00000000-0000-0000-0000-000000000010", "priority": "high"}', NOW() - INTERVAL '1 hour 49 minutes'),
('00000000-0000-0000-0000-000000000001', 'message_sent', '{"role": "customer", "conversation_id": "00000000-0000-0000-0000-000000000011"}', NOW() - INTERVAL '1 hour'),
('00000000-0000-0000-0000-000000000001', 'message_sent', '{"role": "ai", "conversation_id": "00000000-0000-0000-0000-000000000011"}', NOW() - INTERVAL '58 minutes'),
('00000000-0000-0000-0000-000000000001', 'lead_created', '{"lead_id": "00000000-0000-0000-0000-000000000021", "score": 55}', NOW() - INTERVAL '45 minutes'),
('00000000-0000-0000-0000-000000000001', 'lead_created', '{"lead_id": "00000000-0000-0000-0000-000000000022", "score": 92}', NOW() - INTERVAL '3 hours');
