import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, MapPin, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { supabase } from "@/integrations/supabase/client";

const eventsQuery = queryOptions({
  queryKey: ["events", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .is("archived_at", null)
      .order("event_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

const eventImagesQuery = queryOptions({
  queryKey: ["event-images-public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("event_images")
      .select("id, event_id, image_url, caption, is_featured")
      .order("is_featured", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — IMPACT Group" },
      { name: "description", content: "Workshops, graduations, community outreach, and donation drives by IMPACT Group of Companies." },
      { property: "og:title", content: "Events — IMPACT Group" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(eventsQuery);
    context.queryClient.ensureQueryData(eventImagesQuery);
  },
  component: EventsPage,
});

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  event_date: string;
  attendees_count: number | null;
  featured_image: string | null;
  status: string;
};

function EventsPage() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const { data: images = [] } = useQuery(eventImagesQuery);
  const upcoming = events.filter((e) => e.status === "upcoming" || e.status === "ongoing");
  const past = events.filter((e) => e.status === "completed");

  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  const imagesFor = (eventId: string) => images.filter((i) => i.event_id === eventId).map((i) => i.image_url);

  return (
    <SiteShell>
      <section className="container-page py-20 md:py-28 border-b border-navy/10">
        <span className="eyebrow text-clay">Event History</span>
        <h1 className="font-serif text-5xl md:text-7xl text-navy-deep mt-4 max-w-3xl leading-[0.95]">
          Workshops, graduations, <em className="italic text-clay font-normal">moments</em> that built us.
        </h1>
      </section>

      {upcoming.length > 0 && (
        <section className="container-page py-16">
          <h2 className="font-serif text-3xl text-navy-deep mb-8">Upcoming</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {upcoming.map((e) => <EventCard key={e.id} e={e as EventRow} gallery={imagesFor(e.id)} onOpen={(idx) => setLightbox({ urls: buildGallery(e as EventRow, imagesFor(e.id)), index: idx })} />)}
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <h2 className="font-serif text-3xl text-navy-deep mb-8">Past events</h2>
        {past.length === 0 && events.length === 0 ? (
          <div className="bg-white border border-navy/10 p-12 text-center text-navy/60">
            Event history will appear here as it's published.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(past.length > 0 ? past : events).map((e) => <EventCard key={e.id} e={e as EventRow} gallery={imagesFor(e.id)} onOpen={(idx) => setLightbox({ urls: buildGallery(e as EventRow, imagesFor(e.id)), index: idx })} />)}
          </div>
        )}
      </section>

      {lightbox && <Lightbox urls={lightbox.urls} index={lightbox.index} onClose={() => setLightbox(null)} onChange={(i) => setLightbox({ ...lightbox, index: i })} />}
    </SiteShell>
  );
}

function buildGallery(e: EventRow, imgs: string[]): string[] {
  const set = new Set<string>();
  if (e.featured_image) set.add(e.featured_image);
  imgs.forEach((u) => set.add(u));
  return Array.from(set);
}

function EventCard({ e, gallery, onOpen }: { e: EventRow; gallery: string[]; onOpen: (idx: number) => void }) {
  const all = buildGallery(e, gallery);
  const cover = all[0];
  const extras = all.slice(1, 5);
  return (
    <article className="bg-white border border-navy/10 shadow-soft">
      <button type="button" onClick={() => cover && onOpen(0)} className="block w-full aspect-[16/9] bg-navy/5 relative group" disabled={!cover}>
        {cover && <img src={cover} alt={e.title} className="w-full h-full object-cover group-hover:opacity-95 transition" loading="lazy" />}
        {all.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-navy/80 text-white text-[10px] px-2 py-1 uppercase tracking-widest">
            {all.length} photos
          </span>
        )}
      </button>
      {extras.length > 0 && (
        <div className="grid grid-cols-4 gap-1 p-1 bg-navy/5">
          {extras.map((u, i) => (
            <button key={u} type="button" onClick={() => onOpen(i + 1)} className="aspect-square overflow-hidden bg-white">
              <img src={u} alt="" className="w-full h-full object-cover hover:scale-105 transition" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="p-6">
        {e.category && <span className="eyebrow text-clay">{e.category}</span>}
        <h3 className="font-serif text-xl text-navy-deep mt-2 mb-3">{e.title}</h3>
        <p className="text-sm text-navy/70 line-clamp-2 mb-4">{e.description}</p>
        <div className="flex flex-wrap gap-4 text-xs text-navy/60">
          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(e.event_date).toLocaleDateString()}</span>
          {e.location && <span className="flex items-center gap-1"><MapPin size={12} /> {e.location}</span>}
          {e.attendees_count != null && <span className="flex items-center gap-1"><Users size={12} /> {e.attendees_count}</span>}
        </div>
      </div>
    </article>
  );
}

function Lightbox({ urls, index, onClose, onChange }: { urls: string[]; index: number; onClose: () => void; onChange: (i: number) => void }) {
  const prev = () => onChange((index - 1 + urls.length) % urls.length);
  const next = () => onChange((index + 1) % urls.length);
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 grid place-items-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10"><X /></button>
      {urls.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10"><ChevronLeft /></button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10"><ChevronRight /></button>
        </>
      )}
      <img src={urls[index]} alt="" className="max-h-[85vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
      {urls.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs">{index + 1} / {urls.length}</div>}
    </div>
  );
}
