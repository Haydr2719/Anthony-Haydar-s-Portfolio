-- =============================================================================
-- Anthony Haydar Website - 05 Drink categories: Coffee Shop + Bar
-- Run on EXISTING databases (development and production). Safe to re-run.
-- (New databases already get these from 01_schema.sql; running this too is harmless.)
--
-- Allows the two new drink categories added in src/lib/options.ts. The list
-- below must match DRINK_CATEGORIES there - a value missing here makes saving
-- a drink with that category fail.
-- =============================================================================

-- Replace whatever check constraint currently limits drinks.category (its name
-- may differ between databases) with one named, complete list.
do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.drinks'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table public.drinks drop constraint %I', c.conname);
  end loop;
end;
$$;

alter table public.drinks
  add constraint drinks_category_check check (category in (
    'coffee', 'cocktail', 'non_alcoholic', 'signature', 'seasonal', 'brand_collaboration',
    'coffee_shop', 'bar'));

-- Check: should list all 8 categories.
select pg_get_constraintdef(oid) as allowed_categories
from pg_constraint
where conrelid = 'public.drinks'::regclass and conname = 'drinks_category_check';
