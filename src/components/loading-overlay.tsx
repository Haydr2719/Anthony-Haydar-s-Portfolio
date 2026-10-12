"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Small centred "working on it" card over a dimmed backdrop.
 * Rendered into <body> (portal) so it always centres on the screen, and blocks
 * clicks while shown. Announced to screen readers.
 */
export function LoadingOverlay({ show, label = "Loading…" }: { show: boolean; label?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !show) return null;

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label={label}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/35 px-6 backdrop-blur-[2px] animate-[overlay-in_200ms_ease-out]"
    >
      <div className="flex items-center gap-4 rounded-2xl bg-paper px-6 py-5 shadow-[0_24px_60px_-20px_rgba(31,31,29,0.55)]">
        <Loader2 className="size-6 animate-spin text-olive-deep" aria-hidden />
        <p className="text-sm font-medium text-ink" aria-live="assertive">
          {label}
        </p>
      </div>
    </div>,
    document.body,
  );
}
