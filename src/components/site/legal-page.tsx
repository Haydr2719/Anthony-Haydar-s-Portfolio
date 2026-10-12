import { Prose } from "@/components/ui";
import { getBlocks, getPageMeta } from "@/lib/data";

export async function LegalPage({ slug, blockKey }: { slug: string; blockKey: string }) {
  const [b, page] = await Promise.all([getBlocks("legal"), getPageMeta(slug)]);
  return (
    <section className="bg-paper py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <h1 className="text-5xl md:text-6xl">{page?.title}</h1>
        <Prose paragraphs={b.paragraphs(blockKey)} className="mt-10" />
      </div>
    </section>
  );
}
