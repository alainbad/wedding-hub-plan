import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Check,
  X,
  Ban,
  Trash2,
  Store,
  Inbox,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-auth";
import { STATUS_LABEL } from "@/lib/supplier-constants";
import type { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Supplier = Tables<"suppliers">;

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, loading } = useIsAdmin();

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["admin-suppliers"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: leadCount = 0 } = useQuery({
    queryKey: ["admin-lead-count"],
    enabled: isAdmin,
    queryFn: async () => {
      const { count, error } = await supabase.from("leads").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const setStatus = async (id: string, status: Supplier["status"]) => {
    const { error } = await supabase.from("suppliers").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    toast.success(`Supplier ${STATUS_LABEL[status]?.toLowerCase()}.`);
  };

  const setPlan = async (id: string, plan: Supplier["subscription_plan"]) => {
    const { error } = await supabase.from("suppliers").update({ subscription_plan: plan }).eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    toast.success("Plan updated.");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    toast.success("Supplier deleted.");
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-secondary/20 px-4 text-center">
        <ShieldCheck className="h-10 w-10 text-muted-foreground" />
        <h1 className="font-serif text-2xl font-semibold text-foreground">Admins only</h1>
        <p className="max-w-sm text-sm text-muted-foreground">You don't have administrator access to this area.</p>
        <Button onClick={() => navigate({ to: "/dashboard" })}>Back to dashboard</Button>
      </div>
    );
  }

  const pending = suppliers.filter((s) => s.status === "pending").length;
  const approved = suppliers.filter((s) => s.status === "approved").length;

  const stats = [
    { label: "Total suppliers", value: suppliers.length, icon: Store },
    { label: "Pending approval", value: pending, icon: Clock },
    { label: "Published", value: approved, icon: Check },
    { label: "Total leads", value: leadCount, icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span className="font-serif text-lg font-semibold text-foreground">Admin Console</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /> My dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-4">
              <s.icon className="h-5 w-5 text-accent" />
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{s.value}</p>
            </Card>
          ))}
        </div>

        <h2 className="font-serif text-xl font-semibold text-foreground">Supplier management</h2>

        {suppliersLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : suppliers.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">No suppliers registered yet.</Card>
        ) : (
          <div className="space-y-3">
            {suppliers.map((s) => (
              <Card key={s.id} className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {s.image_url ? <img src={s.image_url} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{s.company_name || "Untitled supplier"}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {s.category_label}{s.city ? ` · ${s.city}` : ""}{s.region ? `, ${s.region}` : ""}
                    </p>
                    <span className={cn(
                      "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      s.status === "approved" && "bg-primary/10 text-primary",
                      s.status === "pending" && "bg-amber-500/15 text-amber-600",
                      (s.status === "rejected" || s.status === "suspended") && "bg-destructive/10 text-destructive",
                      s.status === "draft" && "bg-muted text-muted-foreground",
                    )}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={s.subscription_plan} onValueChange={(v) => setPlan(s.id, v as Supplier["subscription_plan"])}>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Featured">Featured</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                  {s.status !== "approved" && (
                    <Button size="sm" onClick={() => setStatus(s.id, "approved")}><Check className="h-4 w-4" /> Approve</Button>
                  )}
                  {s.status !== "rejected" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(s.id, "rejected")}><X className="h-4 w-4" /> Reject</Button>
                  )}
                  {s.status !== "suspended" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(s.id, "suspended")}><Ban className="h-4 w-4" /> Suspend</Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
