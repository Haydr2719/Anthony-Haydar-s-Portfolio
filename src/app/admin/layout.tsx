import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Admin | Anthony Haydar" },
  robots: { index: false, follow: false },
  // Lets the admin be added to a phone's Home Screen (required for push notifications on iPhone).
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "AH Admin", statusBarStyle: "black-translucent" },
  icons: { apple: "/admin-icon.svg" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-paper-2 text-ink">{children}</div>;
}
