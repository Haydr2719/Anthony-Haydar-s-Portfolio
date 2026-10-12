import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("cookies", "/cookies");
}

export default function CookiesPage() {
  return <LegalPage slug="cookies" blockKey="cookies.body" />;
}
