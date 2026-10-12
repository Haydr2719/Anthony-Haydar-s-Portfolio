import { PageSkeleton } from "@/components/skeleton";

// Shown inside the site layout (header/footer stay visible) while a public page loads.
export default function Loading() {
  return <PageSkeleton />;
}
