import { Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

// First load of the admin, while the session and admin rights are checked.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-svh flex-col items-center justify-center gap-6">
      <Logo compact className="h-12" />
      <Loader2 className="size-6 animate-spin text-olive-deep" aria-hidden />
      <span className="sr-only">Loading admin…</span>
    </div>
  );
}
