import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Star,
  MapPin,
  BadgeCheck,
  Check,
  ArrowLeft,
  CalendarCheck,
  FileText,
  Heart,
  Share2,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SupplierCard } from "@/components/SupplierCard";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getSupplier, suppliers } from "@/data/suppliers";

// Deterministically derive "unavailable" days for a supplier so the calendar
// shows a stable set of booked dates without a backend.
function getUnavailableDates(supplierId: string): Date[] {
  let seed = 0;
  for (let i = 0; i < supplierId.length; i++) {
    seed = (seed * 31 + supplierId.charCodeAt(i)) % 100000;
  }
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let month = 0; month < 6; month++) {
    for (let k = 0; k < 6; k++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const day = (seed % 28) + 1;
      const d = new Date(today.getFullYear(), today.getMonth() + month, day);
      if (d >= today) dates.push(d);
    }
  }
  return dates;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const Route = createFileRoute("/supplier/$supplierId")({
  head: () => ({
    meta: [
      { title: "Supplier — WeddingHub Lebanon" },
      { name: "description", content: "View this wedding supplier's profile on WeddingHub Lebanon." },
    ],
  }),
  component: SupplierDetail,
});


function SupplierNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Supplier not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This profile may have been removed or the link is incorrect.
        </p>
        <Link
          to="/suppliers"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Browse suppliers
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}

function SupplierDetail() {
  const { supplierId } = Route.useParams();
  const supplier = getSupplier(supplierId);

  const unavailableDates = useMemo(
    () => getUnavailableDates(supplierId),
    [supplierId],
  );
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  if (!supplier) return <SupplierNotFound />;

  const related = suppliers
    .filter((s) => s.category === supplier.category && s.id !== supplier.id)
    .slice(0, 3);


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Link
          to="/suppliers"
          search={{ category: supplier.category }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {supplier.categoryLabel}
        </Link>
      </div>

      {/* Hero image */}
      <section className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <img
            src={supplier.image}
            alt={supplier.name}
            width={1600}
            height={900}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {supplier.tier}
          </span>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto mt-8 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {supplier.city}, {supplier.region}
          </div>
          <h1 className="mt-1.5 flex flex-wrap items-center gap-2 font-serif text-4xl font-semibold text-foreground">
            {supplier.name}
            {supplier.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{supplier.tagline}</p>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {supplier.rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">({supplier.reviews} reviews)</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{supplier.categoryLabel}</span>
          </div>

          <hr className="my-8 border-border" />

          <h2 className="font-serif text-2xl font-semibold text-foreground">About</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{supplier.about}</p>

          <h2 className="mt-8 font-serif text-2xl font-semibold text-foreground">What's included</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {supplier.services.map((service: string) => (
              <li key={service} className="flex items-center gap-2.5 text-sm text-foreground">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                {service}
              </li>
            ))}
          </ul>
        </div>

        {/* Booking card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="mt-0.5 font-serif text-3xl font-semibold text-foreground">
              ${supplier.priceFrom.toLocaleString()}
              {supplier.category === "catering" && (
                <span className="text-base font-normal text-muted-foreground"> / guest</span>
              )}
            </p>

            <Popover open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <CalendarCheck className="h-4 w-4" /> Check availability
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(day) =>
                    day < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    unavailableDates.some((d) => isSameDay(d, day))
                  }
                  modifiers={{ unavailable: unavailableDates }}
                  modifiersClassNames={{
                    unavailable: "line-through text-muted-foreground/60",
                  }}
                  className="p-3"
                />
                <div className="flex items-center gap-4 border-t border-border px-4 py-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Available
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" /> Unavailable
                  </span>
                </div>
                {selectedDate && (
                  <p className="px-4 pb-3 text-xs text-foreground">
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    is available.
                  </p>
                )}
              </PopoverContent>
            </Popover>

            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <FileText className="h-4 w-4" /> Request a quote
            </button>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Heart className="h-4 w-4" /> Save
              </button>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              No commitment — vendors typically reply within 24 hours.
            </p>
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            More {supplier.categoryLabel.toLowerCase()}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <SupplierCard key={s.id} supplier={s} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
