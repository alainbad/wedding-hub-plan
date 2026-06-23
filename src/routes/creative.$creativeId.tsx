import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
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
  CalendarIcon,
  Send,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CreativeCard } from "@/components/CreativeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getCreative, creatives, type Creative } from "@/data/creatives";
import { supabase } from "@/integrations/supabase/client";
import { adaptCreative } from "@/lib/creative-adapter";

// Deterministically derive "unavailable" days for a creative so the calendar
// shows a stable set of booked dates without a backend.
function getUnavailableDates(creativeId: string): Date[] {
  let seed = 0;
  for (let i = 0; i < creativeId.length; i++) {
    seed = (seed * 31 + creativeId.charCodeAt(i)) % 100000;
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

// Derive a contact email for the creative (demo — no backend).
function creativeEmail(creative: Creative) {
  return `${creative.id}@weddinghub-lebanon.com`;
}

// Build a WhatsApp chat link to book an appointment with the creative.
// Uses the creative's WhatsApp number when available, otherwise a demo line.
function creativeWhatsAppLink(creative: Creative) {
  const number = (creative.whatsapp || "+961 70 000 000").replace(/[^\d]/g, "");
  const text = `Hello ${creative.name}, I'd like to book an appointment to discuss my wedding. Could we arrange a time?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}


const cuisineOptions = [
  "Lebanese",
  "International",
  "Italian",
  "Fusion",
  "Mexican",
  "Mediterranean",
  "French",
];

export const Route = createFileRoute("/creative/$creativeId")({
  head: () => ({
    meta: [
      { title: "Creative — WeddingHub Lebanon" },
      { name: "description", content: "View this wedding creative's profile on WeddingHub Lebanon." },
    ],
  }),
  component: CreativeDetail,
});


function CreativeNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Creative not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This profile may have been removed or the link is incorrect.
        </p>
        <Link
          to="/creatives"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Browse creatives
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}

function CreativeDetail() {
  const { creativeId } = Route.useParams();
  const staticCreative = getCreative(creativeId);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creativeId);

  const { data: dbRow, isLoading: dbLoading } = useQuery({
    queryKey: ["public-creative", creativeId],
    enabled: !staticCreative && isUuid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", creativeId)
        .eq("status", "approved")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const creative = staticCreative ?? (dbRow ? adaptCreative(dbRow) : undefined);
  const dbId = staticCreative ? null : (dbRow?.id ?? null);
  const queryClient = useQueryClient();

  // Count a profile view once per visit for real (database-backed) creatives.
  useEffect(() => {
    if (!dbId) return;
    void supabase.rpc("increment_profile_views", { _supplier_id: dbId });
  }, [dbId]);

  // Reviews for real creatives
  const { data: reviews = [] } = useQuery({
    queryKey: ["creative-reviews", dbId],
    enabled: !!dbId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, customer_name, rating, review, reply, created_at")
        .eq("supplier_id", dbId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Write-a-review dialog state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);



  const unavailableDates = useMemo(
    () => getUnavailableDates(creativeId),
    [creativeId],
  );
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Request-a-quote dialog state
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [venueType, setVenueType] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [weddingDate, setWeddingDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);

  const toggleCuisine = (option: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(option) ? prev.filter((c) => c !== option) : [...prev, option],
    );
  };

  if (!staticCreative && isUuid && dbLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-32 text-center text-sm text-muted-foreground">
          Loading creative…
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!creative) return <CreativeNotFound />;

  const related = creatives
    .filter((s) => s.category === creative.category && s.id !== creative.id)
    .slice(0, 3);

  const submitQuote = async () => {
    // For real (database-backed) creatives, store the inquiry as a lead so it
    // appears in the creative's dashboard inbox.
    if (dbId) {
      setSending(true);
      const messageText = [
        notes,
        venueType ? `Venue type: ${venueType}` : "",
        selectedCuisines.length ? `Cuisine: ${selectedCuisines.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      const { error } = await supabase.from("leads").insert({
        supplier_id: dbId,
        customer_name: fullName,
        email,
        phone,
        location,
        guest_count: guests ? parseInt(guests, 10) || null : null,
        budget: "",
        message: messageText,
        event_date: weddingDate ? format(weddingDate, "yyyy-MM-dd") : null,
      });
      setSending(false);
      if (error) {
        toast.error("Could not send your request. Please try again.");
        return;
      }
      toast.success(`Request sent to ${creative.name}!`);
      setQuoteOpen(false);
      return;
    }

    // Demo creatives (no backend): fall back to an email draft.
    const lines = [
      `Hello ${creative.name},`,
      "",
      "I'd like to request a quote with the following requirements:",
      "",
      `• Name: ${fullName || "—"}`,
      `• Email: ${email || "—"}`,
      `• Phone: ${phone || "—"}`,
      `• Location: ${location || "—"}`,
      `• Number of guests: ${guests || "—"}`,
      `• Venue type: ${venueType || "—"}`,
      `• Catering cuisine: ${selectedCuisines.length ? selectedCuisines.join(", ") : "—"}`,
      `• Wedding date: ${weddingDate ? format(weddingDate, "PPP") : "—"}`,
      "",
      "Additional notes:",
      notes || "—",
      "",
      "Thank you!",
    ];
    const subject = `Quote request — ${creative.name}`;
    const mailto = `mailto:${creativeEmail(creative)}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = mailto;
    setQuoteOpen(false);
  };

  const submitReview = async () => {
    if (!dbId) return;
    if (!reviewerName.trim() || !reviewText.trim()) {
      toast.error("Please add your name and a short review.");
      return;
    }
    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      supplier_id: dbId,
      customer_name: reviewerName.trim(),
      rating: reviewRating,
      review: reviewText.trim(),
    });
    setSubmittingReview(false);
    if (error) {
      toast.error("Could not submit your review. Please try again.");
      return;
    }
    toast.success("Thank you for your review!");
    setReviewOpen(false);
    setReviewerName("");
    setReviewRating(5);
    setReviewText("");
    queryClient.invalidateQueries({ queryKey: ["creative-reviews", dbId] });
    queryClient.invalidateQueries({ queryKey: ["public-creative", creativeId] });
  };




  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Link
          to="/creatives"
          search={{ category: creative.category }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {creative.categoryLabel}
        </Link>
      </div>

      {/* Hero image */}
      <section className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <img
            src={creative.image}
            alt={creative.name}
            width={1600}
            height={900}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {creative.tier}
          </span>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto mt-8 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" /> {creative.city}, {creative.region}
          </div>
          <h1 className="mt-1.5 flex flex-wrap items-center gap-2 font-serif text-4xl font-semibold text-foreground">
            {creative.name}
            {creative.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{creative.tagline}</p>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {creative.rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">({creative.reviews} reviews)</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{creative.categoryLabel}</span>
          </div>

          <hr className="my-8 border-border" />

          <h2 className="font-serif text-2xl font-semibold text-foreground">About</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{creative.about}</p>

          <h2 className="mt-8 font-serif text-2xl font-semibold text-foreground">What's included</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {creative.services.map((service: string) => (
              <li key={service} className="flex items-center gap-2.5 text-sm text-foreground">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                {service}
              </li>
            ))}
          </ul>

          {dbId && (
            <>
              <div className="mt-10 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  Reviews
                  {reviews.length > 0 && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      ({creative.rating.toFixed(1)} · {reviews.length})
                    </span>
                  )}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
                  Write a review
                </Button>
              </div>

              {reviews.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No reviews yet — be the first to leave one.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{r.customer_name}</span>
                        <span className="inline-flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < r.rating
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground/30",
                              )}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {r.review}
                      </p>
                      {r.reply && (
                        <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
                          <p className="font-medium text-foreground">Reply from {creative.name}</p>
                          <p className="mt-1 text-muted-foreground">{r.reply}</p>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {format(new Date(r.created_at), "PPP")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>


        {/* Booking card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="mt-0.5 font-serif text-3xl font-semibold text-foreground">
              ${creative.priceFrom.toLocaleString()}
              {creative.category === "catering" && (
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
              onClick={() => setQuoteOpen(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <FileText className="h-4 w-4" /> Request a quote
            </button>
            <a
              href={creativeWhatsAppLink(creative)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#25D366]/90"
            >
              <CalendarPlus className="h-4 w-4" /> Book an appointment
            </a>
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

      {/* Request a quote dialog */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Request a quote</DialogTitle>
            <DialogDescription>
              Tell {creative.name} about your wedding and we'll send your requirements straight to them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="quote-name">Full name</Label>
                <Input
                  id="quote-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quote-email">Email</Label>
                <Input
                  id="quote-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quote-phone">Phone</Label>
              <Input
                id="quote-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+961 …"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beirut">Beirut</SelectItem>
                    <SelectItem value="Mount Lebanon">Mount Lebanon</SelectItem>
                    <SelectItem value="North Lebanon">North Lebanon</SelectItem>
                    <SelectItem value="South Lebanon">South Lebanon</SelectItem>
                    <SelectItem value="Bekaa">Bekaa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Number of guests</Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger>
                    <SelectValue placeholder="Guest count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50-100">50 — 100</SelectItem>
                    <SelectItem value="100-150">100 — 150</SelectItem>
                    <SelectItem value="150-250">150 — 250</SelectItem>
                    <SelectItem value="250+">250+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Venue type</Label>
                <Select value={venueType} onValueChange={setVenueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Indoor or outdoor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor Venue">Indoor Venue</SelectItem>
                    <SelectItem value="Outdoor Venue">Outdoor Venue</SelectItem>
                    <SelectItem value="Indoor & Outdoor">Indoor &amp; Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Wedding date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !weddingDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {weddingDate ? format(weddingDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={weddingDate}
                      onSelect={setWeddingDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Catering cuisine</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      selectedCuisines.length === 0 && "text-muted-foreground",
                    )}
                  >
                    {selectedCuisines.length === 0
                      ? "Select cuisines"
                      : selectedCuisines.length === 1
                        ? selectedCuisines[0]
                        : `${selectedCuisines[0]} +${selectedCuisines.length - 1} more`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <ScrollArea className="h-56 p-2">
                    <div className="space-y-1">
                      {cuisineOptions.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <Checkbox
                            checked={selectedCuisines.includes(option)}
                            onCheckedChange={() => toggleCuisine(option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quote-notes">Additional notes</Label>
              <Textarea
                id="quote-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else the creative should know…"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitQuote} disabled={sending}>
              <Send className="mr-2 h-4 w-4" /> {sending ? "Sending…" : "Send to creative"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write a review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Write a review</DialogTitle>
            <DialogDescription>
              Share your experience with {creative.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="review-name">Your name</Label>
              <Input
                id="review-name"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-colors",
                        i < reviewRating
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-text">Your review</Label>
              <Textarea
                id="review-text"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you love about working with them?"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={submittingReview}>
              <Send className="mr-2 h-4 w-4" /> {submittingReview ? "Submitting…" : "Submit review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {related.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            More {creative.categoryLabel.toLowerCase()}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <CreativeCard key={s.id} creative={s} />
            ))}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
