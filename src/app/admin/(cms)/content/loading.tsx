import { AdminFormSkeleton } from "@/components/skeleton";

// Page text editor has no sidebar.
export default function Loading() {
  return <AdminFormSkeleton sidebar={false} />;
}
