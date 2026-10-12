"use client";

import { Unavailable } from "@/components/site/unavailable";

// The site layout itself failed (it loads settings & services), so no header/footer here.
export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <Unavailable error={error} retry={retry} showLogo />;
}
