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

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60">
                <th className="p-4 text-left font-medium text-muted-foreground">Plan</th>
                {PLANS.map((plan) => (
                  <th
                    key={plan.key}
                    className={cn(
                      "p-4 text-center font-semibold text-foreground",
                      plan.key === current && "bg-primary/5",
                    )}
                  >
                    {plan.key}
                    {plan.key === "Premium" && (
                      <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                        Popular
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-4 font-medium text-muted-foreground">Monthly price</td>
                {PLANS.map((plan) => (
                  <td
                    key={plan.key}
                    className={cn("p-4 text-center", plan.key === current && "bg-primary/5")}
                  >
                    <span className="text-xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-muted-foreground">Portfolio limit</td>
                {PLANS.map((plan) => (
                  <td
                    key={plan.key}
                    className={cn("p-4 text-center text-muted-foreground", plan.key === current && "bg-primary/5")}
                  >
                    {plan.portfolioLimit}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 align-top font-medium text-muted-foreground">What's included</td>
                {PLANS.map((plan) => (
                  <td
                    key={plan.key}
                    className={cn(
                      "p-4 align-top",
                      plan.key === current && "bg-primary/5",
                    )}
                  >
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-muted-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4"></td>
                {PLANS.map((plan) => {
                  const isCurrent = plan.key === current;
                  return (
                    <td
                      key={plan.key}
                      className={cn("p-4 text-center", plan.key === current && "bg-primary/5")}
                    >
                      <Button
                        variant={isCurrent ? "outline" : "default"}
                        disabled={isCurrent || saving !== null}
                        onClick={() => choose(plan.key)}
                        className="w-full"
                      >
                        {saving === plan.key ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isCurrent ? (
                          "Current plan"
                        ) : (
                          `Choose ${plan.key}`
                        )}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Plan changes apply immediately. Online payment processing will be added soon.
      </p>
    </div>
  );
}
