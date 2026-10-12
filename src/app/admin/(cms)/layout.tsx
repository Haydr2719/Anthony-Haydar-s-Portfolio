import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/cms/auth";
import { COLLECTIONS } from "@/lib/cms/collections";

export const dynamic = "force-dynamic";

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const { count: newLeads } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new");

  const links = [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/leads", label: "Enquiries", icon: "inbox", badge: newLeads ?? 0 },
    { href: "/admin/content", label: "Page text", icon: "text" },
    ...COLLECTIONS.map((c) => ({ href: `/admin/${c.key}`, label: c.label, icon: c.key })),
    { href: "/admin/settings", label: "Site settings", icon: "settings" },
  ];

  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[250px_1fr]">
      <AdminNav links={links} email={user.email ?? ""} />
      <div className="min-w-0 px-4 py-6 md:px-8 md:py-10">{children}</div>
    </div>
  );
}
