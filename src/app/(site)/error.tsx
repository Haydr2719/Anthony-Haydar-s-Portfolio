"use client";

import { Unavailable } from "@/components/site/unavailable";

// A page failed to load (e.g. database unreachable on an uncached page). Header & footer stay visible.
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <Unavailable error={error} retry={retry} />;
}
