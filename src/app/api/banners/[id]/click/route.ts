import { NextResponse, type NextRequest } from "next/server";
import { getBanners } from "@/lib/data";
import { LIMITS, getClientIp, hashId, rateLimit } from "@/lib/rate-limit";
import { getServiceClient } from "@/lib/supabase/clients";
import type { BannerPlacement } from "@/lib/types";
import { SITE_URL } from "@/lib/utils";

const PLACEMENTS: BannerPlacement[] = ["top_bar", "home_horizontal", "mid_content", "event_sponsor", "footer_partner"];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const from = request.nextUrl.searchParams.get("from")?.slice(0, 100) ?? null;

  // Only live banners can be clicked through (prevents open redirects).
  let all: Awaited<ReturnType<typeof getBanners>>;
  try {
    all = (await Promise.all(PLACEMENTS.map((p) => getBanners(p)))).flat();
  } catch {
    // Database unavailable: send the visitor home instead of an error.
    return NextResponse.redirect(new URL("/", SITE_URL));
  }
  const banner = all.find((b) => b.id === id);
  if (!banner?.destination_url) return NextResponse.redirect(new URL("/", SITE_URL));

  let target: URL;
  try {
    target = new URL(banner.destination_url, SITE_URL);
    if (!["http:", "https:"].includes(target.protocol)) throw new Error("bad protocol");
  } catch {
    return NextResponse.redirect(new URL("/", SITE_URL));
  }
  if (banner.utm_source) target.searchParams.set("utm_source", banner.utm_source);
  if (banner.utm_medium) target.searchParams.set("utm_medium", banner.utm_medium);
  if (banner.utm_campaign) target.searchParams.set("utm_campaign", banner.utm_campaign);

  // Count at most one click per visitor (IP) per banner per hour, so scripts
  // can't inflate a sponsor's numbers. The visitor is redirected either way.
  const db = getServiceClient();
  const ip = getClientIp(request.headers);
  if (db && ip) {
    const { allowed } = await rateLimit(`banner:${banner.id}:${hashId(ip)}`, LIMITS.bannerClick);
    if (allowed) {
      const { error } = await db.from("banner_clicks").insert({ banner_id: banner.id, page: from });
      if (error) console.error("[banner click]", error.message);
    }
  }

  return NextResponse.redirect(target, 302);
}
