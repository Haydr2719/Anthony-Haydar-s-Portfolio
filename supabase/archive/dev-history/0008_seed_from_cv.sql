-- =============================================================================
-- Anthony Haydar Website - 0008 Real content from Anthony's CV
-- Run ONCE after 0003_seed.sql (and the other migrations).
--
-- What it does:
--   1. Replaces the placeholder Experience entries with Anthony's real career
--      history, consulting work and education (published).
--   2. Adds his two main consulting engagements (Sira, Cherry on top) as
--      Portfolio projects in DRAFT, so client names can be approved before
--      publishing (brief §15: "approved client/brand names").
--   3. Sets the real contact email and phone in Site settings.
--   4. Updates page text that the CV contradicts or can now fill in
--      (years of experience, About story).
--
-- Source: Anthony Haydar CV. Nothing here is invented beyond light rewording.
--
-- Note: steps 3 and 4 OVERWRITE those settings / text blocks. Running this again
-- later would undo edits made in the CMS to those specific fields.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Experience (About page timeline + credentials)
-- -----------------------------------------------------------------------------

-- Remove the placeholder entries created by 0003_seed.sql
delete from public.experience
where id in (
  '00000000-0000-4000-8000-000000000601',
  '00000000-0000-4000-8000-000000000602',
  '00000000-0000-4000-8000-000000000603',
  '00000000-0000-4000-8000-000000000604',
  '00000000-0000-4000-8000-000000000605'
);

insert into public.experience (id, kind, title, organization, location, start_label, end_label, description, status, sort_order)
values
  -- Current & management roles (most recent first)
  ('00000000-0000-4000-8000-000000000701', 'role', 'Bar Manager', 'Edde Sands', 'Byblos, Lebanon', 'April 2026', 'Present',
   'Manages bar operations across three outlets and special events, including proms, after-parties and on- and off-site bar catering. Leads weekly operations at Paradiso, a premium outdoor beach club serving an average of 450 guests every Saturday, and develops outlet-specific cocktail menus.',
   'published', 1),

  ('00000000-0000-4000-8000-000000000702', 'role', 'Consultant', 'Cherry on top', 'Hrajel, Lebanon', 'April 2026', 'June 2026',
   'Engineered a complete menu by cross-utilizing ingredients from the existing crêpe and fruit-cocktail range, trained staff, calculated item costs and pricing, and recommended suppliers.',
   'published', 2),

  ('00000000-0000-4000-8000-000000000703', 'role', 'Consultant', 'Sira', 'Tabarja, Lebanon', 'September 2025', 'June 2026',
   'Led concept development and the complete menu, engineered the bar layout, sourced and negotiated with suppliers, trained the team and built recipe-costing, inventory and waste-control procedures. Supported peak service for up to 300 customers.',
   'published', 3),

  ('00000000-0000-4000-8000-000000000704', 'role', 'General Manager', 'Dice And Bites', 'Byblos, Lebanon', 'November 2024', 'April 2026',
   'Managed staffing, training and daily kitchen, coffee, bar and floor operations. Oversaw all menus, signature cocktails, costing and pricing, events, inventory and supplier relationships, and introduced improvements that increased overall sales.',
   'published', 4),

  ('00000000-0000-4000-8000-000000000705', 'role', 'Bar Manager', 'Soult Beach', 'Batroun, Lebanon', 'August 2024', 'October 2024',
   'Rebranded the bar menu with new signature cocktails and cost-optimized recipes, led opening procurement and inventory controls, designed an ergonomic bar layout and trained the team.',
   'published', 5),

  ('00000000-0000-4000-8000-000000000706', 'role', 'General Manager', 'Mood Lebanon', 'Batroun, Lebanon', 'May 2024', 'October 2024',
   'Managed bar, floor and kitchen operations. Developed a five-drink signature cocktail menu using house-made syrups, cordials, infusions, fat-washes and tinctures, and established cost-control procedures.',
   'published', 6),

  ('00000000-0000-4000-8000-000000000707', 'milestone', 'Coffee & Beverage Consulting Projects', 'Cafés and venues across Lebanon', 'Lebanon', '2022', '2026',
   'Sama Judy (Harissa), Traction (Batroun), Mountain Mud (Aamchit), Dice and Bites (Byblos), Consiglio (Dbayeh), Coffee & Co. (Adma), Lemonade Chahine (Byblos), Railway Coffee Station (Byblos) and Croissant Bar (Byblos).',
   'published', 7),

  ('00000000-0000-4000-8000-000000000708', 'role', 'Bar Manager', 'Libre Resto-Bar', 'Jounieh, Lebanon', 'July 2023', 'May 2024', null, 'published', 8),
  ('00000000-0000-4000-8000-000000000709', 'role', 'Head Bartender', 'Sao', 'Batroun, Lebanon', 'May 2023', 'September 2023', null, 'published', 9),
  ('00000000-0000-4000-8000-000000000710', 'role', 'Bartender', 'Straight Up Group – House of Cocktails', 'Byblos, Lebanon', 'April 2023', 'May 2023', null, 'published', 10),
  ('00000000-0000-4000-8000-000000000711', 'milestone', 'Founder & Owner', 'The Alchemist — Seasonal Liqueur Brand', 'Byblos, Lebanon', 'December 2022', 'Present', null, 'published', 11),
  ('00000000-0000-4000-8000-000000000712', 'role', 'Manager', 'Railway Coffee Station', 'Byblos, Lebanon', 'November 2022', 'December 2022', null, 'published', 12),
  ('00000000-0000-4000-8000-000000000713', 'role', 'Bartender', 'Dusk by Uncle Sam', 'Aamchit, Lebanon', 'May 2022', 'November 2022', null, 'published', 13),
  ('00000000-0000-4000-8000-000000000714', 'role', 'Barista', 'Vee Coffee Shop', 'Byblos, Lebanon', 'October 2021', 'November 2022', null, 'published', 14),

  -- Education & credentials (shown in the "Credentials & certifications" list)
  ('00000000-0000-4000-8000-000000000721', 'certification', 'Barista Certificate (in progress)', 'CIS College', 'Sin El Fil, Lebanon', 'In progress', null, null, 'published', 21),
  ('00000000-0000-4000-8000-000000000722', 'certification', 'WSET Level 2 (in progress)', 'Wine & Spirit Education Trust', 'Sin El Fil, Lebanon', 'In progress', null, null, 'published', 22),
  ('00000000-0000-4000-8000-000000000723', 'certification', 'BBA, Business Management (in progress)', 'Lebanese German University', 'Sahel Aalma, Lebanon', 'February 2024', 'Present', null, 'published', 23),
  ('00000000-0000-4000-8000-000000000724', 'certification', 'BBA, Finance', 'Conservatoire National des Arts et Métiers (CNAM)', 'Nahr Ibrahim, Lebanon', 'November 2020', 'December 2023', null, 'published', 24)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 2. Portfolio projects from the main consulting engagements (DRAFT)
-- -----------------------------------------------------------------------------
insert into public.projects (id, slug, title, category, client_name, location, year, summary, brief, role, work_done, outcome, highlights, service_slugs, featured, status, sort_order)
values
  ('00000000-0000-4000-8000-000000000801', 'sira-concept-and-opening', 'Sira — Concept, Menu & Bar Operations', 'openings',
   'Sira', 'Tabarja, Lebanon', '2025–2026',
   'Concept development, complete menu creation, bar layout engineering and team training for a new venue.',
   'Develop the concept and complete menu for Sira, including specialty items, health-conscious options and items with calculated calorie content, and set up efficient bar operations.',
   'Consultant',
   'Led concept development and created the complete menu. Contributed to venue design and engineered the bar layout and item placement to improve workflow, service speed and staff efficiency. Sourced key suppliers and negotiated pricing, quality and delivery terms. Determined staffing requirements and trained the team on recipes, product knowledge, service standards, hygiene and efficient bar operations. Built recipe-costing, pricing, inventory and waste-control procedures.

Conducted staff meetings and performance evaluations with the owner, tracked sales and customer reviews, and adjusted recipes and menu items accordingly.',
   'Supported peak service for up to 300 customers while maintaining speed, organization and product consistency.',
   array['Complete menu incl. health-conscious and calorie-calculated items', 'Bar layout engineered for speed and efficiency', 'Supplier sourcing and negotiation', 'Recipe costing, inventory and waste control', 'Team training'],
   array['beverage-consulting', 'operations-consulting', 'training-team-development'],
   true, 'draft', 101),

  ('00000000-0000-4000-8000-000000000802', 'cherry-on-top-menu-engineering', 'Cherry on top — Menu Engineering', 'beverage_programs',
   'Cherry on top', 'Hrajel, Lebanon', '2026',
   'A complete menu engineered around the existing crêpe and fruit-cocktail range for better cohesion and efficiency.',
   'Create a complete menu that improves menu cohesion and operational efficiency using the existing product range.',
   'Consultant',
   'Engineered a complete menu by cross-utilizing ingredients from the existing crêpe and fruit-cocktail range. Trained staff on menu preparation, consistency and service standards. Calculated item costs, established menu pricing and recommended suppliers based on quality, pricing and operational needs.',
   null,
   array['Menu engineering with ingredient cross-utilization', 'Item costing and pricing', 'Supplier recommendations', 'Staff training'],
   array['beverage-consulting', 'training-team-development'],
   true, 'draft', 102)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 3. Contact details in Site settings
--    (WhatsApp is left empty - confirm the number Anthony uses for WhatsApp first.)
-- -----------------------------------------------------------------------------
update public.site_settings
set email    = 'anthony.h2719@gmail.com',
    phone    = '+961 71 668 252',
    location = 'Lebanon'
where id = 1;

-- -----------------------------------------------------------------------------
-- 4. Page text corrected / filled in from the CV
-- -----------------------------------------------------------------------------
insert into public.content_blocks (page, key, label, value, kind, sort_order)
values
  ('home', 'about.stats', 'Credibility indicators (Value | label, one per line)',
   '5+ | Years in Hospitality
11 | Consulting Projects
Menus | Development & Costing
Teams | Training & Development',
   'textarea', 18),

  ('about', 'story.body', 'Story - text (blank line between paragraphs)',
   'Anthony''s career began behind the espresso machine as a barista at Vee Coffee Shop in Byblos, and grew through bartending and head-bartender roles into bar and general management across Byblos, Batroun and Jounieh.

Along the way he has managed bar, floor and kitchen operations, built signature cocktail menus using house-made syrups, cordials, infusions and fat-washes, designed ergonomic bar layouts, and put costing, inventory and waste-control systems in place.

Since 2022 he has also worked as a coffee and beverage consultant for cafés and venues across Lebanon - from concept and menu engineering to supplier negotiation, staff training and opening support.

Today he is Bar Manager at Edde Sands in Byblos, leading bar operations across three outlets, and the founder of The Alchemist, a seasonal liqueur brand. He works in Arabic, French and English.',
   'textarea', 4)
on conflict (page, key) do update
  set value = excluded.value;

commit;
