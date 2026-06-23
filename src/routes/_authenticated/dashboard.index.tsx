import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Store,
  Package,
  Images,
  Inbox,
  Star,
  Eye,
  BadgeCheck,
  CircleAlert,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { useMySupplier } from "@/hooks/use-my-supplier";
import { bootstrapAdmin } from "@/lib/admin-bootstrap.functions";
import { STATUS_LABEL } from "@/lib/supplier-constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: "bg-primary/10 text-primary",
    pending: "bg-amber-500/15 text-amber-600",
    rejected: "bg-destructive/10 text-destructive",
    suspended: "bg-destructive/10 text-destructive",
    draft: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? styles.draft}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function DashboardHome() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { data: supplier, isLoading } = useMySupplier();
  const [claiming, setClaiming] = useState(false);

  const { data: leadStats } = useQuery({
    queryKey: ["lead-stats", supplier?.id],
    enabled: !!supplier?.id,
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const [{ count: total }, { count: monthly }] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("supplier_id", supplier!.id),
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("supplier_id", supplier!.id)
          .gte("created_at", startOfMonth.toISOString()),
      ]);
      return { total: total ?? 0, monthly: monthly ?? 0 };
    },
  });

  const claimAdmin = async () => {
    setClaiming(true);
    try {
      const res = await bootstrapAdmin();
      if (res.granted) {
        toast.success("You are now a platform admin. Reloading…");
        setTimeout(() => window.location.reload(), 900);
      } else {
        toast.info("An admin already exists for this platform.");
      }
    } catch (e) {
      toast.error("Could not grant admin access.");
    } finally {
      setClaiming(false);
    }
  };

  if (isLoading || !supplier) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const name = supplier.company_name || user?.email?.split("@")[0] || "there";

  const cards = [
    { label: "Profile Status", value: STATUS_LABEL[supplier.status] ?? supplier.status, icon: BadgeCheck },
    { label: "Current Plan", value: supplier.subscription_plan, icon: Star },
    { label: "Monthly Leads", value: String(leadStats?.monthly ?? 0), icon: Inbox },
    { label: "Profile Views", value: String(supplier.profile_views), icon: Eye },
    { label: "Rating", value: supplier.rating ? `${supplier.rating.toFixed(1)} ★` : "—", icon: Star },
  ];

  const actions = [
    { label: "Edit Profile", to: "/dashboard/profile", icon: Store },
    { label: "Add Service", to: "/dashboard/services", icon: Package },
    { label: "Upload Photos", to: "/dashboard/portfolio", icon: Images },
    { label: "View Leads", to: "/dashboard/leads", icon: Inbox },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Welcome, {name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's an overview of your business activity.</p>
        </div>
        <StatusBadge status={supplier.status} />
      </div>

      {(supplier.status === "draft" || supplier.status === "rejected") && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-foreground">Your profile isn't live yet</p>
              <p className="text-sm text-muted-foreground">
                Complete your profile and submit it for admin approval to appear on the website.
              </p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link to="/dashboard/profile">Complete profile</Link>
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <c.icon className="h-5 w-5 text-accent" />
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{c.value}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-serif text-lg font-semibold text-foreground">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <a.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {!isAdmin && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-medium text-foreground">Platform administration</p>
              <p className="text-sm text-muted-foreground">
                The first account can claim admin access to review &amp; approve suppliers.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={claimAdmin} disabled={claiming}>
            {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim admin access"}
          </Button>
        </Card>
      )}
    </div>
  );
}
