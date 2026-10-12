import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/clients";
import { createAuthClient } from "@/lib/supabase/server";

/** Returns the signed-in admin's Supabase client, or redirects to the login page. */
export async function requireAdmin() {
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // RLS only lets admins read admin_users, so a row back means "is admin".
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=not-admin");

  return { supabase, user };
}
