import { ContactSkeleton } from "@/components/skeleton";

// The contact page is rendered per request (it reads ?type= / ?event=), so it gets its own skeleton.
export default function Loading() {
  return <ContactSkeleton />;
}
