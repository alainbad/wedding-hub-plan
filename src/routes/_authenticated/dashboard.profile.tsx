import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMySupplier, type SupplierRow } from "@/hooks/use-my-supplier";
import {
  CATEGORY_OPTIONS,
  REGION_OPTIONS,
  SERVICE_AREAS,
  categoryLabelFor,
} from "@/lib/supplier-constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfilePage,
});

type FormState = Partial<SupplierRow>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: supplier, isLoading } = useMySupplier();
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);

  useEffect(() => {
    if (supplier) setForm(supplier);
  }, [supplier]);

  if (isLoading || !supplier) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const set = (key: keyof SupplierRow, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const toggleArea = (area: string) => {
    const current = (form.service_areas as string[]) ?? [];
    set(
      "service_areas",
      current.includes(area) ? current.filter((a) => a !== area) : [...current, area],
    );
  };

  const save = async (submit: boolean) => {
    setSaving(submit ? "submit" : "draft");
    const nextStatus = submit
      ? "pending"
      : supplier.status === "approved"
        ? "pending"
        : "draft";

    const payload = {
      company_name: form.company_name ?? "",
      category: form.category ?? "venues",
      category_label: categoryLabelFor(form.category ?? "venues"),
      city: form.city ?? "",
      region: form.region ?? "",
      address: form.address ?? "",
      maps_location: form.maps_location ?? "",
      tagline: form.tagline ?? "",
      about: form.about ?? "",
      phone: form.phone ?? "",
      whatsapp: form.whatsapp ?? "",
      email: form.email ?? "",
      website: form.website ?? "",
      instagram: form.instagram ?? "",
      facebook: form.facebook ?? "",
      tiktok: form.tiktok ?? "",
      starting_price: Number(form.starting_price) || 0,
      price_range: form.price_range ?? "",
      service_areas: (form.service_areas as string[]) ?? [],
      image_url: form.image_url ?? "",
      status: nextStatus as SupplierRow["status"],
    };

    const { error } = await supabase.from("suppliers").update(payload).eq("id", supplier.id);
    setSaving(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["my-supplier"] });
    if (submit) toast.success("Submitted for approval! An admin will review your profile.");
    else if (nextStatus === "pending")
      toast.success("Saved. Your changes will be reviewed before going live.");
    else toast.success("Draft saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your business information. Changes are reviewed by an admin before appearing on the website.
        </p>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="font-serif text-lg font-semibold text-foreground">Business information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name">
            <Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} />
          </Field>
          <Field label="Category">
            <Select value={form.category ?? "venues"} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="City">
            <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Region">
            <Select value={form.region || undefined} onValueChange={(v) => set("region", v)}>
              <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Address">
            <Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Google Maps link">
            <Input value={form.maps_location ?? ""} onChange={(e) => set("maps_location", e.target.value)} placeholder="https://maps.google.com/…" />
          </Field>
        </div>
        <Field label="Tagline">
          <Input value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} placeholder="A short headline for your listing" />
        </Field>
        <Field label="Business description">
          <Textarea rows={4} value={form.about ?? ""} onChange={(e) => set("about", e.target.value)} />
        </Field>
        <Field label="Cover image URL">
          <Input value={form.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…/photo.jpg" />
        </Field>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-serif text-lg font-semibold text-foreground">Contact information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone number">
            <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="WhatsApp number">
            <Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
          <Field label="Email address">
            <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Website URL">
            <Input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} />
          </Field>
          <Field label="Instagram URL">
            <Input value={form.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} />
          </Field>
          <Field label="Facebook URL">
            <Input value={form.facebook ?? ""} onChange={(e) => set("facebook", e.target.value)} />
          </Field>
          <Field label="TikTok URL">
            <Input value={form.tiktok ?? ""} onChange={(e) => set("tiktok", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-serif text-lg font-semibold text-foreground">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starting price (USD)">
            <Input type="number" min={0} value={form.starting_price ?? 0} onChange={(e) => set("starting_price", e.target.value)} />
          </Field>
          <Field label="Price range">
            <Input value={form.price_range ?? ""} onChange={(e) => set("price_range", e.target.value)} placeholder="e.g. $$$ · $5,000–$10,000" />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-serif text-lg font-semibold text-foreground">Service areas</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICE_AREAS.map((area) => {
            const checked = ((form.service_areas as string[]) ?? []).includes(area);
            return (
              <label key={area} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <Checkbox checked={checked} onCheckedChange={() => toggleArea(area)} />
                {area}
              </label>
            );
          })}
        </div>
      </Card>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-secondary/20 py-4">
        <Button variant="outline" onClick={() => save(false)} disabled={saving !== null}>
          {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save draft
        </Button>
        <Button onClick={() => save(true)} disabled={saving !== null}>
          {saving === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit for approval
        </Button>
      </div>
    </div>
  );
}
