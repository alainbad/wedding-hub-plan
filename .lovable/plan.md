# Wedding Hub — Supplier Dashboard (MVP)

This delivers the MVP scope you defined: Supplier Authentication, Dashboard Home, My Profile, Services & Packages, Portfolio, Lead Inbox, Subscription Page, and the Admin Approval System. Everything is wired to a real backend so approved supplier info flows automatically onto the existing public website.

## Backend (Lovable Cloud)

I'll enable Lovable Cloud (database + auth + storage + server logic — no external accounts needed).

### Auth
- Email/password sign up + login for suppliers.
- A separate `user_roles` table (`supplier`, `admin`) — roles are never stored on the profile (security best practice). A `has_role()` check gates admin features.

### Tables
```text
suppliers      profile/business info, status (draft|pending|approved|rejected|
               suspended), subscription_plan, owner user_id, ratings, contact,
               region, pricing, social links
services       supplier_id, name, description, price, duration
packages       supplier_id, name, price, description, includes[]
portfolio      supplier_id, media_url, media_type, caption, is_cover, sort_order
leads          supplier_id, customer_name, event_date, guest_count, budget,
               location, message, phone, email, status (new|contacted|quoted|
               booked|lost), notes
reviews        supplier_id, customer_name, rating, review (read-only in MVP)
```
- `portfolio-media` storage bucket for image/video/PDF uploads.

### Approval flow (key requirement)
- The public site reads **only `status = 'approved'`** suppliers.
- Any supplier edit sets `status = 'pending'` (edits stay private until an admin re-approves). I'll keep an `approved_*` published snapshot vs. the editable draft so the live listing doesn't change while a re-edit is pending.
- Admin approves/rejects/suspends to flip status to live.

### Security (RLS)
- Suppliers can read/write only their own rows (`auth.uid() = user_id`).
- Public/anon: SELECT only on approved suppliers and their child records.
- Admins (via `has_role`): full management access.
- Leads: a public can INSERT (customer inquiry); only the owning supplier + admins can read.

## Supplier portal (`/dashboard/*`, auth-gated under `_authenticated`)

- **Sidebar layout** (shadcn sidebar): Dashboard, My Profile, Services & Packages, Portfolio, Leads, Subscription, Logout. (Availability, Reviews, Promotions, Settings shown as “coming soon” placeholders to keep MVP tight unless you want them now.)
- **Dashboard Home** — welcome, status cards (profile status, plan, monthly leads, profile views, rating), quick actions.
- **My Profile** — business info, contact, pricing, service areas, social links. Save Draft / Submit for Approval.
- **Services & Packages** — CRUD services; package builder (name, price, includes list); add/edit/delete.
- **Portfolio** — upload images/videos/PDF to storage, set cover, captions, delete, reorder; plan-based limits.
- **Leads & Requests** — inbox with statuses (New→Contacted→Quoted→Booked→Lost), notes, archive.
- **Subscription** — plan comparison (Featured $29 / Premium $79 / Elite $199) and select/upgrade (records choice; real payments out of MVP scope).

## Admin approval system (`/admin/*`, admin-gated)
- Supplier queue: approve / reject / suspend / delete, assign subscription plan.
- View all leads + basic stats.

## Public site integration
- The existing home/suppliers/supplier pages switch from the static `src/data/suppliers.ts` mock to live approved data from the database (server functions for SSR-safe reads). The static file becomes the seed for a migration so the site isn't empty on day one.

## Technical notes
- Server functions (`createServerFn`) for all DB access; public reads via publishable-key client + narrow `anon` SELECT policies; admin/privileged writes verified server-side.
- Auth-gated routes under `src/routes/_authenticated/`; public routes stay top-level.
- Seed data (current mock suppliers) inserted via migration as pre-approved.

## Out of MVP (future)
Availability calendar, Reviews replies/reporting, Promotions, full Settings, real payment processing, SMS/WhatsApp notifications.

---
This is a big build. On approval I'll start by enabling Cloud and creating the schema, then build the portal, then the admin/approval layer and public-site wiring.