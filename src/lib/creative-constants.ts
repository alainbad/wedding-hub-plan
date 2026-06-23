// Shared constants for the creative dashboard & public site.

import type { CategorySlug } from "@/data/creatives";

/** A single dynamic field rendered in the "Request a quote" dialog. */
export type QuoteFieldType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "date"
  | "boolean";

export interface QuoteField {
  key: string;
  label: string;
  type: QuoteFieldType;
  placeholder?: string;
  options?: string[];
}

const GUESTS_FIELD: QuoteField = {
  key: "guests",
  label: "Number of guests",
  type: "select",
  placeholder: "Guest count",
  options: ["50 — 100", "100 — 150", "150 — 250", "250+"],
};

const VENUE_TYPE_FIELD: QuoteField = {
  key: "venueType",
  label: "Venue type",
  type: "select",
  placeholder: "Indoor or outdoor",
  options: ["Indoor Venue", "Outdoor Venue", "Indoor & Outdoor"],
};

/**
 * Maps each public category to the extra questions shown in the quote form,
 * on top of the shared fields (name, email, phone, location, date, notes).
 */
export const QUOTE_FIELDS_BY_CATEGORY: Record<CategorySlug, QuoteField[]> = {
  venues: [
    GUESTS_FIELD,
    VENUE_TYPE_FIELD,
    {
      key: "eventType",
      label: "Event type",
      type: "select",
      placeholder: "Select event type",
      options: ["Wedding ceremony", "Reception", "Engagement", "Full wedding"],
    },
  ],
  catering: [
    GUESTS_FIELD,
    {
      key: "cuisine",
      label: "Catering cuisine",
      type: "multiselect",
      placeholder: "Select cuisines",
      options: [
        "Lebanese",
        "International",
        "Italian",
        "Fusion",
        "Mexican",
        "Mediterranean",
        "French",
      ],
    },
    {
      key: "serviceStyle",
      label: "Service style",
      type: "select",
      placeholder: "Select service style",
      options: ["Plated", "Buffet", "Family-style", "Live stations"],
    },
  ],
  photography: [
    {
      key: "coverage",
      label: "Coverage length",
      type: "select",
      placeholder: "Select coverage",
      options: ["Half day", "Full day (8h)", "Full day (10h+)", "Multi-day"],
    },
    {
      key: "addOns",
      label: "Add-ons",
      type: "multiselect",
      placeholder: "Select add-ons",
      options: ["Engagement session", "Second shooter", "Cinematic film", "Photo album"],
    },
    GUESTS_FIELD,
  ],
  florists: [
    {
      key: "style",
      label: "Style preference",
      type: "select",
      placeholder: "Select a style",
      options: ["Garden", "Modern", "Classic", "Minimal"],
    },
    {
      key: "areas",
      label: "Areas to decorate",
      type: "multiselect",
      placeholder: "Select areas",
      options: ["Bridal bouquet", "Ceremony arch", "Centerpieces", "Entrance", "Full venue"],
    },
  ],
  entertainment: [
    {
      key: "performanceType",
      label: "Performance type",
      type: "select",
      placeholder: "Select performance type",
      options: ["Live band", "DJ", "String quartet", "Solo performer"],
    },
    GUESTS_FIELD,
  ],
  beauty: [
    {
      key: "service",
      label: "Service needed",
      type: "select",
      placeholder: "Select service",
      options: ["Hair", "Makeup", "Hair & Makeup"],
    },
    {
      key: "partySize",
      label: "Bridal party size",
      type: "number",
      placeholder: "e.g. 4",
    },
    {
      key: "onLocation",
      label: "On-location service",
      type: "boolean",
    },
  ],
  cakes: [
    {
      key: "servings",
      label: "Number of servings",
      type: "number",
      placeholder: "e.g. 120",
    },
    {
      key: "flavor",
      label: "Flavor preference",
      type: "text",
      placeholder: "e.g. Vanilla, chocolate, red velvet",
    },
    {
      key: "dessertTable",
      label: "Dessert table",
      type: "boolean",
    },
  ],
  "car-rentals": [
    {
      key: "carCount",
      label: "Number of cars",
      type: "number",
      placeholder: "e.g. 2",
    },
    {
      key: "carStyle",
      label: "Car style",
      type: "select",
      placeholder: "Select a style",
      options: ["Vintage", "Luxury", "Sports", "Limousine"],
    },
    {
      key: "pickup",
      label: "Pickup location",
      type: "text",
      placeholder: "Where should the car arrive?",
    },
  ],
  "travel-accommodation": [
    {
      key: "rooms",
      label: "Number of rooms",
      type: "number",
      placeholder: "e.g. 10",
    },
    {
      key: "checkIn",
      label: "Check-in date",
      type: "date",
    },
    {
      key: "checkOut",
      label: "Check-out date",
      type: "date",
    },
  ],
  "event-planners": [
    GUESTS_FIELD,
    {
      key: "planningLevel",
      label: "Planning level",
      type: "select",
      placeholder: "Select planning level",
      options: ["Full planning", "Partial planning", "Day-of coordination"],
    },
  ],
  "reception-organizers": [
    GUESTS_FIELD,
    {
      key: "services",
      label: "Services needed",
      type: "multiselect",
      placeholder: "Select services",
      options: ["MC & hosting", "DJ", "Lighting", "Interactive games", "After-party"],
    },
  ],
};

export const CATEGORY_OPTIONS = [
  { slug: "venues", label: "Venue" },
  { slug: "photography", label: "Photography & Film" },
  { slug: "florists", label: "Florist & Décor" },
  { slug: "catering", label: "Catering" },
  { slug: "entertainment", label: "Entertainment" },
  { slug: "beauty", label: "Hair & Makeup" },
  { slug: "cakes", label: "Cakes & Sweets" },
] as const;

export const REGION_OPTIONS = [
  "Beirut",
  "Mount Lebanon",
  "North Lebanon",
  "South Lebanon",
  "Bekaa",
  "Nabatieh",
] as const;

export const SERVICE_AREAS = [
  "Beirut",
  "Metn",
  "Keserwan",
  "Jounieh",
  "Jbeil",
  "Tripoli",
  "Saida",
  "Tyre",
  "Bekaa",
  "North Lebanon",
  "South Lebanon",
] as const;

export type PlanKey = "Featured" | "Premium" | "Elite";

export const PLANS: {
  key: PlanKey;
  price: number;
  blurb: string;
  features: string[];
  portfolioLimit: string;
}[] = [
  {
    key: "Featured",
    price: 10,
    blurb: "Stand out in category listings",
    portfolioLimit: "10 photos · 1 video",
    features: [
      "Verified profile listing",
      "Standard category placement",
      "Lead inbox",
      "Basic analytics",
    ],
  },
  {
    key: "Premium",
    price: 35,
    blurb: "Priority placement & richer profile",
    portfolioLimit: "30 photos · 5 videos",
    features: [
      "Everything in Featured",
      "Priority lead delivery",
      "Priority search placement",
      "Promotional tools",
      "Full analytics",
    ],
  },
  {
    key: "Elite",
    price: 50,
    blurb: "Top of search, homepage features & badge",
    portfolioLimit: "Unlimited photos & videos",
    features: [
      "Everything in Premium",
      "Top of search results",
      "Homepage featured carousel",
      "Elite badge",
      "Dedicated support",
    ],
  },
];

export const PORTFOLIO_LIMITS: Record<PlanKey, { photos: number; videos: number }> = {
  Featured: { photos: 10, videos: 1 },
  Premium: { photos: 30, videos: 5 },
  Elite: { photos: Infinity, videos: Infinity },
};

export const LEAD_STATUSES = ["new", "contacted", "quoted", "booked", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
  lost: "Lost",
};

export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  pending: "Pending Approval",
  approved: "Published",
  rejected: "Rejected",
  suspended: "Suspended",
};

export function categoryLabelFor(slug: string): string {
  return CATEGORY_OPTIONS.find((c) => c.slug === slug)?.label ?? "Creative";
}
