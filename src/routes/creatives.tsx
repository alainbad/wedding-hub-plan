import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SupplierCard } from "@/components/SupplierCard";
import { categories, suppliers, type CategorySlug } from "@/data/suppliers";
import { supabase } from "@/integrations/supabase/client";
import { adaptSupplier } from "@/lib/supplier-adapter";
import { cn } from "@/lib/utils";

interface SupplierSearch {
  category?: CategorySlug;
}

const validCategories = new Set(categories.map((c) => c.slug));

export const Route = createFileRoute("/suppliers")({
  validateSearch: (search: Record<string, unknown>): SupplierSearch => {
    const category = search.category as string | undefined;
    return category && validCategories.has(category as CategorySlug)
      ? { category: category as CategorySlug }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Browse Wedding Suppliers in Lebanon — WeddingHub" },
      {
        name: "description",
        content:
          "Browse and filter trusted wedding venues, photographers, florists, caterers and more across every region of Lebanon.",
      },
      { property: "og:title", content: "Browse Wedding Suppliers — WeddingHub Lebanon" },
    ],
  }),
  component: SuppliersPage,
});

const regions = ["All regions", "Beirut", "Mount Lebanon", "North Lebanon", "Bekaa"];
const sortOptions = ["Recommended", "Top rated", "Price: low to high"] as const;

function SuppliersPage() {
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/suppliers" });
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All regions");
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("Recommended");

  const { data: dbSuppliers = [] } = useQuery({
    queryKey: ["approved-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("status", "approved");
      if (error) throw error;
      return data.map(adaptSupplier);
    },
  });

  const allSuppliers = useMemo(() => [...dbSuppliers, ...suppliers], [dbSuppliers]);

  const filtered = useMemo(() => {
    let list = allSuppliers.slice();
    if (category) list = list.filter((s) => s.category === category);
    if (region !== "All regions") list = list.filter((s) => s.region === region);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.categoryLabel.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q),
      );
    }
    if (sort === "Top rated") list.sort((a, b) => b.rating - a.rating);
    if (sort === "Price: low to high") list.sort((a, b) => a.priceFrom - b.priceFrom);
    else if (sort === "Recommended") {
      const order = { Elite: 0, Premium: 1, Featured: 2 } as const;
      list.sort((a, b) => order[a.tier] - order[b.tier]);
    }
    return list;
  }, [allSuppliers, category, region, query, sort]);

  const { newJoiners, popular } = useMemo(() => {
    const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
    const now = Date.now();
    const isNew = (s: (typeof filtered)[number]) =>
      s.createdAt ? now - new Date(s.createdAt).getTime() < THIRTY_DAYS : false;
    const newOnes = filtered.filter(isNew);
    const rest = filtered
      .filter((s) => !isNew(s))
      .slice()
      .sort((a, b) => b.reviews - a.reviews || b.rating - a.rating);
    return { newJoiners: newOnes, popular: rest };
  }, [filtered]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Header band */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            {activeCategory ? activeCategory.tagline : "Wedding directory"}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            {activeCategory ? activeCategory.name : "All suppliers"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "supplier" : "suppliers"} available
          </p>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate({ search: {} })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                !category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => navigate({ search: { category: cat.slug } })}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === cat.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city or keyword…"
              className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none"
            >
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof sortOptions)[number])}
              className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none"
            >
              {sortOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {filtered.length > 0 ? (
          <div className="space-y-12">
            {newJoiners.length > 0 && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <h2 className="font-serif text-2xl font-semibold text-foreground">New joiners</h2>
                  <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-medium text-accent">
                    Just joined
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {newJoiners.map((s) => (
                    <SupplierCard key={s.id} supplier={s} />
                  ))}
                </div>
              </div>
            )}

            {popular.length > 0 && (
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <h2 className="font-serif text-2xl font-semibold text-foreground">Popular suppliers</h2>
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                    Most loved
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {popular.map((s) => (
                    <SupplierCard key={s.id} supplier={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">No suppliers found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRegion("All regions");
                navigate({ search: {} });
              }}
              className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
