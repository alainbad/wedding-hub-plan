import heroImg from "@/assets/hero.jpg";
import venueImg from "@/assets/venue.jpg";
import floristImg from "@/assets/florist.jpg";
import cateringImg from "@/assets/catering.jpg";
import photographyImg from "@/assets/photography.jpg";
import entertainmentImg from "@/assets/entertainment.jpg";
import beautyImg from "@/assets/beauty.jpg";
import cakeImg from "@/assets/cake.jpg";
import carRentalsImg from "@/assets/car-rentals.jpg";
import travelAccommodationImg from "@/assets/travel-accommodation.jpg";

export const categoryImages = {
  hero: heroImg,
  venue: venueImg,
  florist: floristImg,
  catering: cateringImg,
  photography: photographyImg,
  entertainment: entertainmentImg,
  beauty: beautyImg,
  cake: cakeImg,
  carRentals: venueImg,
  travelAccommodation: heroImg,
  eventPlanners: cateringImg,
  receptionOrganizers: entertainmentImg,
};

export type CategorySlug =
  | "venues"
  | "photography"
  | "florists"
  | "catering"
  | "entertainment"
  | "beauty"
  | "cakes"
  | "car-rentals"
  | "travel-accommodation"
  | "event-planners"
  | "reception-organizers";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  image: string;
  count: number;
}

export const categories: Category[] = [
  { slug: "venues", name: "Venues", tagline: "Seaside villas, vineyards & ballrooms", image: venueImg, count: 64 },
  { slug: "photography", name: "Photography & Film", tagline: "Capture every moment", image: photographyImg, count: 78 },
  { slug: "florists", name: "Florists & Décor", tagline: "Blooms and styling", image: floristImg, count: 52 },
  { slug: "catering", name: "Catering", tagline: "Mezze to fine dining", image: cateringImg, count: 41 },
  { slug: "entertainment", name: "Entertainment", tagline: "Bands, DJs & performers", image: entertainmentImg, count: 37 },
  { slug: "beauty", name: "Hair & Makeup", tagline: "Bridal beauty artists", image: beautyImg, count: 59 },
  { slug: "cakes", name: "Cakes & Sweets", tagline: "Patisserie & dessert tables", image: cakeImg, count: 29 },
  { slug: "car-rentals", name: "Car Rentals", tagline: "Luxury cars & transport for your big day", image: venueImg, count: 1 },
  { slug: "travel-accommodation", name: "Travel and Accommodation", tagline: "Hotels, guest houses & honeymoon stays", image: heroImg, count: 1 },
  { slug: "event-planners", name: "Event Planners", tagline: "Full-service wedding planning & coordination", image: cateringImg, count: 1 },
  { slug: "reception-organizers", name: "Reception Organizers", tagline: "Reception setup, hosting & entertainment flow", image: entertainmentImg, count: 1 },
];

export type Tier = "Featured" | "Premium" | "Elite";

export interface Supplier {
  id: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  city: string;
  region: string;
  tier: Tier;
  rating: number;
  reviews: number;
  priceFrom: number;
  image: string;
  tagline: string;
  about: string;
  services: string[];
  verified: boolean;
  createdAt?: string;
}

/** Demo helper: returns an ISO date N days before now so "new joiner" tagging stays current. */
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const suppliers: Supplier[] = [
  {
    id: "villa-cedars",
    name: "Villa des Cèdres",
    category: "venues",
    categoryLabel: "Venue",
    city: "Batroun",
    region: "North Lebanon",
    tier: "Elite",
    rating: 4.9,
    reviews: 132,
    priceFrom: 8500,
    image: venueImg,
    tagline: "Cliff-top Mediterranean estate with sunset ceremonies",
    about:
      "A restored 19th-century stone villa perched above the Batroun coastline, Villa des Cèdres hosts intimate ceremonies and grand celebrations alike. Arched terraces, olive gardens and uninterrupted sea views make it one of Lebanon's most sought-after wedding settings.",
    services: [
      "Up to 300 guests",
      "On-site catering kitchen",
      "Bridal suite",
      "Valet parking",
      "Indoor & outdoor options",
      "Tables and chairs",
      "DJ setup",
      "Sound and lighting",
      "Dancing stage",
      "Bar",
      "Welcome drink area",
      "Photo booth",
      "Entertainment",
    ],
    verified: true,
  },
  {
    id: "lumiere-studios",
    name: "Lumière Studios",
    category: "photography",
    categoryLabel: "Photography & Film",
    city: "Beirut",
    region: "Beirut",
    tier: "Premium",
    rating: 4.8,
    reviews: 96,
    priceFrom: 2200,
    image: photographyImg,
    tagline: "Editorial photography & cinematic wedding films",
    about:
      "Lumière Studios blends documentary instinct with editorial polish. The team shoots in natural light and delivers a curated gallery plus a cinematic highlight film within four weeks of your day.",
    services: ["Full-day coverage", "Second shooter", "Cinematic film", "Engagement session", "Online gallery"],
    verified: true,
  },
  {
    id: "fleur-de-liban",
    name: "Fleur de Liban",
    category: "florists",
    categoryLabel: "Florist & Décor",
    city: "Jounieh",
    region: "Mount Lebanon",
    tier: "Premium",
    rating: 4.9,
    reviews: 74,
    priceFrom: 1500,
    image: floristImg,
    tagline: "Garden-style florals & full event styling",
    about:
      "From cascading arches to hand-tied bouquets, Fleur de Liban designs lush, garden-inspired arrangements using seasonal Lebanese blooms and imported stems for a romantic, organic feel.",
    services: ["Bridal bouquet", "Ceremony arch", "Centerpieces", "Full venue styling", "Day-of setup"],
    verified: true,
  },
  {
    id: "sofra-catering",
    name: "Sofra Fine Catering",
    category: "catering",
    categoryLabel: "Catering",
    city: "Beirut",
    region: "Beirut",
    tier: "Elite",
    rating: 4.7,
    reviews: 88,
    priceFrom: 65,
    image: cateringImg,
    tagline: "Modern Lebanese menus, plated or family-style",
    about:
      "Sofra reimagines the Lebanese table with refined mezze, live cooking stations and plated tasting menus. Pricing shown is per guest and includes service staff and tableware.",
    services: ["Custom menu design", "Live stations", "Service staff", "Bar & beverages", "Tastings"],
    verified: true,
  },
  {
    id: "nightingale-band",
    name: "The Nightingale Band",
    category: "entertainment",
    categoryLabel: "Entertainment",
    city: "Zahlé",
    region: "Bekaa",
    tier: "Featured",
    rating: 4.8,
    reviews: 51,
    priceFrom: 3000,
    image: entertainmentImg,
    tagline: "Live band & string quartet for ceremony and party",
    about:
      "A versatile ensemble covering Arabic and international repertoire, The Nightingale Band moves seamlessly from a refined ceremony quartet to a full party band that keeps the floor moving until late.",
    services: ["Ceremony quartet", "Reception band", "DJ transition", "Sound system", "Custom song requests"],
    verified: false,
    createdAt: daysAgo(4),
  },
  {
    id: "atelier-belle",
    name: "Atelier Belle",
    category: "beauty",
    categoryLabel: "Hair & Makeup",
    city: "Beirut",
    region: "Beirut",
    tier: "Premium",
    rating: 5.0,
    reviews: 119,
    priceFrom: 600,
    image: beautyImg,
    tagline: "Bridal hair & makeup with on-location service",
    about:
      "Atelier Belle specialises in soft, long-wear bridal looks tailored to your features. The team travels to your suite and offers trials, plus styling for the wider bridal party.",
    services: ["Bridal trial", "Day-of hair & makeup", "Bridal party styling", "On-location", "Touch-up kit"],
    verified: true,
  },
  {
    id: "maison-sucre",
    name: "Maison Sucré",
    category: "cakes",
    categoryLabel: "Cakes & Sweets",
    city: "Byblos",
    region: "Mount Lebanon",
    tier: "Featured",
    rating: 4.9,
    reviews: 63,
    priceFrom: 450,
    image: cakeImg,
    tagline: "Couture wedding cakes & dessert tables",
    about:
      "Maison Sucré creates show-stopping tiered cakes finished with fresh florals and edible gold, alongside curated dessert tables featuring French and Lebanese patisserie.",
    services: ["Tiered wedding cake", "Dessert table", "Flavor tasting", "Custom design", "Delivery & setup"],
    verified: true,
  },
  {
    id: "saray-gardens",
    name: "Saray Gardens",
    category: "venues",
    categoryLabel: "Venue",
    city: "Broummana",
    region: "Mount Lebanon",
    tier: "Premium",
    rating: 4.6,
    reviews: 57,
    priceFrom: 6000,
    image: heroImg,
    tagline: "Pine-shaded garden venue in the mountains",
    about:
      "Set among century-old pines, Saray Gardens offers a cool mountain escape for summer weddings, with sprawling lawns, a covered pavilion and golden-hour photo backdrops.",
    services: ["Up to 250 guests", "Garden ceremony", "Covered pavilion", "Preferred vendor list", "Parking"],
    verified: true,
  },
  {
    id: "cedar-frames",
    name: "Cedar & Frames",
    category: "photography",
    categoryLabel: "Photography & Film",
    city: "Tripoli",
    region: "North Lebanon",
    tier: "Featured",
    rating: 4.7,
    reviews: 44,
    priceFrom: 1400,
    image: photographyImg,
    tagline: "Warm, candid storytelling photography",
    about:
      "Cedar & Frames focuses on real, unposed moments. Ideal for couples who want a relaxed presence and a timeless, warm-toned gallery of their day.",
    services: ["8-hour coverage", "Edited gallery", "Print release", "Engagement add-on", "USB keepsake"],
    verified: false,
    createdAt: daysAgo(11),
  },
  {
    id: "beirut-bridal-cars",
    name: "Beirut Bridal Cars",
    category: "car-rentals",
    categoryLabel: "Car Rentals",
    city: "Beirut",
    region: "Beirut",
    tier: "Premium",
    rating: 4.7,
    reviews: 38,
    priceFrom: 350,
    image: venueImg,
    tagline: "Vintage & luxury wedding cars with chauffeur",
    about:
      "Beirut Bridal Cars supplies polished classic and modern luxury vehicles for wedding day transport, complete with uniformed chauffeurs and ribbon décor.",
    services: ["Chauffeur service", "Ribbon & floral décor", "Multi-car packages", "Airport transfers", "Custom routes"],
    verified: true,
  },
  {
    id: "cedar-valley-retreats",
    name: "Cedar Valley Retreats",
    category: "travel-accommodation",
    categoryLabel: "Travel and Accommodation",
    city: "Broummana",
    region: "Mount Lebanon",
    tier: "Premium",
    rating: 4.6,
    reviews: 29,
    priceFrom: 120,
    image: heroImg,
    tagline: "Boutique guesthouses & honeymoon suites",
    about:
      "A curated collection of mountain and seaside guesthouses reserved for wedding parties and honeymooners, with group booking rates and late checkout.",
    services: ["Group room blocks", "Honeymoon suites", "Late checkout", "Airport pickup", "Concierge"],
    verified: true,
  },
  {
    id: "moments-by-maya",
    name: "Moments by Maya",
    category: "event-planners",
    categoryLabel: "Event Planners",
    city: "Beirut",
    region: "Beirut",
    tier: "Elite",
    rating: 4.9,
    reviews: 71,
    priceFrom: 3200,
    image: cateringImg,
    tagline: "End-to-end wedding planning & design",
    about:
      "Moments by Maya coordinates every detail from venue selection to vendor management, timeline planning and on-the-day execution for a stress-free wedding.",
    services: ["Full planning", "Partial planning", "Day-of coordination", "Design & styling", "Vendor curation"],
    verified: true,
  },
  {
    id: "sahretna-nights",
    name: "Sahretna Nights",
    category: "reception-organizers",
    categoryLabel: "Reception Organizers",
    city: "Jounieh",
    region: "Mount Lebanon",
    tier: "Premium",
    rating: 4.8,
    reviews: 46,
    priceFrom: 2200,
    image: entertainmentImg,
    tagline: "Reception flow, hosting & party curation",
    about:
      "Sahretna Nights shapes the energy of your reception with professional hosting, crowd-reading DJs, interactive games and seamless transition moments.",
    services: ["MC & hosting", "DJ & lighting", "Reception timeline", "Guest interaction", "After-party setup"],
    verified: true,
  },
];

export const tierBlurb: Record<Tier, string> = {
  Featured: "Stand out in category listings",
  Premium: "Priority placement & richer profile",
  Elite: "Top of search, homepage features & badge",
};

export function getSupplier(id: string) {
  return suppliers.find((s) => s.id === id);
}
