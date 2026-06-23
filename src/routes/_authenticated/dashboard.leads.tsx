import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, Inbox, Mail, Phone, MapPin, Users, Calendar, Archive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyCreative } from "@/hooks/use-my-creative";
import { LEAD_STATUSES, LEAD_STATUS_LABEL, type LeadStatus } from "@/lib/creative-constants";
import type { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/dashboard/leads")({
  component: LeadsPage,
});

type Lead = Tables<"leads">;

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-amber-500/15 text-amber-600",
  quoted: "bg-blue-500/15 text-blue-600",
  booked: "bg-green-500/15 text-green-600",
  lost: "bg-muted text-muted-foreground",
};

function LeadsPage() {
  const queryClient = useQueryClient();
  const { data: creative } = useMyCreative();
  const creativeId = creative?.id;
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [showArchived, setShowArchived] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", creativeId],
    enabled: !!creativeId,
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("supplier_id", creativeId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (id: string, status: LeadStatus) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const saveNotes = async (id: string, notes: string) => {
    const { error } = await supabase.from("leads").update({ notes }).eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    toast.success("Notes saved.");
  };

  const archive = async (id: string, archived: boolean) => {
    const { error } = await supabase.from("leads").update({ archived }).eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    toast.success(archived ? "Lead archived." : "Lead restored.");
  };

  const visible = leads.filter(
    (l) => l.archived === showArchived && (filter === "all" || l.status === filter),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Leads &amp; Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your inbox of customer inquiries.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setFilter("all")} className={cn("rounded-full border px-3 py-1.5 text-sm", filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>All</button>
        {LEAD_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cn("rounded-full border px-3 py-1.5 text-sm", filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}>
            {LEAD_STATUS_LABEL[s]}
          </button>
        ))}
        <button onClick={() => setShowArchived((v) => !v)} className={cn("ml-auto rounded-full border px-3 py-1.5 text-sm", showArchived ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground")}>
          <Archive className="mr-1 inline h-3.5 w-3.5" />{showArchived ? "Archived" : "Active"}
        </button>
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : visible.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No {showArchived ? "archived " : ""}leads here yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onStatus={updateStatus} onNotes={saveNotes} onArchive={archive} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({
  lead,
  onStatus,
  onNotes,
  onArchive,
}: {
  lead: Lead;
  onStatus: (id: string, s: LeadStatus) => void;
  onNotes: (id: string, n: string) => void;
  onArchive: (id: string, a: boolean) => void;
}) {
  const [notes, setNotes] = useState(lead.notes);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-semibold text-foreground">{lead.customer_name || "Customer"}</h3>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusStyles[lead.status])}>
              {LEAD_STATUS_LABEL[lead.status]}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {format(new Date(lead.created_at), "PPp")}
          </p>
        </div>
        <Select value={lead.status} onValueChange={(v) => onStatus(lead.id, v as LeadStatus)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{LEAD_STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        {lead.email && <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {lead.email}</span>}
        {lead.phone && <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {lead.phone}</span>}
        {lead.event_date && <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {lead.event_date}</span>}
        {lead.guest_count != null && <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {lead.guest_count} guests</span>}
        {lead.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {lead.location}</span>}
        {lead.budget && <span className="flex items-center gap-2">Budget: {lead.budget}</span>}
      </div>

      {lead.message && (
        <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-foreground">{lead.message}</p>
      )}

      <div className="mt-3 space-y-2">
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Private notes…" />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => onArchive(lead.id, !lead.archived)}>
            <Archive className="h-4 w-4" /> {lead.archived ? "Restore" : "Archive"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onNotes(lead.id, notes)}>Save notes</Button>
        </div>
      </div>
    </Card>
  );
}
