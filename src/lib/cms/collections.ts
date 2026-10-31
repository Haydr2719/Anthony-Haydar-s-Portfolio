// Declarative definition of every CMS content type. The admin list, form and
// save logic are generated from this file - add a field here (and a column in
// SQL) and it appears in the admin automatically.
import {
  BANNER_PAGES,
  BANNER_PLACEMENTS,
  DRINK_CATEGORIES,
  EVENT_STATUSES,
  EVENT_TYPES,
  EXPERIENCE_KINDS,
  MEDIA_ORIENTATIONS,
  PARTNER_KINDS,
  PROGRAM_KINDS,
  PROJECT_CATEGORIES,
} from "@/lib/options";

export type FieldType =
  | "text"
  | "textarea"
  | "slug"
  | "select"
  | "multiselect"
  | "boolean"
  | "number"
  | "datetime"
  | "image"
  | "video"
  | "url"
  | "list"
  | "faq"
  | "schedule"
  | "relation";

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: readonly Option[];
  rows?: number;
  /** slug: field to generate the slug from */
  source?: string;
  /** relation / multiselect from another table */
  relation?: { table: string; label: string; value?: string };
  /** section heading in the form */
  group?: string;
  half?: boolean;
  readOnly?: boolean;
  /** image / video upload fields: which files to accept */
  accept?: "image" | "video" | "any";
}

export interface CollectionDef {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  fields: FieldDef[];
  /** column shown as the row title */
  titleField: string;
  /** optional thumbnail column */
  imageField?: string;
  /** extra columns in the list */
  columns?: { name: string; label: string; options?: readonly Option[] }[];
  /** has status (draft/published) + publish_at */
  publishable?: boolean;
  /** has sort_order (manual ordering) */
  sortable?: boolean;
  /** primary key column */
  idField?: string;
  canCreate?: boolean;
  canDelete?: boolean;
  /** default ordering for the list */
  orderBy?: { column: string; ascending: boolean };
  /** folder inside the "media" storage bucket for this type's uploads (defaults to `key`) */
  storageFolder?: string;
  /** public URL of an entry (for "View on site") */
  publicPath?: (row: Record<string, unknown>) => string | null;
}

const seo: FieldDef[] = [
  { name: "seo_title", label: "SEO title", type: "text", group: "SEO & sharing", help: "Defaults to the title if empty (ideally under 60 characters)." },
  { name: "seo_description", label: "Meta description", type: "textarea", rows: 2, group: "SEO & sharing", help: "Shown in Google results (ideally 140-160 characters)." },
  { name: "og_image", label: "Social sharing image", type: "image", group: "SEO & sharing", help: "1200 × 630 px recommended. Defaults to the cover image." },
];

export const COLLECTIONS: CollectionDef[] = [
  {
    key: "services",
    table: "services",
    label: "Services",
    singular: "Service",
    description: "The consultancy pillars shown on the Consultancy pages.",
    titleField: "title",
    imageField: "cover_image",
    columns: [{ name: "slug", label: "URL" }],
    publishable: true,
    sortable: true,
    canCreate: true,
    canDelete: true,
    publicPath: (r) => `/consultancy/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", source: "title", required: true },
      { name: "tagline", label: "Short tagline", type: "text", help: "Shown on service cards." },
      { name: "summary", label: "Summary", type: "textarea", rows: 3 },
      { name: "problem", label: "The problem it solves", type: "textarea", rows: 4, group: "Page content" },
      { name: "audience", label: "Who it is for", type: "textarea", rows: 3, group: "Page content" },
      { name: "included", label: "What's included", type: "list", group: "Page content", help: "One item per line." },
      { name: "approach", label: "How Anthony works", type: "textarea", rows: 4, group: "Page content" },
      { name: "deliverables", label: "Possible deliverables", type: "list", group: "Page content", help: "One item per line." },
      { name: "faqs", label: "FAQ", type: "faq", group: "Page content" },
      { name: "cta_label", label: "Call-to-action label", type: "text", group: "Page content", help: 'e.g. "Request training"' },
      { name: "cover_image", label: "Cover image", type: "image", group: "Media" },
      { name: "cover_video", label: "Video", type: "video", group: "Media", help: "Upload an MP4 or paste a YouTube / Vimeo link." },
      ...seo,
    ],
  },
  {
    key: "projects",
    table: "projects",
    label: "Portfolio Projects",
    singular: "Portfolio project",
    description:
      "Client work shown on the website under Portfolio → Client Projects: the brief, Anthony's role, what was done and the outcome. (Jobs and qualifications go in Career & Credentials.)",
    titleField: "title",
    imageField: "cover_image",
    columns: [
      { name: "category", label: "Category", options: PROJECT_CATEGORIES },
      { name: "featured", label: "Featured" },
    ],
    publishable: true,
    sortable: true,
    canCreate: true,
    canDelete: true,
    // Hidden in the admin while Settings -> "Show client project detail pages" is off.
    publicPath: (r) => `/portfolio/projects/${r.slug}`,
    fields: [
      { name: "title", label: "Project name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", source: "title", required: true },
      { name: "category", label: "Category", type: "select", options: PROJECT_CATEGORIES, required: true, half: true },
      { name: "featured", label: "Feature on homepage", type: "boolean", half: true },
      { name: "client_name", label: "Client / brand", type: "text", half: true, help: "Only approved client names." },
      { name: "location", label: "Location", type: "text", half: true },
      { name: "year", label: "Year", type: "text", half: true },
      { name: "summary", label: "Summary", type: "textarea", rows: 3 },
      { name: "brief", label: "The brief", type: "textarea", rows: 4, group: "Case study" },
      { name: "role", label: "Anthony's role", type: "text", group: "Case study" },
      { name: "work_done", label: "What was done", type: "textarea", rows: 5, group: "Case study" },
      { name: "outcome", label: "Outcome", type: "textarea", rows: 4, group: "Case study" },
      { name: "highlights", label: "Highlights", type: "list", group: "Case study", help: "One per line." },
      { name: "service_slugs", label: "Related services", type: "multiselect", relation: { table: "services", label: "title", value: "slug" }, group: "Case study" },
      { name: "cover_image", label: "Cover image", type: "image", group: "Media" },
      { name: "cover_video", label: "Video", type: "video", group: "Media" },
      { name: "before_image", label: "Before image", type: "image", group: "Media", half: true },
      { name: "after_image", label: "After image", type: "image", group: "Media", half: true },
      ...seo,
    ],
  },
  {
    key: "drinks",
    table: "drinks",
    label: "Drinks & Concepts",
    singular: "Drink / Concept",
    description: "Drinks and beverage concepts. Do not publish proprietary recipes unless approved.",
    titleField: "name",
    imageField: "image",
    columns: [
      { name: "category", label: "Category", options: DRINK_CATEGORIES },
      { name: "featured", label: "Featured" },
    ],
    publishable: true,
    sortable: true,
    canCreate: true,
    canDelete: true,
    publicPath: (r) => `/portfolio/drinks/${r.slug}`,
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", source: "name", required: true },
      { name: "category", label: "Category", type: "select", options: DRINK_CATEGORIES, required: true, half: true },
      { name: "featured", label: "Feature on homepage", type: "boolean", half: true },
      { name: "concept", label: "Concept", type: "textarea", rows: 3 },
      { name: "context", label: "Context / story", type: "textarea", rows: 4 },
      { name: "venue_brand", label: "Venue / brand", type: "text", half: true },
      { name: "role", label: "Anthony's role", type: "text", half: true },
      { name: "image", label: "Image", type: "image", group: "Media" },
      { name: "video_url", label: "Video", type: "video", group: "Media" },
      ...seo,
    ],
  },
  {
    key: "programs",
    table: "programs",
    label: "Training & Workshops",
    singular: "Program / Workshop",
    storageFolder: "training-workshops",
    description: "Training programs, workshops, masterclasses and corporate training.",
    titleField: "title",
    imageField: "cover_image",
    columns: [
      { name: "kind", label: "Type", options: PROGRAM_KINDS },
      { name: "event_status", label: "Booking status", options: EVENT_STATUSES },
      { name: "start_at", label: "Date" },
    ],
    publishable: true,
    sortable: true,
    canCreate: true,
    canDelete: true,
    publicPath: (r) => `/training-events/workshops/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", source: "title", required: true },
      { name: "kind", label: "Type", type: "select", options: PROGRAM_KINDS, required: true, half: true },
      { name: "event_status", label: "Booking status", type: "select", options: EVENT_STATUSES, half: true, help: "Leave empty for ongoing programs." },
      { name: "featured", label: "Feature on homepage", type: "boolean" },
      { name: "topic", label: "Topic", type: "text", half: true },
      { name: "trainer", label: "Trainer", type: "text", half: true },
      { name: "summary", label: "Summary", type: "textarea", rows: 3 },
      { name: "description", label: "Description", type: "textarea", rows: 6 },
      { name: "learning_outcomes", label: "Learning outcomes", type: "list", help: "One per line." },
      { name: "start_at", label: "Start", type: "datetime", group: "Date & place", half: true },
      { name: "end_at", label: "End", type: "datetime", group: "Date & place", half: true },
      { name: "format", label: "Format", type: "text", group: "Date & place", half: true, help: "e.g. On-site, small group" },
      { name: "duration", label: "Duration", type: "text", group: "Date & place", half: true },
      { name: "venue", label: "Venue", type: "text", group: "Date & place", half: true },
      { name: "city", label: "City", type: "text", group: "Date & place", half: true },
      { name: "capacity", label: "Capacity", type: "number", group: "Date & place", half: true },
      { name: "price_label", label: "Price (optional)", type: "text", group: "Date & place", half: true, help: "Leave empty to hide prices." },
      { name: "booking_url", label: "External booking link (optional)", type: "url", group: "Date & place", help: "Otherwise visitors use the enquiry form." },
      { name: "cover_image", label: "Cover image", type: "image", group: "Media" },
      ...seo,
    ],
  },
  {
    key: "events",
    table: "events",
    label: "Events",
    singular: "Event",
    description: 'Events and trade shows. Tick "Landing page" for HORECA-style QR pages (short link: /e/your-slug).',
    titleField: "title",
    imageField: "cover_image",
    columns: [
      { name: "event_status", label: "Status", options: EVENT_STATUSES },
      { name: "start_at", label: "Date" },
      { name: "is_landing", label: "Landing" },
    ],
    publishable: true,
    canCreate: true,
    canDelete: true,
    orderBy: { column: "start_at", ascending: false },
    publicPath: (r) => `/training-events/events/${r.slug}`,
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", source: "title", required: true, help: "QR short link: /e/<slug>" },
      { name: "event_type", label: "Type", type: "select", options: EVENT_TYPES, required: true, half: true },
      { name: "event_status", label: "Status", type: "select", options: EVENT_STATUSES, required: true, half: true },
      {
        name: "featured",
        label: "Show first in homepage slideshow",
        type: "boolean",
        half: true,
        help: "All upcoming events appear in the homepage slideshow; ticked ones come first.",
      },
      { name: "is_landing", label: "Landing page (QR / trade show layout)", type: "boolean", half: true },
      { name: "summary", label: "Summary", type: "textarea", rows: 3 },
      { name: "description", label: "Description", type: "textarea", rows: 6 },
      { name: "start_at", label: "Start", type: "datetime", group: "Date & place", half: true },
      { name: "end_at", label: "End", type: "datetime", group: "Date & place", half: true },
      { name: "venue", label: "Venue", type: "text", group: "Date & place" },
      { name: "city", label: "City", type: "text", group: "Date & place", half: true },
      { name: "country", label: "Country", type: "text", group: "Date & place", half: true },
      { name: "booth", label: "Booth / meeting point", type: "text", group: "Date & place" },
      { name: "external_url", label: "Event website", type: "url", group: "Date & place" },
      { name: "schedule", label: "Anthony's schedule", type: "schedule", group: "Landing page" },
      { name: "meeting_cta_label", label: "Meeting button label", type: "text", group: "Landing page", help: 'Default: "Book a Meeting"' },
      { name: "cover_image", label: "Cover image", type: "image", group: "Media" },
      { name: "cover_video", label: "Video", type: "video", group: "Media" },
      ...seo,
    ],
  },
  {
    key: "media",
    table: "media_items",
    label: "Media Library",
    singular: "Media item",
    storageFolder: "media-library",
    description: "Photos and videos for the Media pages and galleries. Link an item to a project, drink, event or program to show it there.",
    titleField: "title",
    imageField: "url",
    columns: [
      { name: "type", label: "Type" },
      { name: "category", label: "Category" },
      { name: "featured", label: "Featured" },
    ],
    publishable: true,
    sortable: true,
    canCreate: true,
    canDelete: true,
    fields: [
      {
        name: "type",
        label: "Type",
        type: "select",
        required: true,
        half: true,
        options: [
          { value: "photo", label: "Photo" },
          { value: "video", label: "Video" },
        ],
      },
      { name: "orientation", label: "Orientation", type: "select", options: MEDIA_ORIENTATIONS, required: true, half: true },
      { name: "title", label: "Title", type: "text" },
      { name: "url", label: "Photo or video file", type: "image", accept: "any", help: "Upload an image (photo) or MP4 (video)." },
      { name: "video_url", label: "…or video link", type: "url", help: "YouTube, Vimeo or Instagram link (for videos)." },
      { name: "poster_url", label: "Video thumbnail", type: "image", half: true },
      { name: "mobile_url", label: "Mobile crop (optional)", type: "image", half: true },
      { name: "alt_text", label: "Alt text", type: "text", help: "Describe the image for screen readers and SEO." },
      { name: "caption", label: "Caption", type: "textarea", rows: 2 },
      { name: "credit", label: "Credit", type: "text", half: true },
      { name: "category", label: "Category", type: "text", half: true, help: "e.g. Behind the scenes, Training, Events, Press" },
      { name: "tags", label: "Tags", type: "list" },
      { name: "featured", label: "Feature on homepage / About", type: "boolean" },
      { name: "project_id", label: "Show on project", type: "relation", relation: { table: "projects", label: "title" }, group: "Link to content", half: true },
      { name: "drink_id", label: "Show on drink", type: "relation", relation: { table: "drinks", label: "name" }, group: "Link to content", half: true },
      { name: "event_id", label: "Show on event", type: "relation", relation: { table: "events", label: "title" }, group: "Link to content", half: true },
      { name: "program_id", label: "Show on program", type: "relation", relation: { table: "programs", label: "title" }, group: "Link to content", half: true },
    ],
  },
  {
    key: "banners",
    table: "banners",
    label: "Banners & Sponsors",
    singular: "Banner",
    description: "Advertising, sponsor and campaign banners. Empty zones collapse automatically.",
    titleField: "name",
    imageField: "desktop_image",
    columns: [
      { name: "placement", label: "Placement", options: BANNER_PLACEMENTS },
      { name: "is_active", label: "Active" },
      { name: "ends_at", label: "Ends" },
    ],
    sortable: true,
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "name", label: "Internal name", type: "text", required: true },
      { name: "placement", label: "Placement", type: "select", options: BANNER_PLACEMENTS, required: true, half: true },
      { name: "is_active", label: "Active", type: "boolean", half: true },
      { name: "sponsor_name", label: "Sponsor / advertiser", type: "text", half: true },
      { name: "cta_label", label: "Button label", type: "text", half: true },
      { name: "message", label: "Message", type: "textarea", rows: 2, help: "Used by the top bar and by banners without an image." },
      { name: "desktop_image", label: "Desktop creative", type: "image", group: "Creative", help: "Homepage / mid-content: approx. 1600 × 400 px. Sponsor strip: a logo." },
      { name: "mobile_image", label: "Mobile creative", type: "image", group: "Creative", help: "Approx. 800 × 600 px." },
      { name: "alt_text", label: "Alt text", type: "text", group: "Creative" },
      { name: "destination_url", label: "Destination URL", type: "url", group: "Link & tracking" },
      { name: "open_in_new_tab", label: "Open in a new tab", type: "boolean", group: "Link & tracking" },
      { name: "utm_source", label: "utm_source", type: "text", group: "Link & tracking", half: true },
      { name: "utm_medium", label: "utm_medium", type: "text", group: "Link & tracking", half: true },
      { name: "utm_campaign", label: "utm_campaign", type: "text", group: "Link & tracking" },
      { name: "starts_at", label: "Start", type: "datetime", group: "Schedule & targeting", half: true },
      { name: "ends_at", label: "End", type: "datetime", group: "Schedule & targeting", half: true },
      { name: "target_pages", label: "Mid-content: show on", type: "multiselect", options: BANNER_PAGES, group: "Schedule & targeting", help: "Leave empty for all pages." },
      { name: "event_id", label: "Event sponsor: only on this event", type: "relation", relation: { table: "events", label: "title" }, group: "Schedule & targeting" },
    ],
  },
  {
    key: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    description: "Only real, approved testimonials.",
    titleField: "author_name",
    columns: [{ name: "company", label: "Company" }],
    publishable: true,
    sortable: true,
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "quote", label: "Quote", type: "textarea", rows: 4, required: true },
      { name: "author_name", label: "Name", type: "text", required: true, half: true },
      { name: "author_role", label: "Role", type: "text", half: true },
      { name: "company", label: "Company", type: "text", half: true },
      { name: "featured", label: "Show on homepage", type: "boolean", half: true },
      { name: "avatar", label: "Photo", type: "image" },
    ],
  },
  {
    key: "partners",
    table: "partners",
    label: "Partners & Brands",
    singular: "Partner / Brand",
    description: "Client and partner logos (only with permission).",
    titleField: "name",
    imageField: "logo",
    columns: [{ name: "kind", label: "Type", options: PARTNER_KINDS }],
    publishable: true,
    sortable: true,
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "kind", label: "Type", type: "select", options: PARTNER_KINDS, required: true, half: true },
      { name: "show_on_home", label: "Show on homepage", type: "boolean", half: true },
      { name: "logo", label: "Logo", type: "image", help: "Transparent PNG or SVG." },
      { name: "website_url", label: "Website", type: "url" },
    ],
  },
  {
    key: "experience",
    table: "experience",
    label: "Career & Credentials",
    singular: "Career entry",
    description:
      "Anthony's jobs, roles, certifications and degrees, shown on the About page timeline. (Client projects go in Portfolio Projects.)",
    titleField: "title",
    columns: [
      { name: "kind", label: "Type", options: EXPERIENCE_KINDS },
      { name: "organization", label: "Organization" },
    ],
    publishable: true,
    sortable: true,
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "kind", label: "Type", type: "select", options: EXPERIENCE_KINDS, required: true },
      { name: "title", label: "Title / role", type: "text", required: true },
      { name: "organization", label: "Organization", type: "text", half: true },
      { name: "location", label: "Location", type: "text", half: true },
      { name: "start_label", label: "From", type: "text", half: true, help: 'e.g. "2019"' },
      { name: "end_label", label: "To", type: "text", half: true, help: 'e.g. "Present"' },
      { name: "description", label: "Description", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "pages",
    table: "pages",
    label: "Page SEO",
    singular: "Page",
    storageFolder: "seo",
    description: "Title, meta description and sharing image for each fixed page.",
    titleField: "title",
    idField: "slug",
    columns: [{ name: "slug", label: "Page" }],
    orderBy: { column: "slug", ascending: true },
    fields: [
      { name: "slug", label: "Page", type: "text", readOnly: true },
      { name: "title", label: "Page name", type: "text", required: true },
      ...seo.map((f) => ({ ...f, group: undefined })),
    ],
  },
];

export const SETTINGS_FIELDS: FieldDef[] = [
  { name: "site_name", label: "Site name", type: "text", required: true, half: true },
  { name: "tagline", label: "Tagline", type: "text", half: true },
  { name: "email", label: "Email", type: "text", group: "Contact details", half: true },
  { name: "phone", label: "Phone", type: "text", group: "Contact details", half: true },
  { name: "whatsapp", label: "WhatsApp number", type: "text", group: "Contact details", half: true, help: "International format, e.g. +961 3 123 456" },
  { name: "show_whatsapp_button", label: "Show WhatsApp button", type: "boolean", group: "Contact details", half: true },
  { name: "location", label: "Location line", type: "text", group: "Contact details" },
  { name: "booking_url", label: "Booking link (Calendly etc.)", type: "url", group: "Contact details" },
  { name: "instagram_url", label: "Instagram", type: "url", group: "Social links", half: true },
  { name: "linkedin_url", label: "LinkedIn", type: "url", group: "Social links", half: true },
  { name: "youtube_url", label: "YouTube", type: "url", group: "Social links", half: true },
  { name: "tiktok_url", label: "TikTok", type: "url", group: "Social links", half: true },
  // The homepage hero is a scroll animation built from image files in public/frames
  // (see README "Homepage hero"), so it has no settings here. The old hero_image /
  // hero_video columns still exist in the database but are no longer used.
  { name: "about_image", label: "About photo", type: "image", group: "About section", help: "Shown in the homepage About preview and on the About page." },
  { name: "about_video", label: "About video", type: "video", group: "About section", help: "Optional. Shown instead of the photo in the homepage About preview, and in the About page story." },
  { name: "default_seo_title", label: "Default SEO title", type: "text", group: "SEO defaults" },
  { name: "default_seo_description", label: "Default meta description", type: "textarea", rows: 2, group: "SEO defaults" },
  { name: "default_og_image", label: "Default sharing image", type: "image", group: "SEO defaults" },
  { name: "show_build_credit", label: 'Show Built Credit in footer', type: "boolean", group: "Footer" },
  {
    name: "show_project_details",
    label: "Show client project detail pages",
    type: "boolean",
    group: "Portfolio",
    help: "Off: projects are listed but can't be opened. On: visitors can open each project's full case study.",
  },
];

export function getCollection(key: string) {
  return COLLECTIONS.find((c) => c.key === key);
}
