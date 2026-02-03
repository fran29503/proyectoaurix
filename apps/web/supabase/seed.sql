-- ============================================
-- AURIX MVP - Seed Data
-- Cliente: Meridian Harbor Realty (MHR)
-- ============================================

-- Clean existing data (for re-seeding)
TRUNCATE tasks, activities, leads, properties, users, tenants CASCADE;

-- ============ TENANT ============
INSERT INTO tenants (id, name, slug, branding, settings) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Meridian Harbor Realty',
  'meridian-harbor',
  '{
    "primaryColor": "#0B1F3A",
    "accentColor": "#B87333",
    "logoUrl": "/assets/mhr-logo.svg",
    "fontFamily": "Inter"
  }',
  '{
    "slaResponseMinutes": 10,
    "defaultTimezone": "Asia/Dubai",
    "defaultCurrency": "AED"
  }'
);

-- ============ USERS (10 team members) ============
INSERT INTO users (id, tenant_id, email, full_name, role, team, market, phone) VALUES
-- Leadership
('22222222-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111',
 'omar@meridianharbor.ae', 'Omar Al-Mansouri', 'admin', NULL, 'dubai', '+971501234567'),

('22222222-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111',
 'sarah@meridianharbor.ae', 'Sarah Khan', 'manager', NULL, 'dubai', '+971501234568'),

-- Team Leads Dubai
('22222222-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111',
 'youssef@meridianharbor.ae', 'Youssef Nasser', 'team_lead', 'off-plan', 'dubai', '+971501234569'),

('22222222-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111',
 'lina@meridianharbor.ae', 'Lina Petrova', 'team_lead', 'secondary', 'dubai', '+971501234570'),

-- Agents Dubai
('22222222-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111',
 'aisha@meridianharbor.ae', 'Aisha Rahman', 'agent', 'off-plan', 'dubai', '+971501234571'),

('22222222-0001-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111',
 'hassan@meridianharbor.ae', 'Hassan Ali', 'agent', 'off-plan', 'dubai', '+971501234572'),

-- USA Team
('22222222-0001-0001-0001-000000000007', '11111111-1111-1111-1111-111111111111',
 'mark@meridianharbor.com', 'Mark Rivera', 'manager', 'usa_desk', 'usa', '+13055550199'),

('22222222-0001-0001-0001-000000000008', '11111111-1111-1111-1111-111111111111',
 'sofia@meridianharbor.com', 'Sofía Delgado', 'agent', 'usa_desk', 'usa', '+13055550200'),

-- Backoffice
('22222222-0001-0001-0001-000000000009', '11111111-1111-1111-1111-111111111111',
 'nadia.bo@meridianharbor.ae', 'Nadia Farooq', 'backoffice', NULL, 'dubai', '+971501234573'),

('22222222-0001-0001-0001-000000000010', '11111111-1111-1111-1111-111111111111',
 'jason@meridianharbor.com', 'Jason Kim', 'backoffice', NULL, 'usa', '+13055550201');

-- ============ PROPERTIES (7 sample properties) ============
INSERT INTO properties (id, tenant_id, code, market, title, type, zone, price, currency, operation, status, developer, description, bedrooms, bathrooms, area, features, tags) VALUES
-- Dubai Properties
('33333333-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111',
 'AE-DCH-CH-1BR-1407', 'dubai', 'Creekside Horizon 1BR - Unit 1407', '1BR', 'Creek Harbour',
 1650000.00, 'AED', 'off-plan', 'disponible', 'Emaar',
 'Stunning 1BR apartment with panoramic creek views. Part of the prestigious Creekside Horizon development by Emaar.',
 '1', '2', '850 sqft',
 '["Creek View", "Smart Home", "Gym", "Pool", "Concierge"]',
 '["payment_plan_80_20", "view", "amenities", "investor_ready"]'),

('33333333-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111',
 'AE-DTWN-BB-2BR-2211', 'dubai', 'Downtown Boulevard 2BR - Unit 2211', '2BR', 'Downtown',
 3950000.00, 'AED', 'resale', 'disponible', NULL,
 'Premium 2BR apartment with direct Burj Khalifa views. High floor, fully furnished with designer finishes.',
 '2', '3', '1450 sqft',
 '["Burj View", "High Floor", "Furnished", "Balcony", "Parking x2"]',
 '["burj_view", "high_floor", "premium", "furnished"]'),

('33333333-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111',
 'AE-DM-PR-3BR-0903', 'dubai', 'Marina Pinnacle 3BR - Unit 903', '3BR', 'Dubai Marina',
 4600000.00, 'AED', 'resale', 'reservado', NULL,
 'Exclusive 3BR penthouse with full marina views. Premium location, walking distance to beach and JBR.',
 '3', '4', '2200 sqft',
 '["Marina View", "Penthouse", "Private Terrace", "Premium Finishes"]',
 '["marina_view", "furnished", "investor_ready", "premium"]'),

('33333333-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111',
 'AE-DBL-DL-VILLA-07', 'dubai', 'Damac Lagoons Villa - Plot 07', 'Villa', 'Dubailand',
 2250000.00, 'AED', 'off-plan', 'disponible', 'DAMAC',
 'Family villa in the new Damac Lagoons community. Mediterranean-inspired design with private pool.',
 '4', '5', '3500 sqft',
 '["Private Pool", "Garden", "Maid Room", "Smart Home", "Community Beach"]',
 '["family", "community", "installments", "new_launch"]'),

-- USA Properties
('33333333-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111',
 'US-FL-MIA-BR-2B-12A', 'usa', 'Brickell Bay Tower 2/2 - Unit 12A', 'Condo 2/2', 'Miami (Brickell)',
 785000.00, 'USD', 'resale', 'disponible', NULL,
 'Modern 2BR/2BA condo in prime Brickell location. Bay views, walking distance to Brickell City Centre.',
 '2', '2', '1150 sqft',
 '["Bay View", "Gym", "Pool", "Concierge", "Parking"]',
 '["rental_demand", "walkable", "bay_view", "investment"]'),

('33333333-0001-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111',
 'US-FL-MIA-EW-1B-08C', 'usa', 'Edgewater Skyline 1/1 - Unit 08C', 'Condo 1/1', 'Miami (Edgewater)',
 510000.00, 'USD', 'resale', 'disponible', NULL,
 'Bright 1BR/1BA in up-and-coming Edgewater. Great rental yields, modern amenities.',
 '1', '1', '780 sqft',
 '["City View", "Modern Kitchen", "Gym", "Rooftop Pool"]',
 '["cashflow", "modern", "amenities", "starter_investment"]'),

('33333333-0001-0001-0001-000000000007', '11111111-1111-1111-1111-111111111111',
 'US-TX-AUS-SFH-04', 'usa', 'Austin Tech Corridor Home', 'Single Family', 'Austin',
 925000.00, 'USD', 'resale', 'disponible', NULL,
 '4BR single family home in Austin tech corridor. Great schools, growing neighborhood.',
 '4', '3', '2800 sqft',
 '["Backyard", "Garage x2", "Updated Kitchen", "Near Schools"]',
 '["tech_area", "schools", "yard", "family"]');

-- ============ LEADS (15 sample leads) ============
INSERT INTO leads (id, tenant_id, full_name, phone, phone_country, email, language, country_residence, channel, source, campaign, market, segment, interest_property_id, interest_zone, interest_type, budget_min, budget_max, budget_currency, payment_method, timing, goal, intent, intent_reasons, status, assigned_to, next_action, next_action_date, sla_deadline, created_at) VALUES

-- Lead 1: Ravi P. - Dubai Off-plan (Calificado)
('44444444-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111',
 'Ravi Patel', '+971501112233', 'AE', 'ravi.p@gmail.com', 'en', 'India',
 'portal', 'property_finder', NULL, 'dubai', 'dubai_offplan',
 '33333333-0001-0001-0001-000000000001', 'Creek Harbour', '1BR',
 1400000.00, 1800000.00, 'AED', 'cash', '30-60', 'investment',
 'alta', '["asked_payment_plan", "clear_budget", "short_timing"]',
 'calificado', '22222222-0001-0001-0001-000000000005',
 'Enviar brochure + agendar call', NOW() + INTERVAL '1 day',
 NOW() + INTERVAL '10 minutes', NOW() - INTERVAL '2 hours'),

-- Lead 2: Elena K. - Dubai Secondary (Contactado)
('44444444-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111',
 'Elena Kozlova', '+971502223344', 'AE', 'elena.k@mail.ru', 'ru', 'Russia',
 'meta_ads', NULL, 'downtown_luxury_q1', 'dubai', 'dubai_secondary',
 '33333333-0001-0001-0001-000000000002', 'Downtown', '2BR',
 3500000.00, 4200000.00, 'AED', 'cash', '0-30', 'living',
 'alta', '["immediate_timing", "specific_requirements", "cash_buyer"]',
 'contactado', '22222222-0001-0001-0001-000000000004',
 'Llamar hoy 19:00 GST', NOW() + INTERVAL '3 hours',
 NOW() + INTERVAL '10 minutes', NOW() - INTERVAL '45 minutes'),

-- Lead 3: Ahmed S. - Dubai Off-plan (Nuevo)
('44444444-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111',
 'Ahmed Sharif', '+971503334455', 'AE', 'ahmed.sharif@outlook.com', 'ar', 'UAE',
 'portal', 'bayut', NULL, 'dubai', 'dubai_offplan',
 '33333333-0001-0001-0001-000000000004', 'Dubailand', 'Villa',
 2000000.00, 2600000.00, 'AED', 'payment_plan', '60-90', 'living',
 NULL, '[]',
 'nuevo', '22222222-0001-0001-0001-000000000006',
 'WhatsApp IA: calificar + proponer viewing', NOW() + INTERVAL '30 minutes',
 NOW() + INTERVAL '10 minutes', NOW() - INTERVAL '8 minutes'),

-- Lead 4: James W. - Dubai Off-plan (Calificado)
('44444444-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111',
 'James Wilson', '+447700112233', 'GB', 'j.wilson@gmail.com', 'en', 'UK',
 'google', NULL, 'dubai_investment_uk', 'dubai', 'dubai_offplan',
 NULL, NULL, NULL,
 900000.00, 1400000.00, 'AED', 'payment_plan', '30-60', 'investment',
 'alta', '["payment_plan_interest", "clear_budget", "uk_investor"]',
 'calificado', '22222222-0001-0001-0001-000000000003',
 'Enviar plan de pago + 3 opciones', NOW() + INTERVAL '4 hours',
 NOW() + INTERVAL '10 minutes', NOW() - INTERVAL '1 day'),

-- Lead 5: Fatima A. - Dubai Leasing (Meeting Programado)
('44444444-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111',
 'Fatima Al-Rashid', '+971504445566', 'AE', 'fatima.ar@gmail.com', 'ar', 'UAE',
 'referral', NULL, NULL, 'dubai', 'dubai_leasing',
 '33333333-0001-0001-0001-000000000003', 'Dubai Marina', '1BR',
 95000.00, 120000.00, 'AED', NULL, '0-30', 'living',
 'alta', '["immediate_need", "referral", "specific_area"]',
 'meeting_programado', '22222222-0001-0001-0001-000000000004',
 'Confirmar viewing mañana 17:30', NOW() + INTERVAL '1 day',
 NULL, NOW() - INTERVAL '3 days'),

-- Lead 6: Oleg M. - Dubai Secondary (Oferta/Reserva)
('44444444-0001-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111',
 'Oleg Medvedev', '+79161234567', 'RU', 'oleg.m@yandex.ru', 'ru', 'Russia',
 'partner', NULL, NULL, 'dubai', 'dubai_secondary',
 '33333333-0001-0001-0001-000000000003', 'Dubai Marina', '3BR',
 4000000.00, 5000000.00, 'AED', 'cash', '0-30', 'investment',
 'alta', '["cash_buyer", "specific_property", "ready_to_offer"]',
 'oferta_reserva', '22222222-0001-0001-0001-000000000004',
 'Enviar oferta + términos', NOW() + INTERVAL '2 hours',
 NULL, NOW() - INTERVAL '5 days'),

-- Lead 7: Priya N. - Dubai Off-plan (Dormido)
('44444444-0001-0001-0001-000000000007', '11111111-1111-1111-1111-111111111111',
 'Priya Nair', '+919876543210', 'IN', 'priya.n@gmail.com', 'en', 'India',
 'meta_ads', NULL, 'hartland_launch', 'dubai', 'dubai_offplan',
 NULL, 'Meydan', '1BR',
 1000000.00, 1300000.00, 'AED', 'payment_plan', '90+', 'investment',
 'baja', '["long_timing", "exploring_options"]',
 'dormido', '22222222-0001-0001-0001-000000000005',
 'Reactivar con mensaje IA', NOW() + INTERVAL '7 days',
 NULL, NOW() - INTERVAL '14 days'),

-- Lead 8: Carlos G. - USA (Calificado)
('44444444-0001-0001-0001-000000000008', '11111111-1111-1111-1111-111111111111',
 'Carlos García', '+17865551234', 'US', 'carlos.g@gmail.com', 'es', 'Colombia',
 'portal', 'zillow', NULL, 'usa', 'usa_desk',
 '33333333-0001-0001-0001-000000000005', 'Miami (Brickell)', 'Condo 2/2',
 700000.00, 850000.00, 'USD', 'mortgage', '30-60', 'investment',
 'alta', '["specific_property", "mortgage_preapproval", "latam_investor"]',
 'calificado', '22222222-0001-0001-0001-000000000008',
 'Enviar comparables + agendar Zoom', NOW() + INTERVAL '6 hours',
 NOW() + INTERVAL '15 minutes', NOW() - INTERVAL '1 day'),

-- Lead 9: Maria L. - USA (Contactado)
('44444444-0001-0001-0001-000000000009', '11111111-1111-1111-1111-111111111111',
 'Maria Lopez', '+13055559876', 'US', 'maria.l@outlook.com', 'en', 'USA',
 'portal', 'realtor', NULL, 'usa', 'usa_desk',
 '33333333-0001-0001-0001-000000000006', 'Miami (Edgewater)', 'Condo 1/1',
 450000.00, 550000.00, 'USD', 'mortgage', '0-30', 'living',
 'media', '["first_time_buyer", "needs_guidance"]',
 'contactado', '22222222-0001-0001-0001-000000000007',
 'Llamar hoy 17:15 ET', NOW() + INTERVAL '2 hours',
 NOW() + INTERVAL '15 minutes', NOW() - INTERVAL '30 minutes'),

-- Lead 10: Daniel T. - USA (Nuevo)
('44444444-0001-0001-0001-000000000010', '11111111-1111-1111-1111-111111111111',
 'Daniel Thompson', '+15125551234', 'US', 'dan.t@gmail.com', 'en', 'USA',
 'google', NULL, 'austin_homes_q1', 'usa', 'usa_desk',
 '33333333-0001-0001-0001-000000000007', 'Austin', 'Single Family',
 850000.00, 1100000.00, 'USD', NULL, '60-90', 'living',
 NULL, '[]',
 'nuevo', '22222222-0001-0001-0001-000000000008',
 'Calificar: cash/mortgage + timeline', NOW() + INTERVAL '1 hour',
 NOW() + INTERVAL '15 minutes', NOW() - INTERVAL '5 minutes'),

-- Lead 11: Victoria R. - USA (Nuevo)
('44444444-0001-0001-0001-000000000011', '11111111-1111-1111-1111-111111111111',
 'Victoria Rodriguez', '+17865554321', 'US', 'vicky.r@gmail.com', 'es', 'Venezuela',
 'meta_ads', NULL, 'miami_investment_latam', 'usa', 'usa_desk',
 NULL, 'Miami', 'Condo',
 380000.00, 520000.00, 'USD', 'cash', '60-90', 'investment',
 NULL, '[]',
 'nuevo', '22222222-0001-0001-0001-000000000007',
 'SMS IA: detectar intención + presupuesto', NOW() + INTERVAL '30 minutes',
 NOW() + INTERVAL '15 minutes', NOW() - INTERVAL '12 minutes'),

-- Lead 12: Noura H. - Dubai Secondary (Meeting Realizado)
('44444444-0001-0001-0001-000000000012', '11111111-1111-1111-1111-111111111111',
 'Noura Hassan', '+971505556677', 'AE', 'noura.h@gmail.com', 'ar', 'UAE',
 'portal', 'dubizzle', NULL, 'dubai', 'dubai_secondary',
 '33333333-0001-0001-0001-000000000002', 'Downtown', '1BR',
 1600000.00, 2000000.00, 'AED', 'mortgage', '0-30', 'living',
 'alta', '["viewed_property", "mortgage_approved", "ready_decision"]',
 'meeting_realizado', '22222222-0001-0001-0001-000000000004',
 'Enviar recap + próximos pasos', NOW() + INTERVAL '4 hours',
 NULL, NOW() - INTERVAL '2 days'),

-- Lead 13: Samir B. - Dubai Off-plan (Calificado)
('44444444-0001-0001-0001-000000000013', '11111111-1111-1111-1111-111111111111',
 'Samir Bhatt', '+971506667788', 'AE', 'samir.b@hotmail.com', 'en', 'India',
 'google', NULL, 'damac_lagoons_search', 'dubai', 'dubai_offplan',
 '33333333-0001-0001-0001-000000000004', 'Dubailand', 'Townhouse',
 1100000.00, 1600000.00, 'AED', 'payment_plan', '30-60', 'living',
 'alta', '["family_buyer", "specific_community", "payment_plan"]',
 'calificado', '22222222-0001-0001-0001-000000000003',
 'Agendar call 15 min + brochure', NOW() + INTERVAL '5 hours',
 NOW() + INTERVAL '10 minutes', NOW() - INTERVAL '6 hours'),

-- Lead 14: Lucas P. - USA (Negociación)
('44444444-0001-0001-0001-000000000014', '11111111-1111-1111-1111-111111111111',
 'Lucas Pereira', '+17865557890', 'US', 'lucas.p@gmail.com', 'en', 'Brazil',
 'referral', NULL, NULL, 'usa', 'usa_desk',
 '33333333-0001-0001-0001-000000000005', 'Miami (Brickell)', 'Condo 2/2',
 900000.00, 1200000.00, 'USD', 'cash', '0-30', 'investment',
 'alta', '["referral", "cash_ready", "under_contract"]',
 'negociacion', '22222222-0001-0001-0001-000000000007',
 'Revisar oferta + coordinar cierre', NOW() + INTERVAL '1 day',
 NULL, NOW() - INTERVAL '10 days'),

-- Lead 15: Hanna Z. - Dubai Off-plan (Contactado)
('44444444-0001-0001-0001-000000000015', '11111111-1111-1111-1111-111111111111',
 'Hanna Zimmerman', '+491701234567', 'DE', 'hanna.z@gmail.com', 'en', 'Germany',
 'meta_ads', NULL, 'dubai_studio_investment', 'dubai', 'dubai_offplan',
 NULL, NULL, 'Studio',
 650000.00, 850000.00, 'AED', 'payment_plan', '0-30', 'investment',
 'media', '["exploring_dubai", "first_investment"]',
 'contactado', '22222222-0001-0001-0001-000000000006',
 'Enviar 5 opciones + follow-up 24h', NOW() + INTERVAL '1 day',
 NOW() + INTERVAL '10 minutes', NOW() - INTERVAL '1 hour');

-- ============ ACTIVITIES (Sample timeline entries) ============
INSERT INTO activities (tenant_id, lead_id, user_id, type, title, description, metadata, created_at) VALUES
-- Ravi P. activities
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000001', NULL,
 'status_change', 'Lead created', 'Lead entered from Property Finder',
 '{"newStatus": "nuevo"}', NOW() - INTERVAL '2 hours'),
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000001', '22222222-0001-0001-0001-000000000005',
 'whatsapp', 'IA Qualification Complete', 'AI qualified lead via WhatsApp. Intent: Alta. Budget: AED 1.4-1.8M. Timing: 30-60 days.',
 '{}', NOW() - INTERVAL '1 hour 45 minutes'),
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000001', '22222222-0001-0001-0001-000000000005',
 'status_change', 'Status changed to Calificado', NULL,
 '{"previousStatus": "contactado", "newStatus": "calificado"}', NOW() - INTERVAL '1 hour 30 minutes'),

-- Elena K. activities
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000002', NULL,
 'status_change', 'Lead created', 'Lead from Meta Ads campaign: downtown_luxury_q1',
 '{"newStatus": "nuevo"}', NOW() - INTERVAL '45 minutes'),
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000002', '22222222-0001-0001-0001-000000000004',
 'assignment', 'Assigned to Lina Petrova', 'Auto-assigned based on segment: Secondary Market',
 '{"newAssignee": "Lina Petrova"}', NOW() - INTERVAL '44 minutes'),

-- Oleg M. activities (more advanced in pipeline)
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000006', NULL,
 'status_change', 'Lead created', 'Lead from partner referral',
 '{"newStatus": "nuevo"}', NOW() - INTERVAL '5 days'),
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000006', '22222222-0001-0001-0001-000000000004',
 'call', 'Initial Call', 'Discussed requirements. Looking for 3BR in Marina. Budget up to 5M. Cash buyer.',
 '{"duration": 15}', NOW() - INTERVAL '4 days 20 hours'),
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000006', '22222222-0001-0001-0001-000000000004',
 'meeting', 'Property Viewing', 'Showed Marina Pinnacle 3BR. Client very interested.',
 '{}', NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000006', '22222222-0001-0001-0001-000000000004',
 'status_change', 'Moved to Oferta/Reserva', 'Client ready to make offer',
 '{"previousStatus": "meeting_realizado", "newStatus": "oferta_reserva"}', NOW() - INTERVAL '1 day');

-- ============ TASKS ============
INSERT INTO tasks (tenant_id, lead_id, assigned_to, created_by, title, description, priority, due_date, created_at) VALUES
-- Urgent tasks
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000003',
 '22222222-0001-0001-0001-000000000006', '22222222-0001-0001-0001-000000000002',
 'Qualify Ahmed S. via WhatsApp', 'New lead from Bayut. Interested in Damac Lagoons Villa. Need to qualify budget and timing.',
 'high', NOW() + INTERVAL '30 minutes', NOW() - INTERVAL '8 minutes'),

('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000002',
 '22222222-0001-0001-0001-000000000004', '22222222-0001-0001-0001-000000000002',
 'Call Elena K. at 19:00', 'Russian-speaking lead interested in Downtown 2BR. Immediate buyer.',
 'high', NOW() + INTERVAL '3 hours', NOW() - INTERVAL '40 minutes'),

('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000006',
 '22222222-0001-0001-0001-000000000004', '22222222-0001-0001-0001-000000000004',
 'Send offer terms to Oleg M.', 'Prepare and send formal offer for Marina Pinnacle 3BR.',
 'high', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),

-- Medium priority
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000001',
 '22222222-0001-0001-0001-000000000005', '22222222-0001-0001-0001-000000000005',
 'Send brochure to Ravi P.', 'Send Creekside Horizon brochure with payment plan details.',
 'medium', NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 hour'),

('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000008',
 '22222222-0001-0001-0001-000000000008', '22222222-0001-0001-0001-000000000007',
 'Schedule Zoom with Carlos G.', 'LATAM investor interested in Brickell. Send comparables and schedule virtual tour.',
 'medium', NOW() + INTERVAL '6 hours', NOW() - INTERVAL '1 day'),

-- Follow-up tasks
('11111111-1111-1111-1111-111111111111', '44444444-0001-0001-0001-000000000007',
 '22222222-0001-0001-0001-000000000005', '22222222-0001-0001-0001-000000000002',
 'Reactivate Priya N.', 'Dormant lead. Send new off-plan options in her budget range.',
 'low', NOW() + INTERVAL '7 days', NOW() - INTERVAL '7 days');

-- ============ VERIFICATION QUERIES ============
-- Run these to verify the seed data
-- SELECT COUNT(*) as tenant_count FROM tenants;
-- SELECT COUNT(*) as user_count FROM users;
-- SELECT COUNT(*) as property_count FROM properties;
-- SELECT COUNT(*) as lead_count FROM leads;
-- SELECT COUNT(*) as activity_count FROM activities;
-- SELECT COUNT(*) as task_count FROM tasks;
