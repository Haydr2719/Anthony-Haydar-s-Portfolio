import { RecordForm } from "@/components/admin/record-form";
import { AdminHeader } from "@/components/admin/ui";
import { fallbackSettings } from "@/content/fallback";
import { requireAdmin } from "@/lib/cms/auth";
import { SETTINGS_FIELDS } from "@/lib/cms/collections";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <AdminHeader title="Site settings" description="Contact details, social links, homepage hero media and SEO defaults." />
      <RecordForm singular="Settings" fields={SETTINGS_FIELDS} initial={data ?? { ...fallbackSettings }} uploadFolder="site-settings" />
    </>
  );
}
