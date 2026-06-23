import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMySupplier } from "@/hooks/use-my-supplier";
import { PLANS, type PlanKey } from "@/lib/supplier-constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/subscription")({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const queryClient = useQueryClient();
  const { data: supplier } = useMySupplier();
  const current = supplier?.subscription_plan ?? "Featured";
  const [saving, setSaving] = useState<PlanKey | null>(null);

  const choose = async (plan: PlanKey) => {
    if (!supplier) return;
    setSaving(plan);
    const { error } = await supabase.from("suppliers").update({ subscription_plan: plan }).eq("id", supplier.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["my-supplier"] });
    toast.success(`You're now on the ${plan} plan.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Subscription Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You're currently on the <span className="font-semibold text-foreground">{current}</span> plan.
          Choose the plan that fits your business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === current;
          return (
            <Card
              key={plan.key}
              className={cn(
                "flex flex-col p-6",
                isCurrent && "border-primary ring-1 ring-primary",
                plan.key === "Premium" && "relative",
              )}
            >
              {plan.key === "Premium" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                  Most popular
                </span>
              )}
              <h2 className="font-serif text-xl font-semibold text-foreground">{plan.key}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
              <p className="mt-4 text-3xl font-bold text-foreground">
                ${plan.price}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <p className="mt-2 text-sm font-medium text-accent">{plan.portfolioLimit}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6"
                variant={isCurrent ? "outline" : "default"}
                disabled={isCurrent || saving !== null}
                onClick={() => choose(plan.key)}
              >
                {saving === plan.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Current plan"
                ) : (
                  `Switch to ${plan.key}`
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Plan changes apply immediately. Online payment processing will be added soon.
      </p>
    </div>
  );
}
