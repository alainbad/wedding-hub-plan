Goal: replace every user-facing occurrence of "Suppliers" with "Creatives" across the site (navigation, headings, URLs, component/file names, page copy) while preserving the existing database schema so no migrations or data changes are required.

Scope of changes
----------------
1. Public routes & URLs
   - `/suppliers` → `/creatives`
   - `/supplier/$supplierId` → `/creative/$creativeId`
   - TanStack file-based routing requires renaming the route files, which auto-regenerates `routeTree.gen.ts`.

2. Source files to rename
   - `src/routes/suppliers.tsx` → `src/routes/creatives.tsx`
   - `src/routes/supplier.$supplierId.tsx` → `src/routes/creative.$creativeId.tsx`
   - `src/components/SupplierCard.tsx` → `src/components/CreativeCard.tsx`
   - `src/data/suppliers.ts` → `src/data/creatives.ts`
   - `src/lib/supplier-adapter.ts` → `src/lib/creative-adapter.ts`
   - `src/lib/supplier-constants.ts` → `src/lib/creative-constants.ts`
   - `src/hooks/use-my-supplier.ts` → `src/hooks/use-my-creative.ts`

3. Code symbols & text to update
   - Component names: `SupplierCard` → `CreativeCard`
   - Type names: `Supplier` → `Creative`, `SupplierRow` → `CreativeRow`
   - Variable/function names: `suppliers` → `creatives`, `supplier` → `creative`, `getSupplier` → `getCreative`, `adaptSupplier` → `adaptCreative`, `useMySupplier` → `useMyCreative`
   - UI copy: page titles, meta tags, headings, buttons, footer links, CTAs (e.g. "Browse Wedding Suppliers" → "Browse Wedding Creatives", "Supplier Portal" → "Creative Portal")
   - Query keys and internal labels for consistency.

4. What will NOT change
   - Database schema: the `suppliers` table, `supplier_id` columns, `supplier_status` enum, `app_role` value `supplier`, and Supabase-generated `src/integrations/supabase/types.ts` will remain as-is. The internal data model still refers to suppliers; only the public website brand term becomes "Creatives".
   - Existing migrations under `supabase/migrations/` will not be edited.

5. Verification
   - Run `tsc --noEmit` to confirm type safety.
   - Restart the dev server so TanStack regenerates `routeTree.gen.ts`.
   - Use Playwright to verify `/creatives` loads, `/creative/<id>` works, and no "Supplier" text remains in public UI.