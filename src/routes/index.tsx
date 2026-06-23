import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, BadgeCheck, MessageSquareHeart, CalendarCheck, ArrowRight, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SupplierCard } from "@/components/SupplierCard";
import { categories, suppliers, categoryImages } from "@/data/suppliers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WeddingHub Lebanon — Find & Book Trusted Wedding Suppliers" },
      {
        name: "description",
        content:
          "Discover Lebanon's finest wedding venues, photographers, florists and caterers. Browse verified suppliers and plan your day with confidence.",
      },
      { property: "og:title", content: "WeddingHub Lebanon — Wedding Suppliers" },
      { property: "og:image", content: categoryImages.hero },
    ],
  }),
  component: Home,
});

const steps = [
  {
    icon: Search,
    title: "Browse & discover",
    text: "Explore curated suppliers across every category, filtered by region and budget.",
  },
  {
    icon: MessageSquareHeart,
    title: "Compare & connect",
    text: "Read real reviews, view portfolios and message verified vendors directly.",
  },
  {
    icon: CalendarCheck,
    title: "Book with confidence",
    text: "Secure your favourites and keep every detail of your day in one place.",
  },
];

function Home() {
  const featured = suppliers.filter((s) => s.tier === "Elite" || s.tier === "Premium").slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={categoryImages.hero}
            alt="Elegant wedding reception in Lebanon at golden hour"
            width={1600}
            height={1200}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/30" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center sm:px-6 md:py-40">
          <span className="rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-background backdrop-blur-sm">
            Lebanon's wedding directory
          </span>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-semibold leading-tight text-background sm:text-5xl md:text-6xl">
            Everything you need for your perfect day
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-background/85 sm:text-lg">
            From cliff-top venues in Batroun to Beirut's finest photographers — discover and book
            trusted wedding professionals across Lebanon.
          </p>

          <div className="mt-9 flex w-full max-w-lg items-center gap-2 rounded-full border border-background/20 bg-background p-1.5 shadow-2xl">
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search venues, photographers, florists…"
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Link
              to="/suppliers"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Search
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-background/80">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4" /> 300+ verified suppliers</span>
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-accent text-accent" /> 4.8 average rating</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Browse by category</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Everything you need to plan
            </h2>
          </div>
          <Link
            to="/suppliers"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to="/suppliers"
              search={{ category: cat.slug }}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl"
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-serif text-xl font-semibold text-background">{cat.name}</h3>
                <p className="mt-0.5 text-xs text-background/80">{cat.count} suppliers</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured suppliers */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Hand-picked</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Featured suppliers
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              A glimpse of the talented professionals shaping unforgettable Lebanese weddings.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SupplierCard key={s.id} supplier={s} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/suppliers"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Explore all suppliers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">How it works</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Plan in three simple steps
          </h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="mt-4 block font-serif text-sm text-accent">Step {i + 1}</span>
              <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center sm:px-12">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold text-primary-foreground sm:text-4xl">
              Are you a wedding supplier?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/85">
              Join hundreds of vendors reaching engaged couples across Lebanon. Get a beautiful
              profile, leads and reviews — all in one place.
            </p>
            <Link
              to="/pricing"
              className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-background px-6 py-3 text-sm font-medium text-primary transition-transform hover:scale-105"
            >
              See pricing & list your business <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
