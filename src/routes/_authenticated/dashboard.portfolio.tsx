import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Star, FileText, Video, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMySupplier } from "@/hooks/use-my-supplier";
import { PORTFOLIO_LIMITS } from "@/lib/supplier-constants";
import type { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/dashboard/portfolio")({
  component: PortfolioPage,
});

type Media = Tables<"portfolio">;

function PortfolioPage() {
  const queryClient = useQueryClient();
  const { data: supplier } = useMySupplier();
  const supplierId = supplier?.id;
  const plan = supplier?.subscription_plan ?? "Featured";
  const limits = PORTFOLIO_LIMITS[plan];

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["portfolio", supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase.from("portfolio").select("*").eq("supplier_id", supplierId!).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const photoCount = items.filter((i) => i.media_type === "image").length;
  const videoCount = items.filter((i) => i.media_type === "video").length;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ media_url: "", media_type: "image", caption: "" });

  const add = async () => {
    if (!form.media_url.trim()) return toast.error("Media URL is required.");
    if (form.media_type === "image" && photoCount >= limits.photos)
      return toast.error(`Your ${plan} plan allows ${limits.photos} photos. Upgrade for more.`);
    if (form.media_type === "video" && videoCount >= limits.videos)
      return toast.error(`Your ${plan} plan allows ${limits.videos} video(s). Upgrade for more.`);

    const { error } = await supabase.from("portfolio").insert({
      supplier_id: supplierId!,
      media_url: form.media_url.trim(),
      media_type: form.media_type,
      caption: form.caption,
      is_cover: items.length === 0 && form.media_type === "image",
      sort_order: items.length,
    });
    if (error) return toast.error(error.message);
    setForm({ media_url: "", media_type: "image", caption: "" });
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    toast.success("Media added.");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("portfolio").delete().eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    toast.success("Removed.");
  };

  const setCover = async (item: Media) => {
    await supabase.from("portfolio").update({ is_cover: false }).eq("supplier_id", supplierId!);
    const { error } = await supabase.from("portfolio").update({ is_cover: true }).eq("id", item.id);
    if (error) return toast.error(error.message);
    if (item.media_url) await supabase.from("suppliers").update({ image_url: item.media_url }).eq("id", supplierId!);
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    queryClient.invalidateQueries({ queryKey: ["my-supplier"] });
    toast.success("Cover image set.");
  };

  const typeIcon = (t: string) => (t === "video" ? Video : t === "pdf" ? FileText : ImageIcon);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Portfolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Showcase your work. {plan} plan: {limits.photos === Infinity ? "unlimited" : limits.photos} photos
            {limits.videos === Infinity ? "" : ` · ${limits.videos} video(s)`}.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add media</Button>
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No media yet. Add image, video or PDF links to build your gallery.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => {
            const Icon = typeIcon(item.media_type);
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative aspect-[4/3] bg-muted">
                  {item.media_type === "image" ? (
                    <img src={item.media_url} alt={item.caption} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <a href={item.media_url} target="_blank" rel="noreferrer" className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Icon className="h-8 w-8" />
                      <span className="text-xs uppercase">{item.media_type}</span>
                    </a>
                  )}
                  {item.is_cover && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      Cover
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {item.caption && <p className="truncate text-sm text-foreground">{item.caption}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    {item.media_type === "image" ? (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setCover(item)} disabled={item.is_cover}>
                        <Star className="h-3.5 w-3.5" /> Cover
                      </Button>
                    ) : <span />}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add media</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.media_type} onValueChange={(v) => setForm({ ...form, media_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="pdf">PDF brochure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Media URL</Label>
              <Input value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} placeholder="https://…" />
            </div>
            <div className="space-y-1.5">
              <Label>Caption (optional)</Label>
              <Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={add}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
