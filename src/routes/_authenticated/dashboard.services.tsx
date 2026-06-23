import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMySupplier } from "@/hooks/use-my-supplier";
import type { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/dashboard/services")({
  component: ServicesPage,
});

type Service = Tables<"services">;
type Pkg = Tables<"packages">;

function ServicesPage() {
  const queryClient = useQueryClient();
  const { data: supplier } = useMySupplier();
  const supplierId = supplier?.id;

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services", supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("supplier_id", supplierId!).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const { data: packages = [], isLoading: pkgLoading } = useQuery({
    queryKey: ["packages", supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*").eq("supplier_id", supplierId!).order("price");
      if (error) throw error;
      return data;
    },
  });

  // service dialog state
  const [svcOpen, setSvcOpen] = useState(false);
  const [editSvc, setEditSvc] = useState<Service | null>(null);
  const [svcForm, setSvcForm] = useState({ name: "", description: "", price: "", duration: "" });

  const openSvc = (s?: Service) => {
    setEditSvc(s ?? null);
    setSvcForm(
      s
        ? { name: s.name, description: s.description, price: String(s.price), duration: s.duration }
        : { name: "", description: "", price: "", duration: "" },
    );
    setSvcOpen(true);
  };

  const saveSvc = async () => {
    if (!svcForm.name.trim()) return toast.error("Service name is required.");
    const payload = {
      supplier_id: supplierId!,
      name: svcForm.name.trim(),
      description: svcForm.description,
      price: Number(svcForm.price) || 0,
      duration: svcForm.duration,
    };
    const { error } = editSvc
      ? await supabase.from("services").update(payload).eq("id", editSvc.id)
      : await supabase.from("services").insert(payload);
    if (error) return toast.error(error.message);
    setSvcOpen(false);
    queryClient.invalidateQueries({ queryKey: ["services"] });
    toast.success(editSvc ? "Service updated." : "Service added.");
  };

  const delSvc = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["services"] });
    toast.success("Service deleted.");
  };

  // package dialog state
  const [pkgOpen, setPkgOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<Pkg | null>(null);
  const [pkgForm, setPkgForm] = useState({ name: "", price: "", description: "", includes: "" });

  const openPkg = (p?: Pkg) => {
    setEditPkg(p ?? null);
    setPkgForm(
      p
        ? { name: p.name, price: String(p.price), description: p.description, includes: p.includes.join("\n") }
        : { name: "", price: "", description: "", includes: "" },
    );
    setPkgOpen(true);
  };

  const savePkg = async () => {
    if (!pkgForm.name.trim()) return toast.error("Package name is required.");
    const payload = {
      supplier_id: supplierId!,
      name: pkgForm.name.trim(),
      price: Number(pkgForm.price) || 0,
      description: pkgForm.description,
      includes: pkgForm.includes.split("\n").map((l) => l.trim()).filter(Boolean),
    };
    const { error } = editPkg
      ? await supabase.from("packages").update(payload).eq("id", editPkg.id)
      : await supabase.from("packages").insert(payload);
    if (error) return toast.error(error.message);
    setPkgOpen(false);
    queryClient.invalidateQueries({ queryKey: ["packages"] });
    toast.success(editPkg ? "Package updated." : "Package added.");
  };

  const delPkg = async (id: string) => {
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["packages"] });
    toast.success("Package deleted.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Services &amp; Packages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create the services and packages couples can book.</p>
      </div>

      {/* Services */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Services</h2>
          <Button size="sm" onClick={() => openSvc()}><Plus className="h-4 w-4" /> Add service</Button>
        </div>
        {servicesLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : services.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">No services yet.</Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <Card key={s.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{s.name}</p>
                  {s.description && <p className="mt-0.5 text-sm text-muted-foreground">{s.description}</p>}
                  <p className="mt-1 text-sm text-foreground">
                    {s.price > 0 && <span className="font-semibold">${s.price.toLocaleString()}</span>}
                    {s.duration && <span className="text-muted-foreground"> · {s.duration}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openSvc(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => delSvc(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Packages */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Packages</h2>
          <Button size="sm" onClick={() => openPkg()}><Plus className="h-4 w-4" /> Add package</Button>
        </div>
        {pkgLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : packages.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">No packages yet.</Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {packages.map((p) => (
              <Card key={p.id} className="flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-accent" />
                    <p className="font-serif text-base font-semibold text-foreground">{p.name}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openPkg(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => delPkg(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <p className="mt-1 text-lg font-semibold text-primary">${p.price.toLocaleString()}</p>
                {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                {p.includes.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {p.includes.map((i, idx) => (
                      <li key={idx} className="flex gap-2"><span className="text-primary">•</span>{i}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Service dialog */}
      <Dialog open={svcOpen} onOpenChange={setSvcOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editSvc ? "Edit service" : "Add service"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Service name</Label><Input value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={svcForm.description} onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Starting price (USD)</Label><Input type="number" min={0} value={svcForm.price} onChange={(e) => setSvcForm({ ...svcForm, price: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Duration</Label><Input value={svcForm.duration} onChange={(e) => setSvcForm({ ...svcForm, duration: e.target.value })} placeholder="e.g. 8 hours" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSvcOpen(false)}>Cancel</Button>
            <Button onClick={saveSvc}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package dialog */}
      <Dialog open={pkgOpen} onOpenChange={setPkgOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editPkg ? "Edit package" : "Add package"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Package name</Label><Input value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} placeholder="e.g. Gold" /></div>
              <div className="space-y-1.5"><Label>Price (USD)</Label><Input type="number" min={0} value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Input value={pkgForm.description} onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Includes (one item per line)</Label>
              <Textarea rows={5} value={pkgForm.includes} onChange={(e) => setPkgForm({ ...pkgForm, includes: e.target.value })} placeholder={"Item 1\nItem 2\nItem 3"} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPkgOpen(false)}>Cancel</Button>
            <Button onClick={savePkg}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
