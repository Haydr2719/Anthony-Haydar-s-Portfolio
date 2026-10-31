// Row types mirror the Supabase tables in supabase/migrations/01_schema.sql.
// Nullable columns are optional so placeholder content can omit them.

export type Status = "draft" | "published";

interface Publishable {
  id: string;
  status: Status;
  publish_at?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

interface Seo {
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
}

export interface SiteSettings {
  id: 1;
  site_name: string;
  tagline?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  location?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  booking_url?: string | null;
  hero_image?: string | null;
  hero_mobile_image?: string | null;
  hero_video?: string | null;
  hero_poster?: string | null;
  about_image?: string | null;
  about_video?: string | null;
  default_seo_title?: string | null;
  default_seo_description?: string | null;
  default_og_image?: string | null;
  show_whatsapp_button: boolean;
  show_build_credit: boolean;
  /** Client project detail pages are public (Settings -> Portfolio). Missing = off. */
  show_project_details?: boolean;
}

export interface PageMeta extends Seo {
  slug: string;
  title: string;
}

export type BlockKind = "text" | "textarea" | "image" | "url";

export interface ContentBlock {
  id?: string;
  page: string;
  key: string;
  label: string;
  value: string;
  kind: BlockKind;
  help?: string | null;
  sort_order: number;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Service extends Publishable, Seo {
  slug: string;
  title: string;
  tagline?: string | null;
  summary?: string | null;
  problem?: string | null;
  audience?: string | null;
  included: string[];
  approach?: string | null;
  deliverables: string[];
  faqs: Faq[];
  cta_label?: string | null;
  icon?: string | null;
  cover_image?: string | null;
  cover_video?: string | null;
}

export type ProjectCategory =
  | "hospitality_operations"
  | "beverage_programs"
  | "coffee_concepts"
  | "bar_cocktail"
  | "brand_collaborations"
  | "openings"
  | "training_workshops"
  | "events_trade";

export interface Project extends Publishable, Seo {
  slug: string;
  title: string;
  category: ProjectCategory;
  client_name?: string | null;
  location?: string | null;
  year?: string | null;
  summary?: string | null;
  brief?: string | null;
  role?: string | null;
  work_done?: string | null;
  outcome?: string | null;
  highlights: string[];
  service_slugs: string[];
  cover_image?: string | null;
  cover_video?: string | null;
  before_image?: string | null;
  after_image?: string | null;
  featured: boolean;
}

export type DrinkCategory =
  | "coffee"
  | "cocktail"
  | "non_alcoholic"
  | "signature"
  | "seasonal"
  | "brand_collaboration"
  | "coffee_shop"
  | "bar";

export interface Drink extends Publishable, Seo {
  slug: string;
  name: string;
  category: DrinkCategory;
  concept?: string | null;
  context?: string | null;
  venue_brand?: string | null;
  role?: string | null;
  image?: string | null;
  video_url?: string | null;
  featured: boolean;
}

export type EventStatus = "upcoming" | "registration_open" | "sold_out" | "completed";
export type ProgramKind = "training" | "workshop" | "masterclass" | "corporate";

export interface Program extends Publishable, Seo {
  slug: string;
  kind: ProgramKind;
  title: string;
  topic?: string | null;
  summary?: string | null;
  description?: string | null;
  learning_outcomes: string[];
  format?: string | null;
  duration?: string | null;
  trainer?: string | null;
  venue?: string | null;
  city?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  capacity?: number | null;
  price_label?: string | null;
  event_status?: EventStatus | null;
  booking_url?: string | null;
  cover_image?: string | null;
  featured: boolean;
}

export interface ScheduleItem {
  time: string;
  title: string;
  detail?: string;
}

export type EventType = "trade_show" | "industry_event" | "pop_up" | "competition" | "talk" | "other";

export interface EventItem extends Publishable, Seo {
  slug: string;
  title: string;
  event_type: EventType;
  event_status: EventStatus;
  start_at?: string | null;
  end_at?: string | null;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  summary?: string | null;
  description?: string | null;
  cover_image?: string | null;
  cover_video?: string | null;
  is_landing: boolean;
  booth?: string | null;
  schedule: ScheduleItem[];
  meeting_cta_label?: string | null;
  external_url?: string | null;
  featured: boolean;
}

export interface Testimonial extends Publishable {
  quote: string;
  author_name: string;
  author_role?: string | null;
  company?: string | null;
  avatar?: string | null;
  featured: boolean;
}

export interface Partner extends Publishable {
  name: string;
  kind: "client" | "partner" | "sponsor";
  logo?: string | null;
  website_url?: string | null;
  show_on_home: boolean;
}

export interface Experience extends Publishable {
  kind: "role" | "certification" | "milestone";
  title: string;
  organization?: string | null;
  location?: string | null;
  start_label?: string | null;
  end_label?: string | null;
  description?: string | null;
}

export interface MediaItem extends Publishable {
  type: "photo" | "video";
  title?: string | null;
  caption?: string | null;
  alt_text?: string | null;
  credit?: string | null;
  category?: string | null;
  tags: string[];
  url?: string | null;
  video_url?: string | null;
  poster_url?: string | null;
  mobile_url?: string | null;
  orientation: "landscape" | "portrait" | "square";
  featured: boolean;
  project_id?: string | null;
  drink_id?: string | null;
  event_id?: string | null;
  program_id?: string | null;
}

export type BannerPlacement =
  | "top_bar"
  | "home_horizontal"
  | "mid_content"
  | "event_sponsor"
  | "footer_partner";

export interface Banner {
  id: string;
  name: string;
  sponsor_name?: string | null;
  placement: BannerPlacement;
  message?: string | null;
  cta_label?: string | null;
  desktop_image?: string | null;
  mobile_image?: string | null;
  alt_text?: string | null;
  destination_url?: string | null;
  open_in_new_tab: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  target_pages: string[];
  event_id?: string | null;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  sort_order: number;
}

export type LeadType =
  | "consultation"
  | "training"
  | "workshop"
  | "partnership"
  | "event_invite"
  | "trade_meeting"
  | "general";

export type BusinessType =
  | "hotel"
  | "restaurant"
  | "cafe"
  | "bar"
  | "resort"
  | "beverage_brand"
  | "distributor"
  | "hospitality_group"
  | "other";

export interface Lead {
  id: string;
  lead_type: LeadType;
  name: string;
  company?: string | null;
  job_title?: string | null;
  email: string;
  phone?: string | null;
  country?: string | null;
  business_type?: BusinessType | null;
  service_interest?: string | null;
  message?: string | null;
  source_page?: string | null;
  event_id?: string | null;
  program_id?: string | null;
  consent: boolean;
  status: "new" | "contacted" | "qualified" | "won" | "lost" | "archived";
  notes?: string | null;
  created_at: string;
}
