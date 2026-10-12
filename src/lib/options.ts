// Shared option lists and human labels (used by the public site, the form and the admin CMS).

export const PROJECT_CATEGORIES = [
  { value: "hospitality_operations", label: "Hospitality & Operations" },
  { value: "beverage_programs", label: "Beverage Programs & Menus" },
  { value: "coffee_concepts", label: "Coffee Concepts" },
  { value: "bar_cocktail", label: "Bar & Cocktail Programs" },
  { value: "brand_collaborations", label: "Brand Collaborations" },
  { value: "openings", label: "Openings & Pre-opening" },
  { value: "training_workshops", label: "Training & Workshops" },
  { value: "events_trade", label: "Events & Trade Shows" },
] as const;

export const DRINK_CATEGORIES = [
  { value: "coffee", label: "Coffee" },
  { value: "cocktail", label: "Cocktails" },
  { value: "non_alcoholic", label: "Non-alcoholic" },
  { value: "signature", label: "Signatures" },
  { value: "seasonal", label: "Seasonal" },
  { value: "brand_collaboration", label: "Brand Collaborations" },
] as const;

export const EVENT_STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "registration_open", label: "Registration Open" },
  { value: "sold_out", label: "Sold Out" },
  { value: "completed", label: "Completed" },
] as const;

export const EVENT_TYPES = [
  { value: "trade_show", label: "Trade Show" },
  { value: "industry_event", label: "Industry Event" },
  { value: "pop_up", label: "Pop-up / Guest Shift" },
  { value: "competition", label: "Competition" },
  { value: "talk", label: "Talk / Panel" },
  { value: "other", label: "Other" },
] as const;

export const PROGRAM_KINDS = [
  { value: "training", label: "Training Program" },
  { value: "workshop", label: "Workshop" },
  { value: "masterclass", label: "Masterclass" },
  { value: "corporate", label: "Corporate / Custom Training" },
] as const;

export const BANNER_PLACEMENTS = [
  { value: "top_bar", label: "Top announcement bar" },
  { value: "home_horizontal", label: "Homepage horizontal banner" },
  { value: "mid_content", label: "Mid-content banner" },
  { value: "event_sponsor", label: "Event sponsor strip" },
  { value: "footer_partner", label: "Footer partner banner" },
] as const;

export const BANNER_PAGES = [
  { value: "consultancy", label: "Consultancy" },
  { value: "portfolio", label: "Portfolio" },
  { value: "training-events", label: "Training & Events" },
  { value: "media", label: "Media" },
] as const;

export const BUSINESS_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "bar", label: "Bar" },
  { value: "resort", label: "Resort" },
  { value: "beverage_brand", label: "Beverage Brand" },
  { value: "distributor", label: "Distributor" },
  { value: "hospitality_group", label: "Hospitality Group" },
  { value: "other", label: "Other" },
] as const;

export const LEAD_TYPES = [
  { value: "consultation", label: "Book a Consultation" },
  { value: "training", label: "Request Training" },
  { value: "workshop", label: "Book a Workshop / Masterclass" },
  { value: "partnership", label: "Discuss a Brand Partnership" },
  { value: "event_invite", label: "Invite Anthony to an Event" },
  { value: "trade_meeting", label: "Book a Meeting at a Trade Event" },
  { value: "general", label: "General Enquiry" },
] as const;

export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "archived", label: "Archived" },
] as const;

export const MEDIA_ORIENTATIONS = [
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait / Vertical (reels)" },
  { value: "square", label: "Square" },
] as const;

export const PARTNER_KINDS = [
  { value: "client", label: "Client" },
  { value: "partner", label: "Brand Partner" },
  { value: "sponsor", label: "Sponsor" },
] as const;

export const EXPERIENCE_KINDS = [
  { value: "role", label: "Role / Position" },
  { value: "certification", label: "Certification / Credential" },
  { value: "milestone", label: "Milestone" },
] as const;

type Opt = { readonly value: string; readonly label: string };
export function labelOf(list: readonly Opt[], value: string | null | undefined): string {
  return list.find((o) => o.value === value)?.label ?? value ?? "";
}
