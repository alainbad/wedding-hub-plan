import { categoryImages, type Supplier, type CategorySlug } from "@/data/suppliers";
import type { Tables } from "@/integrations/supabase/types";

const fallbackByCategory: Record<string, string> = {
  venues: categoryImages.venue,
  photography: categoryImages.photography,
  florists: categoryImages.florist,
  catering: categoryImages.catering,
  entertainment: categoryImages.entertainment,
  beauty: categoryImages.beauty,
  cakes: categoryImages.cake,
};

/** Map a database supplier row to the public-facing Supplier shape. */
export function adaptSupplier(row: Tables<"suppliers">): Supplier {
  return {
    id: row.id,
    name: row.company_name || "Supplier",
    category: row.category as CategorySlug,
    categoryLabel: row.category_label,
    city: row.city,
    region: row.region,
    tier: row.subscription_plan,
    rating: Number(row.rating) || 0,
    reviews: row.reviews_count,
    priceFrom: Number(row.starting_price) || 0,
    image: row.image_url || fallbackByCategory[row.category] || categoryImages.hero,
    tagline: row.tagline,
    about: row.about,
    services: row.services ?? [],
    verified: row.verified,
    createdAt: row.created_at,
  };
}
