-- =============================================================================
-- Anthony Haydar Website - 0010 Clearer headings: Career vs Client Projects
-- Run after 0009 (safe to re-run).
--
-- Renames the About page "Experience" section to "Career & credentials" and the
-- Portfolio "Projects" section to "Client Projects", so the two aren't confused.
-- Each heading is only changed if it still has the original default wording -
-- anything already edited in the admin is left as it is.
-- =============================================================================

begin;

-- About page: career timeline
update public.content_blocks
set value = 'Career & credentials', label = 'Career & credentials - heading'
where page = 'about' and key = 'experience.title' and value = 'Selected experience & credentials';

update public.content_blocks
set value = 'The roles and qualifications behind Anthony''s hands-on background in hospitality, beverages and operations.',
    label = 'Career & credentials - intro'
where page = 'about' and key = 'experience.text' and value = 'A hands-on background across hospitality, beverages and operations.';

-- Portfolio: client projects
update public.content_blocks
set value = 'Client Projects', label = 'Client projects - heading'
where page = 'portfolio' and key = 'projects.title' and value = 'Projects';

update public.content_blocks
set value = 'Consulting and project work for venues and brands - the brief, Anthony''s role and the outcome.',
    label = 'Client projects - intro'
where page = 'portfolio' and key = 'projects.text' and value = 'Hospitality operations, beverage programs, openings and training work.';

-- Page names used for SEO titles (e.g. "Client Projects | Anthony Haydar")
update public.pages set title = 'Client Projects' where slug = 'portfolio-projects' and title = 'Projects';

commit;
