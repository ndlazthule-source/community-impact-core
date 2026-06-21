import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Calendar, MapPin, Users } from "lucide-react";
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
  },
  component: EventsPage,
});

function EventsPage() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const upcoming = events.filter((e) => e.status === "upcoming" || e.status === "ongoing");
  const past = events.filter((e) => e.status === "completed");

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
            {upcoming.map((e) => <EventCard key={e.id} e={e} />)}
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
            {(past.length > 0 ? past : events).map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function EventCard({ e }: { e: { id: string; title: string; description: string | null; category: string | null; location: string | null; event_date: string; attendees_count: number | null; featured_image: string | null } }) {
  return (
    <article className="bg-white border border-navy/10 shadow-soft">
      <div className="aspect-[16/9] bg-navy/5">
        {e.featured_image && <img src={e.featured_image} alt={e.title} className="w-full h-full object-cover" loading="lazy" />}
      </div>
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
