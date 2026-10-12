import Link from "next/link";
import { Logo } from "@/components/logo";

export default function RootNotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-paper px-5 text-center">
      <Logo stacked className="w-52" />
      <h1 className="text-4xl md:text-5xl">Page not found</h1>
      <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-olive-deep px-6 text-sm font-medium text-white hover:bg-ink">
        Back to home
      </Link>
    </main>
  );
}
