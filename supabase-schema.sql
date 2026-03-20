-- Supabase Schema for Lakshveer Rao Website
-- Run this in Supabase SQL Editor to set up the database

-- Systems Table
create table systems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  category text,
  github_url text,
  demo_url text,
  website_url text,
  is_featured boolean default false,
  display_order int default 0,
  created_at timestamp with time zone default now()
);

-- Impact Table
create table impact (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year text,
  type text not null check (type in ('Competition', 'Hackathon', 'Invitation', 'Accelerator', 'Pitch', 'Partnership', 'Grant', 'Media')),
  organisation text,
  description text,
  link text,
  link_label text,
  is_featured boolean default false,
  display_order int default 0,
  created_at timestamp with time zone default now()
);

-- Supporters Table
create table supporters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  link text,
  is_featured boolean default true,
  display_order int default 0,
  created_at timestamp with time zone default now()
);

-- Endorsements Table (NEW)
create table endorsements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  organisation text,
  content text not null,
  linkedin_url text,
  slug text unique not null,
  is_featured boolean default false,
  is_approved boolean default false,
  created_at timestamp with time zone default now()
);

-- Collaboration Inquiries Table
create table collaboration_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organisation text,
  category text check (category in ('Hardware Sponsorship', 'Manufacturing Collaboration', 'Research Partnerships', 'Institutional Grants', 'Cloud Credits', 'Media Features', 'Other')),
  message text not null,
  is_handled boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table systems enable row level security;
alter table impact enable row level security;
alter table supporters enable row level security;
alter table endorsements enable row level security;
alter table collaboration_inquiries enable row level security;

-- Public Read Policies
create policy "Public can read featured systems" on systems for select using (is_featured = true);
create policy "Public can read featured impact" on impact for select using (is_featured = true);
create policy "Public can read featured supporters" on supporters for select using (is_featured = true);
create policy "Public can read approved endorsements" on endorsements for select using (is_approved = true);
create policy "Public can submit collaboration inquiries" on collaboration_inquiries for insert with check (true);

-- Admin Full Access Policies: Systems
create policy "Auth read all systems" on systems for select to authenticated using (true);
create policy "Auth insert systems" on systems for insert to authenticated with check (true);
create policy "Auth update systems" on systems for update to authenticated using (true);
create policy "Auth delete systems" on systems for delete to authenticated using (true);

-- Admin Full Access Policies: Impact
create policy "Auth read all impact" on impact for select to authenticated using (true);
create policy "Auth insert impact" on impact for insert to authenticated with check (true);
create policy "Auth update impact" on impact for update to authenticated using (true);
create policy "Auth delete impact" on impact for delete to authenticated using (true);

-- Admin Full Access Policies: Supporters
create policy "Auth read all supporters" on supporters for select to authenticated using (true);
create policy "Auth insert supporters" on supporters for insert to authenticated with check (true);
create policy "Auth update supporters" on supporters for update to authenticated using (true);
create policy "Auth delete supporters" on supporters for delete to authenticated using (true);

-- Admin Full Access Policies: Endorsements
create policy "Auth read all endorsements" on endorsements for select to authenticated using (true);
create policy "Auth insert endorsements" on endorsements for insert to authenticated with check (true);
create policy "Auth update endorsements" on endorsements for update to authenticated using (true);
create policy "Auth delete endorsements" on endorsements for delete to authenticated using (true);

-- Admin Full Access Policies: Collaboration Inquiries
create policy "Auth read all inquiries" on collaboration_inquiries for select to authenticated using (true);
create policy "Auth update inquiries" on collaboration_inquiries for update to authenticated using (true);
create policy "Auth delete inquiries" on collaboration_inquiries for delete to authenticated using (true);

-- Indexes
create index idx_systems_featured on systems(is_featured) where is_featured = true;
create index idx_systems_slug on systems(slug);
create index idx_impact_featured on impact(is_featured) where is_featured = true;
create index idx_impact_type on impact(type);
create index idx_supporters_featured on supporters(is_featured) where is_featured = true;
create index idx_endorsements_approved on endorsements(is_approved) where is_approved = true;
create index idx_endorsements_featured on endorsements(is_featured, is_approved) where is_featured = true and is_approved = true;
create index idx_endorsements_slug on endorsements(slug);
create index idx_inquiries_handled on collaboration_inquiries(is_handled);
create index idx_inquiries_created on collaboration_inquiries(created_at desc);

-- Seed Data: Systems
insert into systems (title, slug, description, website_url, is_featured, display_order) values
  ('Hardvare', 'hardvare', 'Hardware execution platform enforcing safe electrical and logical states.', null, true, 1),
  ('CircuitHeroes.com', 'circuitheroes', 'Circuit-building trading card game. 300+ decks sold.', 'https://circuitheroes.com', true, 2),
  ('ChhotaCreator.com', 'chhotacreator', 'Peer-learning platform for hands-on learning.', 'https://chhotacreator.com', true, 3),
  ('IdeasByKids / FirstClue', 'firstclue', 'AI system decoding children''s ideas into structured development insights.', null, true, 4),
  ('Autonomous Navigation Systems', 'navigation', 'GPS-guided and gesture-controlled robotic vehicles.', null, true, 5),
  ('Vision-Based Robotics', 'vision', 'OpenCV, MediaPipe, TensorFlow Lite deployments on edge devices.', null, true, 6),
  ('Motion-Control Gaming Platform', 'motion', 'Full-body measurable gaming system driven by real movement.', null, true, 7);

-- Seed Data: Impact
insert into impact (title, type, organisation, link, is_featured, display_order) values
  ('Special Mention Winner', 'Competition', 'Vedanta × Param Foundation Makeathon', '#', true, 1),
  ('Top-5 Finalist', 'Competition', 'Hardware Hackathon 2.0', '#', true, 2),
  ('Youngest Finalist', 'Competition', 'VibeHack by Emergent', '#', true, 3),
  ('Youngest Participant', 'Competition', 'Yugantar Tech Fest', '#', false, 4),
  ('Shipped Live Project', 'Hackathon', 'RunTogether Hackathon', '#', false, 5),
  ('Special Invite', 'Invitation', 'Robotics & Hardware Founders Meet', '#', true, 6),
  ('Selected - Delta-2 Cohort', 'Accelerator', 'The Residency (USA)', '#', false, 7),
  ('Pitched', 'Pitch', 'South Park Commons', '#', false, 8),
  ('Pitched', 'Pitch', 'AI Collective Hyderabad', '#', false, 9),
  ('Co-creation Agreement', 'Partnership', 'Lion Circuits', '#', false, 10),
  ('Shortlisted Level 2', 'Competition', 'Shark Tank India S5', '#', false, 11),
  ('Shortlisted Level 3', 'Competition', 'ISF Junicorns', '#', false, 12),
  ('₹1,00,000 Grant', 'Grant', 'Malpani Ventures', '#', true, 13),
  ('AI Grants', 'Grant', 'AI Grants India', '#', false, 14),
  ('₹40,000 Creator Micro-Scholarship', 'Grant', null, '#', false, 15),
  ('Covered Twice', 'Media', 'Runtime Magazine', '#', false, 16);

-- Seed Data: Supporters
insert into supporters (name, logo_url, link, is_featured, display_order) values
  ('Malpani Ventures', '/logos/malpani.png', 'https://malpaniventures.com', true, 1),
  ('Lion Circuits', '/logos/lion-circuits.png', 'https://lioncircuits.com', true, 2),
  ('Param Foundation', '/logos/param.png', 'https://paramfoundation.org', true, 3),
  ('AI Grants India', '/logos/ai-grants.png', 'https://aigrantsindia.com', true, 4);

-- Seed Data: Endorsements
insert into endorsements (name, role, organisation, content, linkedin_url, slug, is_featured, is_approved) values
  ('Arun Kumar', 'Technical Director', 'Lion Circuits', 'Lakshveer demonstrates exceptional understanding of hardware systems for his age. His work on circuit design shows real engineering thinking.', 'https://linkedin.com/in/example1', 'lion-circuits-2026', true, true),
  ('Priya Malpani', 'Partner', 'Malpani Ventures', 'One of the most impressive young builders we have funded. Clear vision, disciplined execution.', 'https://linkedin.com/in/example2', 'malpani-ventures-2026', true, true),
  ('Rajesh Sharma', 'Program Director', 'Param Foundation', 'Lakshveer brings a rare combination of creativity and technical rigor. His makeathon project stood out among participants twice his age.', 'https://linkedin.com/in/example3', 'param-foundation-2026', true, true),
  ('Vikram Rao', 'Lead Organizer', 'Hardware Hackathon 2.0', 'Consistently ships working prototypes. Does not just ideate - he builds.', null, 'hardware-hackathon-2026', false, true);
