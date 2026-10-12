import Link from "next/link";
import { BlocksForm } from "@/components/admin/blocks-form";
import { AdminHeader } from "@/components/admin/ui";
import { fallbackBlocks } from "@/content/fallback";
import { requireAdmin } from "@/lib/cms/auth";
import type { ContentBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGES = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "consultancy", label: "Consultancy" },
  { key: "portfolio", label: "Portfolio" },
  { key: "training-events", label: "Training & Events" },
  { key: "media", label: "Media" },
  { key: "contact", label: "Contact" },
  { key: "legal", label: "Legal pages" },
];

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ContentPage({ searchParams }: Props) {
  const { page: requested } = await searchParams;
  const page = PAGES.some((p) => p.key === requested) ? requested! : "home";
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("content_blocks").select("*").eq("page", page).order("sort_order");

  // Code defines which blocks exist; the database holds the edited values.
  const saved = new Map(((data ?? []) as ContentBlock[]).map((b) => [b.key, b]));
  const blocks = fallbackBlocks
    .filter((b) => b.page === page)
    .map((b) => ({ ...b, value: saved.get(b.key)?.value ?? b.value }));

  return (
    <>
      <AdminHeader
        title="Page text"
        description='Headlines and copy for each page. Lists use one item per line; "Title | description" lines are split into two parts.'
      />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {PAGES.map((p) => (
          <Link
            key={p.key}
            href={`/admin/content?page=${p.key}`}
            className={cn(
              "shrink-0 rounded-md border px-3 py-2 text-sm",
              p.key === page ? "border-ink bg-ink text-paper" : "border-stone bg-white hover:border-ink",
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>
      <BlocksForm key={page} page={page} blocks={blocks} />
    </>
  );
}
