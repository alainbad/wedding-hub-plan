# Per-Category Quote Form

Right now the "Request a quote" dialog on the creative profile page shows the same fields to every supplier — including "Catering cuisine", which only makes sense for caterers. We'll drive the form fields from each supplier's category so customers only see questions relevant to that vendor.

## What customers will see (per category)

Every category keeps the **shared fields**: Full name, Email, Phone, Location, Wedding date, Additional notes.

On top of those, each category gets its own relevant questions:

| Category | Category-specific fields |
|---|---|
| Venues | Number of guests, Venue type (indoor/outdoor), Event type |
| Catering | Number of guests, Cuisine (multi-select), Service style (plated / buffet / family-style / stations) |
| Photography & Film | Coverage length, Add-ons (engagement session, second shooter, cinematic film), Number of guests |
| Florists & Décor | Style preference (garden / modern / classic / minimal), Areas to decorate |
| Entertainment | Performance type (live band / DJ / quartet / solo), Number of guests |
| Hair & Makeup | Service needed (hair / makeup / both), Bridal party size, On-location service (yes/no) |
| Cakes & Sweets | Number of servings, Flavor preference, Dessert table (yes/no) |
| Car Rentals | Number of cars, Car style (vintage / luxury / sports), Pickup location |
| Travel & Accommodation | Number of rooms, Check-in date, Check-out date |
| Event Planners | Number of guests, Planning level (full / partial / day-of) |
| Reception Organizers | Number of guests, Services needed (MC / DJ / lighting / games) |

Caterers keep the cuisine selector; everyone else loses it and instead sees the questions that fit their service.

## How it works

- A new config maps each `CategorySlug` to its list of extra fields. Each field has a key, label, input type (select, multi-select, number, date, yes/no), and options where relevant.
- The dialog renders the shared fields plus the category's configured fields dynamically.
- All answers are collected into a single structured object and appended to the lead `message` (for database-backed suppliers) or the email draft (for demo suppliers), so nothing is lost on the receiving end.
- The booking-card "$ / guest" label and other category-aware bits stay as they are.

## Technical details

- **`src/lib/creative-constants.ts`** — add a `QUOTE_FIELDS_BY_CATEGORY` config: `Record<CategorySlug, QuoteField[]>` where `QuoteField = { key: string; label: string; type: "text" | "number" | "select" | "multiselect" | "date" | "boolean"; placeholder?: string; options?: string[] }`. Move the existing `cuisineOptions` list here as the catering cuisine field's options. Include all 11 category slugs (the public `CategorySlug` union), not just the 7 in `CATEGORY_OPTIONS`.
- **`src/routes/creative.$creativeId.tsx`**:
  - Replace the hard-coded cuisine/guests/venue-type form blocks with a generic renderer driven by `QUOTE_FIELDS_BY_CATEGORY[creative.category]`.
  - Store dynamic answers in a single `useState<Record<string, string | string[]>>` keyed by field key (replacing the individual `guests`/`venueType`/`selectedCuisines` states, keeping shared states for name/email/phone/location/date/notes).
  - In `submitQuote`, build the message/email body from the shared fields plus a labeled list of the category's dynamic answers; map a `guests`-type field into the `guest_count` column when present, and a `date`-type field into `event_date` when present.
  - Keep validation light and consistent with current behavior (encode values for the mailto link; trim inputs).
  - Reuse existing UI primitives (Select, Checkbox+Popover+ScrollArea for multiselect, Calendar+Popover for date, Input for text/number, a simple two-option toggle/select for boolean).

No database schema changes are needed — answers continue to flow into the existing `leads.message` / `guest_count` / `event_date` fields.
