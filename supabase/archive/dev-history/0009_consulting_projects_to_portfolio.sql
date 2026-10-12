-- =============================================================================
-- Anthony Haydar Website - 0009 Additional consulting projects -> Portfolio
-- Run ONCE after 0008_seed_from_cv.sql.
--
-- Moves the CV section "ADDITIONAL CONSULTING PROJECTS" out of Experience and
-- into Portfolio > Projects (published, one project per client).
-- Content is minimal (client, place, year, role) - write up each project
-- (brief, what was done, outcome, photos) in /admin before the site goes live.
--
-- Safe whichever version of the previous step was run.
-- =============================================================================

begin;

-- 1. Remove consulting projects from Experience --------------------------------
delete from public.experience
where id in (
  '00000000-0000-4000-8000-000000000707',  -- combined entry (from 0008)
  '00000000-0000-4000-8000-000000000731',  -- separate entries (earlier version of 0009, if it was run)
  '00000000-0000-4000-8000-000000000732',
  '00000000-0000-4000-8000-000000000733',
  '00000000-0000-4000-8000-000000000734',
  '00000000-0000-4000-8000-000000000735',
  '00000000-0000-4000-8000-000000000736',
  '00000000-0000-4000-8000-000000000737',
  '00000000-0000-4000-8000-000000000738',
  '00000000-0000-4000-8000-000000000739'
);

-- 2. Add them as Portfolio projects (most recent first) -------------------------
insert into public.projects (id, slug, title, category, client_name, location, year, summary, role, service_slugs, featured, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000811', 'sama-judy-coffee-consulting', 'Sama Judy — Coffee Consulting', 'coffee_concepts',
   'Sama Judy', 'Harissa, Lebanon', '2026', 'Coffee consulting for Sama Judy in Harissa.', 'Coffee Consultant',
   array['beverage-consulting'], false, 'published', 103),

  ('00000000-0000-4000-8000-000000000812', 'traction-coffee-consulting', 'Traction — Coffee Consulting', 'coffee_concepts',
   'Traction', 'Batroun, Lebanon', '2025', 'Coffee consulting for Traction in Batroun.', 'Coffee Consultant',
   array['beverage-consulting'], false, 'published', 104),

  ('00000000-0000-4000-8000-000000000813', 'mountain-mud-coffee-consulting', 'Mountain Mud — Coffee Consulting', 'coffee_concepts',
   'Mountain Mud', 'Aamchit, Lebanon', '2025', 'Coffee consulting for Mountain Mud in Aamchit.', 'Coffee Consultant',
   array['beverage-consulting'], false, 'published', 105),

  ('00000000-0000-4000-8000-000000000814', 'dice-and-bites-coffee-consulting', 'Dice and Bites — Coffee Consulting', 'coffee_concepts',
   'Dice and Bites', 'Byblos, Lebanon', '2023', 'Coffee consulting for Dice and Bites in Byblos.', 'Coffee Consultant',
   array['beverage-consulting'], false, 'published', 106),

  ('00000000-0000-4000-8000-000000000815', 'consiglio-coffee-consulting', 'Consiglio — Coffee Consulting', 'coffee_concepts',
   'Consiglio', 'Dbayeh, Lebanon', '2023', 'Coffee consulting for Consiglio in Dbayeh.', 'Coffee Consultant',
   array['beverage-consulting'], false, 'published', 107),

  ('00000000-0000-4000-8000-000000000816', 'coffee-and-co-consulting', 'Coffee & Co. — Consulting', 'coffee_concepts',
   'Coffee & Co.', 'Adma, Lebanon', '2023', 'Consulting for Coffee & Co. in Adma.', 'Consultant',
   array['beverage-consulting'], false, 'published', 108),

  ('00000000-0000-4000-8000-000000000817', 'lemonade-chahine-consulting', 'Lemonade Chahine — Consulting', 'beverage_programs',
   'Lemonade Chahine', 'Byblos, Lebanon', '2023', 'Consulting for Lemonade Chahine in Byblos.', 'Consultant',
   array['beverage-consulting'], false, 'published', 109),

  ('00000000-0000-4000-8000-000000000818', 'railway-coffee-station-consulting', 'Railway Coffee Station — Consulting', 'coffee_concepts',
   'Railway Coffee Station', 'Byblos, Lebanon', '2022', 'Consulting for Railway Coffee Station in Byblos.', 'Consultant',
   array['beverage-consulting'], false, 'published', 110),

  ('00000000-0000-4000-8000-000000000819', 'croissant-bar-coffee-consulting', 'Croissant Bar — Coffee Consulting', 'coffee_concepts',
   'Croissant Bar', 'Byblos, Lebanon', '2022', 'Coffee consulting for Croissant Bar in Byblos.', 'Coffee Consultant',
   array['beverage-consulting'], false, 'published', 111)
on conflict (id) do nothing;

commit;
