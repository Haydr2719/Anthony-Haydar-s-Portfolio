# Archived SQL (dev history)

`dev-history/` holds the step-by-step SQL files that were run on the **development**
database while the site was being built (0001–0011, including sample data and the
fix-ups that replaced it).

**Do not run these on production.** For a new database, run only the four files in
`supabase/migrations/` (01 → 04). They contain the same final structure and the real
content, without the samples.

The development database already has everything these files did, so there's nothing
to re-run there either.
