# Phase 1 — Financial Model (Build Plan)

You confirmed: proceed without the source doc, Phase 1 first, and you delegated the specific numbers to me. So this model ships with **benchmarked, clearly-labeled assumptions** on a single Assumptions tab — every one is a yellow input cell you can overwrite, and the whole model recalculates from there. Nothing is a bare hardcoded constant.

## Deliverable
A single workbook: `WeddingHub-Lebanon-Financial-Model.xlsx`, saved to `/mnt/documents/` and delivered as a downloadable artifact. All outputs are Excel formulas (not values baked in Python), recalculated and error-checked before delivery.

## Proposed assumptions (you override on review)
These are starting points benchmarked to regional B2B marketplace / SaaS norms and Lebanon's market reality. All live on the Assumptions tab.

**Pricing (monthly, USD), with annual = 10× monthly (2 months free):**
- Featured — $29/mo
- Premium — $79/mo
- Elite — $199/mo

**Supplier growth target:** 300 paying-eligible suppliers by end of Year 1, ramping to ~2,500 by end of Year 3 (matches the targets referenced in your plan).

**Funnel:** free listing → activated → paid. Free→paid conversion 12% (Y1, manual high-touch sales), drifting to 18% as the brand matures.

**Tier mix of paying suppliers:** 60% Featured / 30% Premium / 10% Elite.

**Monthly churn:** Featured 5% / Premium 3.5% / Elite 2% (lower tiers churn faster).

**CAC:** modeled as manual-sales cost = rep time per closed supplier × blended hourly cost, plus a small ad-spend line. ~$45 blended CAC in Y1.

**Billing split:** 70% monthly / 30% annual (annual prepay affects cash timing).

**FX/payments:** revenue modeled in USD (fresh-dollar economy assumption for Lebanon); payment-collection mechanism flagged as an open risk note on the model, since you left it blank — I'll derive the funding ask from runway rather than pick it arbitrarily.

## Workbook structure (tabs)
1. **Cover / README** — purpose, version, "all yellow cells are inputs" legend, list of every assumption with source/rationale.
2. **Assumptions** — every driver in one place (pricing, conversion, churn, tier mix, CAC, opex lines, hiring, billing split). Blue = hardcoded input, black = formula.
3. **Supplier Funnel (36 mo)** — monthly: new free signups → activations → new paid → churned → net paying suppliers, split by tier.
4. **Revenue (36 mo)** — MRR and ARR by tier and total, derived from funnel × pricing; annual-prepay cash adjustment.
5. **Costs & Opex (36 mo)** — sales/CAC, salaries/hiring ramp, infra (Supabase/hosting), marketing/content, G&A.
6. **P&L / Cash (36 mo)** — gross margin, EBITDA, monthly burn, cumulative cash, runway.
7. **Funding Ask** — runway-derived raise (burn to cash-flow-positive + buffer) with use-of-funds breakdown. Feeds Phase 5 deck.
8. **Sensitivity** — table showing Y2/Y3 revenue if conversion is 50% / 75% / 100% / 125% of base; second table flexing churn. This directly stress-tests the unexplained Y2/Y3 jumps your Phase 0 audit flagged.

## Verification (definition of done)
- Recalculate via the xlsx skill's `recalculate_formulas.py`; confirm **zero** formula errors (#REF!, #DIV/0!, #VALUE!, #NAME?).
- Spot-check that every revenue/cost cell traces to an Assumptions input (no orphan constants).
- Confirm color conventions: blue = inputs, black = formulas, yellow fill = key assumptions to revisit.
- Confirm the sensitivity tab actually swings outputs when conversion/churn change (live dependency, not static).
- Open-question note block present (payments mechanism, founder pricing override) so nothing silently passes as settled.

## Out of scope for this phase
No deck, schema, PRD, or GTM work — those are Phases 2–8, executed on separate request. This phase only produces and verifies the financial model.

## Technical note
This is a standalone spreadsheet artifact generated with the xlsx skill (openpyxl + LibreOffice recalculation). It does not touch the app codebase, routes, or Supabase. When you approve, I'll switch to build mode and produce the workbook.
