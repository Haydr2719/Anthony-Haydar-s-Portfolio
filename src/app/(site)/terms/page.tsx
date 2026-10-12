import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("terms", "/terms");
}

export default function TermsPage() {
  return <LegalPage slug="terms" blockKey="terms.body" />;
}
