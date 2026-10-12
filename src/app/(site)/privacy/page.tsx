import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("privacy", "/privacy");
}

export default function PrivacyPage() {
  return <LegalPage slug="privacy" blockKey="privacy.body" />;
}
