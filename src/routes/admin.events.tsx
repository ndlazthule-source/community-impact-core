import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Plus, Pencil, Trash2, ArrowLeft, Upload, X, Star } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { toast } from "sonner";

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 5; // 5 years


export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Event Management — Admin" }] }),
  component: AdminEventsPage,
});

type EventRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  objectives: string | null;
  location: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  attendees_count: number | null;
  outcomes: string | null;
  organizer: string | null;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  featured_image: string | null;
};

const empty: Partial<EventRow> = {
  title: "", slug: "", category: "", description: "", objectives: "",
  location: "", event_date: "", start_time: "", end_time: "",
  attendees_count: 0, outcomes: "", organizer: "", status: "upcoming", featured_image: "",
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminEventsPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (primaryRole(roles) !== "administrator") { navigate({ to: "/dashboard" }); }
  }, [user, roles, loading, navigate]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<EventRow>>(empty);

  const save = useMutation({
    mutationFn: async (f: Partial<EventRow>) => {
      const payload = {
        title: f.title!, slug: f.slug || slugify(f.title || ""), category: f.category || null,
        description: f.description || null, objectives: f.objectives || null,
        location: f.location || null, event_date: f.event_date!,
        start_time: f.start_time || null, end_time: f.end_time || null,
        attendees_count: Number(f.attendees_count ?? 0),
        outcomes: f.outcomes || null, organizer: f.organizer || null,
        status: f.status || "upcoming", featured_image: f.featured_image || null,
        created_by: user!.id,
      };
      if (f.id) {
        const { error } = await supabase.from("events").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Event saved."); setOpen(false); setForm(empty); qc.invalidateQueries({ queryKey: ["admin-events-full"] }); qc.invalidateQueries({ queryKey: ["events", "public"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Event deleted."); qc.invalidateQueries({ queryKey: ["admin-events-full"] }); qc.invalidateQueries({ queryKey: ["events", "public"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const upcoming = useMemo(() => events.filter((e) => e.status === "upcoming" || e.status === "ongoing"), [events]);
  const past = useMemo(() => events.filter((e) => e.status === "completed" || e.status === "cancelled"), [events]);

  const startNew = (status: "upcoming" | "completed") => { setForm({ ...empty, status }); setOpen(true); };
  const startEdit = (e: EventRow) => { setForm(e); setOpen(true); };

  if (loading || !user) return null;

  return (
    <SiteShell>
      <section className="container-page py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-navy/60 hover:text-clay">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-6">
          <div>
            <span className="eyebrow text-clay">Admin</span>
            <h1 className="font-serif text-4xl text-navy-deep mt-2">Event Management</h1>
            <p className="text-navy/60 text-sm mt-2">Publish upcoming events and document past ones with outcomes.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => startNew("upcoming")} className="bg-navy hover:bg-navy-deep text-cream rounded-none"><Plus size={14} className="mr-1" /> Upcoming event</Button>
            <Button onClick={() => startNew("completed")} variant="outline" className="border-navy/20 rounded-none"><Plus size={14} className="mr-1" /> Past event</Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="mt-8">
          <TabsList className="rounded-none bg-white border border-navy/10">
            <TabsTrigger value="upcoming" className="rounded-none">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past" className="rounded-none">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6">
            <EventList rows={upcoming} loading={isLoading} onEdit={startEdit} onDelete={(id) => del.mutate(id)} emptyText="No upcoming events. Add one to get started." />
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            <EventList rows={past} loading={isLoading} onEdit={startEdit} onDelete={(id) => del.mutate(id)} emptyText="No past events yet." showOutcomes />
          </TabsContent>
        </Tabs>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{form.id ? "Edit event" : "New event"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Title *"><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} /></Field>
              <Field label="Slug"><Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
              <Field label="Category"><Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Workshop, Graduation…" /></Field>
              <Field label="Status">
                <Select value={form.status ?? "upcoming"} onValueChange={(v) => setForm({ ...form, status: v as EventRow["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed (past)</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date *"><Input type="date" value={form.event_date ?? ""} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></Field>
              <Field label="Location"><Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
              <Field label="Start time"><Input type="time" value={form.start_time ?? ""} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></Field>
              <Field label="End time"><Input type="time" value={form.end_time ?? ""} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></Field>
              <Field label="Organizer"><Input value={form.organizer ?? ""} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></Field>
              <Field label="Attendees"><Input type="number" value={form.attendees_count ?? 0} onChange={(e) => setForm({ ...form, attendees_count: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Featured image URL (optional — or upload below)"><Input value={form.featured_image ?? ""} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} placeholder="https://…" /></Field>
            {form.id ? (
              <EventGalleryManager eventId={form.id} onFeatured={(url) => setForm((f) => ({ ...f, featured_image: url }))} />
            ) : (
              <div className="bg-navy/5 border border-navy/10 p-4 text-xs text-navy/60">Save the event first, then you can upload multiple photos (upcoming or past).</div>
            )}
            <Field label="Description"><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Objectives"><Textarea rows={2} value={form.objectives ?? ""} onChange={(e) => setForm({ ...form, objectives: e.target.value })} /></Field>
            <Field label="Outcomes (for past events)"><Textarea rows={3} value={form.outcomes ?? ""} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} placeholder="What happened, results, impact…" /></Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={!form.title || !form.event_date || save.isPending} className="bg-navy hover:bg-navy-deep text-cream rounded-none">
              {save.isPending ? "Saving…" : "Save event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}

function EventGalleryManager({ eventId, onFeatured }: { eventId: string; onFeatured: (url: string) => void }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: images = [] } = useQuery({
    queryKey: ["event-images", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_images").select("id, image_url, caption, is_featured").eq("event_id", eventId).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["event-images", eventId] });
    qc.invalidateQueries({ queryKey: ["event-images-public"] });
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const path = `${eventId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("event-images").upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage.from("event-images").createSignedUrl(path, SIGNED_URL_EXPIRY);
      if (sErr || !signed) throw sErr ?? new Error("Signed URL failed");
      const { error: insErr } = await supabase.from("event_images").insert({ event_id: eventId, image_url: signed.signedUrl, is_featured: images.length === 0 });
      if (insErr) throw insErr;
      if (images.length === 0) onFeatured(signed.signedUrl);
      toast.success("Photo added.");
      invalidate();
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploading(false); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("event_images").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Photo removed."); invalidate();
  };

  const makeFeatured = async (id: string, url: string) => {
    await supabase.from("event_images").update({ is_featured: false }).eq("event_id", eventId);
    const { error } = await supabase.from("event_images").update({ is_featured: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    onFeatured(url);
    toast.success("Featured photo updated."); invalidate();
  };

  return (
    <div className="space-y-2">
      <Label className="text-[11px] uppercase tracking-widest text-navy/60">Event photos ({images.length})</Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((img) => (
          <div key={img.id} className="aspect-square bg-navy/5 relative group border border-navy/10">
            <img src={img.image_url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
            {img.is_featured && <span className="absolute top-1 left-1 bg-clay text-white text-[9px] px-1.5 py-0.5 uppercase tracking-widest">Featured</span>}
            <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
              {!img.is_featured && <button type="button" onClick={() => makeFeatured(img.id, img.image_url)} title="Set as featured" className="bg-white p-1"><Star size={12} /></button>}
              <button type="button" onClick={() => remove(img.id)} title="Remove" className="bg-white p-1 text-red-600"><X size={12} /></button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="aspect-square border border-dashed border-navy/30 text-navy/50 flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-widest hover:bg-navy/5 disabled:opacity-50"
        >
          <Upload size={16} /> {uploading ? "Uploading…" : "Add photo"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          for (const f of files) { await upload(f); }
          e.target.value = "";
        }}
      />
      <p className="text-[10px] text-navy/50">Upload one or many photos. First photo becomes the featured cover; click the star to change it.</p>
    </div>
  );
}


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-widest text-navy/60">{label}</Label>
      {children}
    </div>
  );
}

function EventList({ rows, loading, onEdit, onDelete, emptyText, showOutcomes }: {
  rows: EventRow[]; loading: boolean; onEdit: (e: EventRow) => void; onDelete: (id: string) => void; emptyText: string; showOutcomes?: boolean;
}) {
  if (loading) return <div className="text-navy/50 text-sm">Loading…</div>;
  if (rows.length === 0) return <div className="bg-white border border-navy/10 p-8 text-center text-navy/60 text-sm">{emptyText}</div>;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {rows.map((e) => (
        <article key={e.id} className="bg-white border border-navy/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {e.category && <span className="eyebrow text-clay">{e.category}</span>}
              <h3 className="font-serif text-lg text-navy-deep mt-1">{e.title}</h3>
              <div className="flex flex-wrap gap-3 text-xs text-navy/60 mt-2">
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> {new Date(e.event_date).toLocaleDateString()}</span>
                {e.location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {e.location}</span>}
                <span className="uppercase tracking-widest border border-navy/20 px-2">{e.status}</span>
              </div>
              {e.description && <p className="text-sm text-navy/70 mt-3 line-clamp-2">{e.description}</p>}
              {showOutcomes && e.outcomes && <p className="text-sm text-navy/80 mt-2"><strong className="text-navy">Outcomes:</strong> {e.outcomes}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit(e)}><Pencil size={14} /></Button>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Delete "${e.title}"?`)) onDelete(e.id); }} className="text-red-600 hover:text-red-700"><Trash2 size={14} /></Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
