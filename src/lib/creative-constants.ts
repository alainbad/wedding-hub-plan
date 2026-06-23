// Shared constants for the creative dashboard & public site.

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
