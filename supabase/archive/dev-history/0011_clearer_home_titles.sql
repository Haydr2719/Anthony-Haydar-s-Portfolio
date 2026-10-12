-- =============================================================================
-- Anthony Haydar Website - 0011 Clearer homepage section headings
-- Run after 0010 (safe to re-run).
--
--   "Selected Work"                               -> "Client Projects"
--   "Behind the bar, in the room, on the floor."  -> "Photos & Videos"
--
-- Only changes a heading if it still has the original default wording -
-- anything already edited in the admin is left as it is.
-- =============================================================================

begin;

update public.content_blocks
set value = 'Client Projects', label = 'Client projects - heading'
where page = 'home' and key = 'work.title' and value = 'Selected Work';

update public.content_blocks
set value = 'Recent consulting and project work for venues and brands.', label = 'Client projects - intro'
where page = 'home' and key = 'work.text' and value = 'Projects, programs and collaborations - the brief, the role and the outcome.';

update public.content_blocks
set value = 'Photos & Videos', label = 'Photos & videos - heading'
where page = 'home' and key = 'media.title' and value = 'Behind the bar, in the room, on the floor.';

update public.content_blocks
set label = 'Photos & videos - intro'
where page = 'home' and key = 'media.text';

commit;
