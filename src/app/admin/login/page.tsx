import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/clients";

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo stacked className="w-52" />
        </div>
        <div className="rounded-lg border border-stone bg-white p-7">
          <h1 className="font-serif text-2xl">Website admin</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage content, banners and enquiries.</p>
          {!isSupabaseConfigured && (
            <p className="mt-5 rounded bg-paper-2 p-3 text-sm">
              Supabase is not configured yet. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to{" "}
              <code>.env.local</code> and restart the server.
            </p>
          )}
          {error === "not-admin" && (
            <p className="mt-5 rounded bg-red-50 p-3 text-sm text-red-800">
              This account is not an admin. Add it to the <code>admin_users</code> table (see README).
            </p>
          )}
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
