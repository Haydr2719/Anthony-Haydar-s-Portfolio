import { NextResponse, type NextRequest } from "next/server";

// Short URL for QR codes on business cards / event material: /e/horeca -> event landing page.
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(`/training-events/events/${encodeURIComponent(slug)}`, request.url);
  url.searchParams.set("utm_source", "qr");
  url.searchParams.set("utm_medium", "offline");
  url.searchParams.set("utm_campaign", slug);
  return NextResponse.redirect(url, 307);
}
