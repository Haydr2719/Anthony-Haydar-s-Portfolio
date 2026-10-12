// -----------------------------------------------------------------------------
// Starter content (real data from the brief and Anthony's CV - no samples).
//
// 1. `npm run seed:generate` turns this file into supabase/migrations/03_content.sql,
//    the content a new (production) database starts with. Anthony then edits
//    everything in the /admin CMS.
// 2. The site shows this content whenever Supabase is not configured (local
//    preview without a database).
// 3. The admin "Page text" editor uses fallbackBlocks to know which text boxes
//    exist (labels, order, one-line vs paragraph) - keep it in sync with the pages.
//
// Brief-based copy (services, headlines) and the legal-page placeholders should
// still be reviewed / approved before launch.
//
// NOTE: keep this file free of runtime imports (type imports only) - it is also
// loaded directly by Node in scripts/generate-seed.mjs.
// -----------------------------------------------------------------------------
import type {
  Banner,
  ContentBlock,
  Drink,
  EventItem,
  Experience,
  MediaItem,
  PageMeta,
  Partner,
  Program,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from "../lib/types";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const fallbackSettings: SiteSettings = {
  id: 1,
  site_name: "Anthony Haydar",
  tagline: "Beverage & Operations Consultant",
  // From Anthony's CV. WhatsApp and social profile links still to be confirmed.
  email: "anthony.h2719@gmail.com",
  phone: "+961 71 668 252",
  whatsapp: null,
  location: "Lebanon",
  instagram_url: null,
  linkedin_url: null,
  youtube_url: null,
  tiktok_url: null,
  booking_url: null,
  default_seo_title: "Anthony Haydar | Beverage & Operations Consultant",
  default_seo_description:
    "Strategic beverage and operations consultancy for hotels, restaurants, bars, cafés and beverage brands. Menus, systems, training and brand activation.",
  show_whatsapp_button: true,
  show_build_credit: true,
};

export const fallbackPages: PageMeta[] = [
  { slug: "home", title: "Home", seo_title: "Anthony Haydar | Beverage & Operations Consultant" },
  { slug: "about", title: "About", seo_description: "Anthony Haydar's story, mission, vision and consultancy approach." },
  { slug: "consultancy", title: "Consultancy", seo_description: "Beverage consulting, operations consulting, training & team development and brand & commercial support." },
  { slug: "portfolio", title: "Portfolio", seo_description: "Selected projects, beverage concepts and brand collaborations by Anthony Haydar." },
  { slug: "portfolio-projects", title: "Client Projects" },
  { slug: "portfolio-drinks", title: "Drinks & Concepts" },
  { slug: "portfolio-collaborations", title: "Brand Collaborations" },
  { slug: "training-events", title: "Training & Events", seo_description: "Hospitality training programs, workshops, masterclasses and industry events with Anthony Haydar." },
  { slug: "training", title: "Training" },
  { slug: "workshops", title: "Workshops & Masterclasses" },
  { slug: "events", title: "Events" },
  { slug: "media", title: "Media", seo_description: "Photos, videos and reels of Anthony Haydar at work, in training and at events." },
  { slug: "media-photos", title: "Photos" },
  { slug: "media-videos", title: "Videos" },
  { slug: "contact", title: "Contact", seo_description: "Book a consultation, request training or discuss a brand partnership with Anthony Haydar." },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms of Use" },
  { slug: "cookies", title: "Cookie Policy" },
];

// Editable text blocks. Lists use one item per line; "A | B" splits a line into two parts.
type B = Omit<ContentBlock, "sort_order" | "kind"> & { kind?: ContentBlock["kind"] };
const blocks = (page: string, items: Omit<B, "page">[]): ContentBlock[] =>
  items.map((b, i) => ({ kind: "text", ...b, page, sort_order: i }));

export const fallbackBlocks: ContentBlock[] = [
  ...blocks("home", [
    { key: "hero.eyebrow", label: "Hero - small heading", value: "Beverage & Operations Consultant" },
    { key: "hero.title", label: "Hero - headline", value: "Building stronger beverage programs, better operations and higher-performing hospitality teams.", kind: "textarea" },
    { key: "hero.text", label: "Hero - value proposition", value: "Strategic consultancy for hospitality businesses and beverage brands. From concept to execution, people to performance.", kind: "textarea" },
    { key: "hero.primary_cta", label: "Hero - main button", value: "Book a Consultation" },
    { key: "hero.secondary_cta", label: "Hero - second button", value: "Explore Services" },
    { key: "hero.phrases", label: "Hero - scroll phrases (one per line, the last one stays)", value: "Crafted with precision\nEvery pour tells a story\nThe art of alchemy\nLet's create something unforgettable", kind: "textarea" },
    { key: "expertise.items", label: "Expertise strip (one per line)", value: "Beverage Strategy\nOperations\nTraining\nBrand Activation", kind: "textarea" },
    { key: "services.title", label: "Services - heading", value: "Featured Services" },
    { key: "services.text", label: "Services - intro", value: "Four connected pillars that cover the full life of a beverage operation - from the first concept to a confident team on the floor.", kind: "textarea" },
    { key: "method.eyebrow", label: "Methodology - small heading", value: "My Methodology" },
    { key: "method.title", label: "Methodology - heading", value: "A clear path from first visit to lasting results." },
    { key: "method.steps", label: "Methodology - steps (Title | description, one per line)", value: "Assess | Understand your business, guests and numbers.\nBuild | Create tailored concepts, menus and systems.\nTrain | Develop people and teams to deliver them.\nImplement | Bring plans to life on the floor.\nOptimize | Measure, refine and keep growing.", kind: "textarea" },
    { key: "clients.title", label: "Who Anthony works with - heading", value: "Who Anthony Works With" },
    { key: "clients.items", label: "Who Anthony works with - list (one per line)", value: "Hotels\nRestaurants\nBars\nCafés\nResorts\nBeverage Brands\nDistributors\nHospitality Groups & Startups", kind: "textarea" },
    { key: "about.eyebrow", label: "About preview - small heading", value: "About Anthony Haydar" },
    { key: "about.title", label: "About preview - heading", value: "Experience behind the operation." },
    { key: "about.text", label: "About preview - text", value: "Anthony Haydar is a beverage and operations consultant with a hands-on background in hospitality, coffee, mixology and team development.\n\nHe helps hospitality businesses and beverage brands build stronger concepts, more efficient operations and high-performing teams through practical, real-world experience.", kind: "textarea" },
    { key: "about.cta", label: "About preview - button", value: "More About Anthony" },
    { key: "about.stats", label: "Credibility indicators (Value | label, one per line)", value: "5+ | Years in Hospitality\n11 | Consulting Projects\nMenus | Development & Costing\nTeams | Training & Development", kind: "textarea" },
    { key: "work.title", label: "Client projects - heading", value: "Client Projects" },
    { key: "work.text", label: "Client projects - intro", value: "Recent consulting and project work for venues and brands.", kind: "textarea" },
    { key: "drinks.title", label: "Drinks - heading", value: "Drinks & Concepts" },
    { key: "drinks.text", label: "Drinks - intro", value: "Signature serves, coffee programs and beverage concepts developed for venues and brands.", kind: "textarea" },
    { key: "training.title", label: "Training - heading", value: "Knowledge that raises the bar." },
    { key: "training.text", label: "Training - intro", value: "Workshops, masterclasses and corporate programs for baristas, bartenders, service teams and managers.", kind: "textarea" },
    { key: "event.eyebrow", label: "Event callout - small heading", value: "HORECA & Industry Events" },
    { key: "media.title", label: "Photos & videos - heading", value: "Photos & Videos" },
    { key: "media.text", label: "Photos & videos - intro", value: "A look at Anthony developing drinks, training teams and working events.", kind: "textarea" },
    { key: "testimonials.title", label: "Testimonials - heading", value: "What partners say" },
    { key: "contact.eyebrow", label: "Contact - small heading", value: "Get in touch" },
    { key: "contact.title", label: "Contact - heading", value: "Let's build something great together." },
    { key: "contact.text", label: "Contact - text", value: "Whether you're opening a new venue, improving operations, developing your team or exploring a brand partnership - let's talk.", kind: "textarea" },
  ]),
  ...blocks("about", [
    { key: "intro.eyebrow", label: "Intro - small heading", value: "About Anthony Haydar" },
    { key: "intro.title", label: "Intro - heading", value: "Hands-on hospitality experience, turned into business value." },
    { key: "intro.text", label: "Intro - text", value: "Anthony Haydar is a Beverage & Operations Consultant. He brings years behind the bar, the espresso machine and the pass into every engagement - so the advice is practical, commercially aware and built to work on a busy Friday night.", kind: "textarea" },
    { key: "story.title", label: "Story - heading", value: "The story" },
    { key: "story.body", label: "Story - text (blank line between paragraphs)", value: "Anthony's career began behind the espresso machine as a barista at Vee Coffee Shop in Byblos, and grew through bartending and head-bartender roles into bar and general management across Byblos, Batroun and Jounieh.\n\nAlong the way he has managed bar, floor and kitchen operations, built signature cocktail menus using house-made syrups, cordials, infusions and fat-washes, designed ergonomic bar layouts, and put costing, inventory and waste-control systems in place.\n\nSince 2022 he has also worked as a coffee and beverage consultant for cafés and venues across Lebanon - from concept and menu engineering to supplier negotiation, staff training and opening support.\n\nToday he is Bar Manager at Edde Sands in Byblos, leading bar operations across three outlets, and the founder of The Alchemist, a seasonal liqueur brand. He works in Arabic, French and English.", kind: "textarea" },
    { key: "mission.title", label: "Mission - heading", value: "Mission" },
    { key: "mission.body", label: "Mission - text", value: "To help hospitality businesses and beverage brands raise their standards through better beverage programs, clearer systems and confident, well-trained teams.", kind: "textarea" },
    { key: "vision.title", label: "Vision - heading", value: "Vision" },
    { key: "vision.body", label: "Vision - text", value: "To build a trusted consultancy and partnership network that shapes how beverage and hospitality operations are run across the region and beyond.", kind: "textarea" },
    { key: "approach.title", label: "Approach - heading", value: "The consultancy philosophy" },
    { key: "approach.text", label: "Approach - intro", value: "Great beverage operations happen where four things meet.", kind: "textarea" },
    { key: "approach.pillars", label: "Approach - pillars (Title | description, one per line)", value: "Beverage quality | Concepts, recipes and standards guests remember.\nSystems | SOPs, workflows and controls that make quality repeatable.\nPeople | Training and leadership that build confident teams.\nCommercial performance | Costing, pricing and sales behaviour that protect margins.", kind: "textarea" },
    { key: "values.title", label: "Values - heading", value: "Values" },
    { key: "values.items", label: "Values (Title | description, one per line)", value: "Practical | Advice built for real service conditions.\nHands-on | On the floor, behind the bar, with the team.\nCommercially aware | Every recommendation considers cost and revenue.\nQuality-focused | Standards that guests can taste and feel.\nPeople-focused | Teams that grow, stay and perform.\nAdaptable | Solutions sized to each business.", kind: "textarea" },
    { key: "experience.title", label: "Career & credentials - heading", value: "Career & credentials" },
    { key: "experience.text", label: "Career & credentials - intro", value: "The roles and qualifications behind Anthony's hands-on background in hospitality, beverages and operations.", kind: "textarea" },
    { key: "cta.title", label: "Closing CTA - heading", value: "Work with Anthony" },
    { key: "cta.text", label: "Closing CTA - text", value: "Tell Anthony about your venue, brand or team and book an initial consultation.", kind: "textarea" },
  ]),
  ...blocks("consultancy", [
    { key: "intro.eyebrow", label: "Intro - small heading", value: "Consultancy" },
    { key: "intro.title", label: "Intro - heading", value: "Practical expertise. Real results." },
    { key: "intro.text", label: "Intro - text", value: "Tailored consultancy for hospitality businesses and beverage brands - from concept development to team training and operational growth.", kind: "textarea" },
    { key: "cta.title", label: "Closing CTA - heading", value: "Solutions tailored to your business." },
    { key: "cta.text", label: "Closing CTA - text", value: "Every project is unique. Services are tailored to your goals, scale and stage of growth.", kind: "textarea" },
  ]),
  ...blocks("portfolio", [
    { key: "intro.title", label: "Intro - heading", value: "Proof of work." },
    { key: "intro.text", label: "Intro - text", value: "Projects, beverage concepts, menus and collaborations - each with the brief, Anthony's role and the outcome.", kind: "textarea" },
    { key: "projects.title", label: "Client projects - heading", value: "Client Projects" },
    { key: "projects.text", label: "Client projects - intro", value: "Consulting and project work for venues and brands - the brief, Anthony's role and the outcome.", kind: "textarea" },
    { key: "drinks.title", label: "Drinks - heading", value: "Drinks & Concepts" },
    { key: "drinks.text", label: "Drinks - intro", value: "An editorial selection of drinks and beverage concepts. Recipes are not published unless approved.", kind: "textarea" },
    { key: "collaborations.title", label: "Collaborations - heading", value: "Brand Collaborations" },
    { key: "collaborations.text", label: "Collaborations - intro", value: "Activations, launches, demonstrations and on-trade education with beverage brands.", kind: "textarea" },
  ]),
  ...blocks("training-events", [
    { key: "intro.title", label: "Intro - heading", value: "Knowledge that raises the bar." },
    { key: "intro.text", label: "Intro - text", value: "Training programs, workshops, masterclasses and industry events - for teams, brands and hospitality professionals.", kind: "textarea" },
    { key: "training.title", label: "Training - heading", value: "Training programs" },
    { key: "training.text", label: "Training - intro", value: "Structured programs for baristas, bartenders, service teams and managers.", kind: "textarea" },
    { key: "corporate.title", label: "Corporate training - heading", value: "Corporate & custom training" },
    { key: "corporate.text", label: "Corporate training - text", value: "Programs designed around your venue, your menu and your standards - delivered on-site, with practical assessment and follow-up.", kind: "textarea" },
    { key: "workshops.title", label: "Workshops - heading", value: "Workshops & masterclasses" },
    { key: "workshops.text", label: "Workshops - intro", value: "Small-group sessions on specific skills and topics.", kind: "textarea" },
    { key: "events.title", label: "Events - heading", value: "Events" },
    { key: "events.text", label: "Events - intro", value: "Trade shows, industry events and appearances - upcoming and past.", kind: "textarea" },
  ]),
  ...blocks("media", [
    { key: "intro.title", label: "Intro - heading", value: "Media" },
    { key: "intro.text", label: "Intro - text", value: "Professional photos, videos, reels and behind-the-scenes work.", kind: "textarea" },
    { key: "photos.title", label: "Photos - heading", value: "Photos" },
    { key: "videos.title", label: "Videos - heading", value: "Videos & reels" },
  ]),
  ...blocks("contact", [
    { key: "intro.eyebrow", label: "Intro - small heading", value: "Contact" },
    { key: "intro.title", label: "Intro - heading", value: "Let's build something great together." },
    { key: "intro.text", label: "Intro - text", value: "Whether you're opening a new venue, improving operations, developing your team or exploring a brand partnership - share a few details and Anthony will get back to you.", kind: "textarea" },
    { key: "success.title", label: "After submit - heading", value: "Thank you - your enquiry has been received." },
    { key: "success.text", label: "After submit - text", value: "Anthony will review your message and get back to you shortly, usually within two business days.", kind: "textarea" },
    { key: "consent.text", label: "Consent checkbox text", value: "I agree that my details may be stored and used to respond to this enquiry, as described in the Privacy Policy.", kind: "textarea" },
  ]),
  ...blocks("legal", [
    { key: "privacy.body", label: "Privacy policy (blank line between paragraphs)", value: "PLACEHOLDER - replace with the approved privacy policy before launch.\n\nThis website collects the information you submit through the enquiry form (such as your name, company, email and phone number) so that Anthony Haydar can respond to your enquiry.\n\nIf you accept analytics cookies, anonymous usage statistics are collected to improve the website.\n\nTo request access to or deletion of your data, contact us using the details on the Contact page.", kind: "textarea" },
    { key: "terms.body", label: "Terms of use", value: "PLACEHOLDER - replace with the approved terms of use before launch.\n\nAll content, images and videos on this website belong to Anthony Haydar or their respective owners and may not be reused without permission.", kind: "textarea" },
    { key: "cookies.body", label: "Cookie policy", value: "PLACEHOLDER - replace with the approved cookie policy before launch.\n\nEssential cookies keep the website working. Analytics and marketing cookies are only set if you accept them in the cookie banner. You can change your choice at any time using the \"Cookie settings\" link in the footer.", kind: "textarea" },
  ]),
];

const published = { status: "published" as const };

export const fallbackServices: Service[] = [
  {
    id: id(101),
    ...published,
    sort_order: 1,
    slug: "beverage-consulting",
    title: "Beverage Consulting",
    tagline: "Menus, programs and beverage strategy.",
    icon: "wine",
    summary: "Beverage concepts, menus and programs that guests remember - and that make commercial sense.",
    problem: "Menus that don't sell, inconsistent drinks, rising costs or a concept that doesn't match the venue. Beverage is often a venue's highest-margin category, yet it is rarely managed with the same rigour as the kitchen.",
    audience: "Hotels, restaurants, bars, cafés and resorts launching or relaunching a beverage offer, and groups that want consistency across outlets.",
    included: [
      "Beverage concept development",
      "Menu development and optimization",
      "Coffee and bar programs",
      "Product and supplier selection",
      "Costing, pricing and profitability",
      "Beverage program audits",
      "Launch / pre-opening beverage support",
    ],
    approach: "Anthony starts with an on-site assessment of the venue, guests, team and numbers, then builds the concept and menu with the team rather than for it - so it can be executed every shift.",
    deliverables: [
      "Beverage concept and positioning",
      "Menu structure, specs and costings",
      "Supplier and product recommendations",
      "Audit report with prioritised actions",
      "Launch plan and team briefing",
    ],
    faqs: [
      { question: "Do you work with existing menus or only new concepts?", answer: "Both. Many projects start with an audit of an existing menu, followed by targeted changes." },
      { question: "Will we own the recipes and specs?", answer: "Yes - deliverables created for your venue are handed over to your team." },
    ],
    cta_label: "Discuss your beverage program",
  },
  {
    id: id(102),
    ...published,
    sort_order: 2,
    slug: "operations-consulting",
    title: "Operations Consulting",
    tagline: "Systems, efficiency and profitable growth.",
    icon: "settings",
    summary: "Workflows, SOPs and controls that make great service repeatable and protect your margins.",
    problem: "Slow service, waste, unclear roles, stock that doesn't add up and standards that depend on who is working that day.",
    audience: "Operators preparing to open, venues that are growing quickly, and established businesses that need tighter control.",
    included: [
      "Operational assessment",
      "Workflow and service optimization",
      "SOP development",
      "Inventory and cost-control systems",
      "Team structure and role clarity",
      "Guest journey improvement",
      "Pre-opening / opening support",
    ],
    approach: "Observe service, map the workflow, find the bottlenecks, then design simple systems the team will actually use - and stay through implementation.",
    deliverables: [
      "Operational assessment report",
      "SOP and checklist library",
      "Inventory and cost-control templates",
      "Organisation chart and role descriptions",
      "Opening timeline and critical path",
    ],
    faqs: [
      { question: "How long does an operational assessment take?", answer: "Typically a few days on-site depending on the size of the operation, followed by a written report." },
    ],
    cta_label: "Improve your operation",
  },
  {
    id: id(103),
    ...published,
    sort_order: 3,
    slug: "training-team-development",
    title: "Training & Team Development",
    tagline: "Skills, mindset and high-performing teams.",
    icon: "users",
    summary: "Practical training that builds skill, confidence and consistency - from the espresso machine to leadership.",
    problem: "High turnover, inconsistent standards, missed upselling opportunities and supervisors promoted without leadership support.",
    audience: "Barista and bar teams, service teams, supervisors and managers - as one-off sessions or ongoing programs.",
    included: [
      "Barista training",
      "Bartender / mixology training",
      "Product knowledge",
      "Service standards",
      "Upselling and sales behavior",
      "Workflow and speed",
      "Leadership and team development",
      "Custom corporate training",
    ],
    approach: "Hands-on sessions built around your menu and your service, with practical assessments and follow-up so the training sticks.",
    deliverables: [
      "Training needs assessment",
      "Custom training modules and manuals",
      "Practical assessments and certificates",
      "Follow-up coaching sessions",
    ],
    faqs: [
      { question: "Can training be delivered on-site?", answer: "Yes. Most programs are delivered at your venue using your equipment and menu." },
      { question: "Do you train in groups or one-to-one?", answer: "Both - from small teams to group-wide programs." },
    ],
    cta_label: "Request training",
  },
  {
    id: id(104),
    ...published,
    sort_order: 4,
    slug: "brand-commercial-support",
    title: "Brand & Commercial Support",
    tagline: "Activations, partnerships and market development.",
    icon: "sparkles",
    summary: "Representation, activations and on-trade education that connect beverage brands with the hospitality industry.",
    problem: "Brands that need credible on-trade advocacy, memorable activations and teams in venues who actually understand the product.",
    audience: "Beverage brands, importers and distributors launching or growing products in the hospitality channel.",
    included: [
      "Brand representation",
      "Product demonstrations",
      "Trade events and exhibitions",
      "Brand activations",
      "Product launches",
      "Hospitality partnerships",
      "On-trade education",
      "Market insight and commercial support",
    ],
    approach: "Anthony combines bar-floor credibility with commercial thinking - building serves, stories and education that venues want to adopt.",
    deliverables: [
      "Activation concepts and signature serves",
      "Trade-show presence and demonstrations",
      "On-trade training sessions",
      "Market feedback and insight reports",
    ],
    faqs: [
      { question: "Do you work with brands on an ongoing basis?", answer: "Yes - from one-off activations to ongoing ambassador-style partnerships." },
    ],
    cta_label: "Discuss a brand partnership",
  },
];

// -----------------------------------------------------------------------------
// Client projects (from the CV). IDs match the dev database.
// Sira and Cherry on top are DRAFTS until the clients approve being named.
// -----------------------------------------------------------------------------
const consulting = (n: number, slug: string, title: string, category: Project["category"], client: string, location: string, year: string, role: string, sort: number): Project => ({
  id: id(n),
  ...published,
  sort_order: sort,
  featured: false,
  slug,
  title,
  category,
  client_name: client,
  location,
  year,
  role,
  summary: `${role === "Coffee Consultant" ? "Coffee consulting" : "Consulting"} for ${client} in ${location.replace(", Lebanon", "")}.`,
  highlights: [],
  service_slugs: ["beverage-consulting"],
});

export const fallbackProjects: Project[] = [
  {
    id: id(801), status: "draft", sort_order: 101, featured: true,
    slug: "sira-concept-and-opening", title: "Sira — Concept, Menu & Bar Operations", category: "openings",
    client_name: "Sira", location: "Tabarja, Lebanon", year: "2025–2026",
    summary: "Concept development, complete menu creation, bar layout engineering and team training for a new venue.",
    brief: "Develop the concept and complete menu for Sira, including specialty items, health-conscious options and items with calculated calorie content, and set up efficient bar operations.",
    role: "Consultant",
    work_done:
      "Led concept development and created the complete menu. Contributed to venue design and engineered the bar layout and item placement to improve workflow, service speed and staff efficiency. Sourced key suppliers and negotiated pricing, quality and delivery terms. Determined staffing requirements and trained the team on recipes, product knowledge, service standards, hygiene and efficient bar operations. Built recipe-costing, pricing, inventory and waste-control procedures.\n\nConducted staff meetings and performance evaluations with the owner, tracked sales and customer reviews, and adjusted recipes and menu items accordingly.",
    outcome: "Supported peak service for up to 300 customers while maintaining speed, organization and product consistency.",
    highlights: ["Complete menu incl. health-conscious and calorie-calculated items", "Bar layout engineered for speed and efficiency", "Supplier sourcing and negotiation", "Recipe costing, inventory and waste control", "Team training"],
    service_slugs: ["beverage-consulting", "operations-consulting", "training-team-development"],
  },
  {
    id: id(802), status: "draft", sort_order: 102, featured: true,
    slug: "cherry-on-top-menu-engineering", title: "Cherry on top — Menu Engineering", category: "beverage_programs",
    client_name: "Cherry on top", location: "Hrajel, Lebanon", year: "2026",
    summary: "A complete menu engineered around the existing crêpe and fruit-cocktail range for better cohesion and efficiency.",
    brief: "Create a complete menu that improves menu cohesion and operational efficiency using the existing product range.",
    role: "Consultant",
    work_done:
      "Engineered a complete menu by cross-utilizing ingredients from the existing crêpe and fruit-cocktail range. Trained staff on menu preparation, consistency and service standards. Calculated item costs, established menu pricing and recommended suppliers based on quality, pricing and operational needs.",
    highlights: ["Menu engineering with ingredient cross-utilization", "Item costing and pricing", "Supplier recommendations", "Staff training"],
    service_slugs: ["beverage-consulting", "training-team-development"],
  },
  // CV "Additional consulting projects" - published with minimal info; write each up in /admin.
  consulting(811, "sama-judy-coffee-consulting", "Sama Judy — Coffee Consulting", "coffee_concepts", "Sama Judy", "Harissa, Lebanon", "2026", "Coffee Consultant", 103),
  consulting(812, "traction-coffee-consulting", "Traction — Coffee Consulting", "coffee_concepts", "Traction", "Batroun, Lebanon", "2025", "Coffee Consultant", 104),
  consulting(813, "mountain-mud-coffee-consulting", "Mountain Mud — Coffee Consulting", "coffee_concepts", "Mountain Mud", "Aamchit, Lebanon", "2025", "Coffee Consultant", 105),
  consulting(814, "dice-and-bites-coffee-consulting", "Dice and Bites — Coffee Consulting", "coffee_concepts", "Dice and Bites", "Byblos, Lebanon", "2023", "Coffee Consultant", 106),
  consulting(815, "consiglio-coffee-consulting", "Consiglio — Coffee Consulting", "coffee_concepts", "Consiglio", "Dbayeh, Lebanon", "2023", "Coffee Consultant", 107),
  consulting(816, "coffee-and-co-consulting", "Coffee & Co. — Consulting", "coffee_concepts", "Coffee & Co.", "Adma, Lebanon", "2023", "Consultant", 108),
  consulting(817, "lemonade-chahine-consulting", "Lemonade Chahine — Consulting", "beverage_programs", "Lemonade Chahine", "Byblos, Lebanon", "2023", "Consultant", 109),
  consulting(818, "railway-coffee-station-consulting", "Railway Coffee Station — Consulting", "coffee_concepts", "Railway Coffee Station", "Byblos, Lebanon", "2022", "Consultant", 110),
  consulting(819, "croissant-bar-coffee-consulting", "Croissant Bar — Coffee Consulting", "coffee_concepts", "Croissant Bar", "Byblos, Lebanon", "2022", "Coffee Consultant", 111),
];

// No real drinks, workshops/masterclasses or events yet - add them in /admin.
export const fallbackDrinks: Drink[] = [];
export const fallbackPrograms: Program[] = [];
export const fallbackEvents: EventItem[] = [];

// -----------------------------------------------------------------------------
// Career & credentials (from the CV). IDs match the dev database.
// -----------------------------------------------------------------------------
const role = (n: number, sort: number, title: string, organization: string, location: string, start: string, end: string | null, description?: string, kind: Experience["kind"] = "role"): Experience => ({
  id: id(n),
  ...published,
  sort_order: sort,
  kind,
  title,
  organization,
  location,
  start_label: start,
  end_label: end,
  description: description ?? null,
});

export const fallbackExperience: Experience[] = [
  role(701, 1, "Bar Manager", "Edde Sands", "Byblos, Lebanon", "April 2026", "Present",
    "Manages bar operations across three outlets and special events, including proms, after-parties and on- and off-site bar catering. Leads weekly operations at Paradiso, a premium outdoor beach club serving an average of 450 guests every Saturday, and develops outlet-specific cocktail menus."),
  role(702, 2, "Consultant", "Cherry on top", "Hrajel, Lebanon", "April 2026", "June 2026",
    "Engineered a complete menu by cross-utilizing ingredients from the existing crêpe and fruit-cocktail range, trained staff, calculated item costs and pricing, and recommended suppliers."),
  role(703, 3, "Consultant", "Sira", "Tabarja, Lebanon", "September 2025", "June 2026",
    "Led concept development and the complete menu, engineered the bar layout, sourced and negotiated with suppliers, trained the team and built recipe-costing, inventory and waste-control procedures. Supported peak service for up to 300 customers."),
  role(704, 4, "General Manager", "Dice And Bites", "Byblos, Lebanon", "November 2024", "April 2026",
    "Managed staffing, training and daily kitchen, coffee, bar and floor operations. Oversaw all menus, signature cocktails, costing and pricing, events, inventory and supplier relationships, and introduced improvements that increased overall sales."),
  role(705, 5, "Bar Manager", "Soult Beach", "Batroun, Lebanon", "August 2024", "October 2024",
    "Rebranded the bar menu with new signature cocktails and cost-optimized recipes, led opening procurement and inventory controls, designed an ergonomic bar layout and trained the team."),
  role(706, 6, "General Manager", "Mood Lebanon", "Batroun, Lebanon", "May 2024", "October 2024",
    "Managed bar, floor and kitchen operations. Developed a five-drink signature cocktail menu using house-made syrups, cordials, infusions, fat-washes and tinctures, and established cost-control procedures."),
  role(708, 7, "Bar Manager", "Libre Resto-Bar", "Jounieh, Lebanon", "July 2023", "May 2024"),
  role(709, 8, "Head Bartender", "Sao", "Batroun, Lebanon", "May 2023", "September 2023"),
  role(710, 9, "Bartender", "Straight Up Group – House of Cocktails", "Byblos, Lebanon", "April 2023", "May 2023"),
  role(711, 10, "Founder & Owner", "The Alchemist — Seasonal Liqueur Brand", "Byblos, Lebanon", "December 2022", "Present", undefined, "milestone"),
  role(712, 11, "Manager", "Railway Coffee Station", "Byblos, Lebanon", "November 2022", "December 2022"),
  role(713, 12, "Bartender", "Dusk by Uncle Sam", "Aamchit, Lebanon", "May 2022", "November 2022"),
  role(714, 13, "Barista", "Vee Coffee Shop", "Byblos, Lebanon", "October 2021", "November 2022"),
  // Education & credentials
  role(721, 21, "Barista Certificate (in progress)", "CIS College", "Sin El Fil, Lebanon", "In progress", null, undefined, "certification"),
  role(722, 22, "WSET Level 2 (in progress)", "Wine & Spirit Education Trust", "Sin El Fil, Lebanon", "In progress", null, undefined, "certification"),
  role(723, 23, "BBA, Business Management (in progress)", "Lebanese German University", "Sahel Aalma, Lebanon", "February 2024", "Present", undefined, "certification"),
  role(724, 24, "BBA, Finance", "Conservatoire National des Arts et Métiers (CNAM)", "Nahr Ibrahim, Lebanon", "November 2020", "December 2023", undefined, "certification"),
];

// Only real, approved testimonials and partner logos should be published.
export const fallbackTestimonials: Testimonial[] = [];
export const fallbackPartners: Partner[] = [];
export const fallbackMedia: MediaItem[] = [];
export const fallbackBanners: Banner[] = [];
