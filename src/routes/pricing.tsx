import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing for Wedding Suppliers — WeddingHub Lebanon" },
      {
        name: "description",
        content:
          "List your wedding business on WeddingHub Lebanon. Simple monthly plans to reach engaged couples — Featured, Premium and Elite tiers.",
      },
      { property: "og:title", content: "Supplier Pricing — WeddingHub Lebanon" },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    tier: "Featured",
    price: 10,
    blurb: "Get discovered in your category.",
    highlight: false,
    features: [
      "Listing in category & search",
      "Profile with photo gallery",
      "Direct enquiry messages",
      "Ratings & reviews",
      "Basic analytics",
    ],
  },
  {
    tier: "Premium",
    price: 35,
    blurb: "Stand out and win more leads.",
    highlight: true,
    features: [
      "Everything in Featured",
      "Priority placement in results",
      "Premium badge on profile",
      "Up to 30 portfolio images",
      "Featured in category page",
      "Advanced lead analytics",
    ],
  },
  {
    tier: "Elite",
    price: 50,
    blurb: "Maximum reach and prestige.",
    highlight: false,
    features: [
      "Everything in Premium",
      "Top of search results",
      "Homepage feature rotation",
      "Verified Elite badge",
      "Unlimited portfolio images",
      "Dedicated account support",
    ],
  },
];

const faqs = [
  {
    q: "How does billing work?",
    a: "Plans are billed monthly with the option to save with annual prepayment. You can upgrade, downgrade or cancel at any time.",
  },
  {
    q: "How do couples contact me?",
    a: "Engaged couples send enquiries directly through your profile. You receive a notification and can reply from your supplier dashboard.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes — switch between Featured, Premium and Elite whenever you like. Changes take effect on your next billing cycle.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fees. Your monthly plan covers everything, including profile creation and ongoing support.",
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> For suppliers
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Reach couples planning their wedding
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Join Lebanon's growing wedding marketplace. Choose the plan that fits your business and
            start receiving enquiries from engaged couples.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-7",
                plan.highlight
                  ? "border-primary shadow-xl shadow-primary/10 lg:-translate-y-3"
                  : "border-border",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h2 className="font-serif text-2xl font-semibold text-foreground">{plan.tier}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold text-foreground">${plan.price}</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={cn(
                  "mt-7 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-medium transition-colors",
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
                )}
              >
                Choose {plan.tier} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prices shown in USD. Annual prepayment options available. Demo prototype — no payment is taken.
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <h2 className="text-center font-serif text-3xl font-semibold text-foreground">
          Frequently asked
        </h2>
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((faq) => (
            <details key={faq.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-foreground">
                {faq.q}
                <span className="ml-4 text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-primary px-6 py-14 text-center sm:px-12">
          <h2 className="font-serif text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Ready to grow your bookings?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/85">
            Create your profile in minutes and start connecting with couples today.
          </p>
          <Link
            to="/suppliers"
            className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-background px-6 py-3 text-sm font-medium text-primary transition-transform hover:scale-105"
          >
            See how listings look <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
