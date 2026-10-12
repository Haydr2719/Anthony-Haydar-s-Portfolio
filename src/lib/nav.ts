import type { GalleryItem } from "@/components/media-client";
import type { MediaItem } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Story", href: "/about#story" },
      { label: "Mission & Vision", href: "/about#mission-vision" },
      { label: "Approach", href: "/about#approach" },
    ],
  },
  {
    label: "Consultancy",
    href: "/consultancy",
    children: [
      { label: "Beverage Consulting", href: "/consultancy/beverage-consulting" },
      { label: "Operations Consulting", href: "/consultancy/operations-consulting" },
      { label: "Training & Team Development", href: "/consultancy/training-team-development" },
      { label: "Brand & Commercial Support", href: "/consultancy/brand-commercial-support" },
    ],
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    children: [
      { label: "Client Projects", href: "/portfolio/projects" },
      { label: "Drinks & Concepts", href: "/portfolio/drinks" },
      { label: "Brand Collaborations", href: "/portfolio/collaborations" },
    ],
  },
  {
    label: "Training & Events",
    href: "/training-events",
    children: [
      { label: "Training", href: "/training-events/training" },
      { label: "Workshops", href: "/training-events/workshops" },
      { label: "Events", href: "/training-events/events" },
    ],
  },
  {
    label: "Media",
    href: "/media",
    children: [
      { label: "Photos", href: "/media/photos" },
      { label: "Videos", href: "/media/videos" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export function toGalleryItem(m: MediaItem): GalleryItem {
  return {
    id: m.id,
    type: m.type,
    src: m.url,
    videoUrl: m.video_url || (m.type === "video" ? m.url : null),
    poster: m.poster_url,
    alt: m.alt_text || m.title || m.caption || "Anthony Haydar media",
    title: m.title,
    caption: m.caption,
    credit: m.credit,
    orientation: m.orientation,
  };
}
