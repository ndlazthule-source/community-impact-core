import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import inqabaImg from "@/assets/division-inqaba.jpg";

const sponsorshipsQuery = queryOptions({
  queryKey: ["sponsorships", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("sponsorships")
      .select("*")
      .is("archived_at", null)
      .eq("is_sponsored", false)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/inqaba")({
  head: () => ({
    meta: [
      { title: "INQABA Adopt-A-Child — Sponsor a Future" },
      { name: "description", content: "INQABA connects sponsors directly with vulnerable South African learners. Holistic support: nutrition, school fees, mentorship." },
      { property: "og:title", content: "INQABA Adopt-A-Child Programme" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(sponsorshipsQuery);
  },
  component: InqabaPage,
});

function InqabaPage() {
  const { data: kids } = useSuspenseQuery(sponsorshipsQuery);

  return (
    <SiteShell>
      <section className="relative">
        <div className="container-page py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow text-clay">INQABA Programme</span>
            <h1 className="font-serif text-5xl md:text-7xl text-navy-deep mt-4 leading-[0.95]">
              Become a <em className="italic text-clay font-normal">pillar</em> for a child's future.
            </h1>
            <p className="mt-8 text-lg text-navy/75 leading-relaxed">
              INQABA — the isiZulu word for "fortress" — connects sponsors directly with learners
              in need, providing nutritional support, school fees, stationery, and lifelong
              mentorship.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild className="bg-gold hover:bg-gold-soft text-navy-deep rounded-none px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Link to="/auth">Sponsor a Child</Link>
              </Button>
            </div>
          </div>
          <img src={inqabaImg} alt="Smiling South African school children" className="aspect-[4/5] object-cover w-full shadow-elevated" />
        </div>
      </section>

      <section className="bg-navy-deep text-cream py-20">
        <div className="container-page grid md:grid-cols-3 gap-12 text-center md:text-left">
          {[
            { v: "R500", l: "Monthly Sponsorship" },
            { v: "1,240", l: "Children Currently Supported" },
            { v: "97%", l: "School Attendance Rate" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-serif text-5xl md:text-6xl text-gold mb-2">{s.v}</div>
              <div className="eyebrow text-cream/50">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <span className="eyebrow text-clay">Children Awaiting Sponsorship</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-12 text-navy-deep">Each story is a partnership in waiting.</h2>

        {kids.length === 0 ? (
          <div className="bg-white border border-navy/10 p-12 text-center">
            <p className="text-navy/60">Profiles will appear here once published by INQABA programme coordinators.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kids.map((k) => (
              <article key={k.id} className="bg-white border border-navy/10 shadow-soft flex flex-col">
                <div className="aspect-square bg-navy/5">
                  {k.image_url && <img src={k.image_url} alt={k.child_name} className="w-full h-full object-cover" loading="lazy" />}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif text-lg text-navy-deep">{k.child_name}</h3>
                  <div className="text-xs text-navy/60">{k.child_age ? `Age ${k.child_age}` : ""}{k.location ? ` · ${k.location}` : ""}</div>
                  <p className="text-sm text-navy/70 mt-3 line-clamp-3 flex-1">{k.story}</p>
                  <div className="mt-4 pt-4 border-t border-navy/10 flex items-center justify-between">
                    <span className="font-serif text-lg">R{Number(k.monthly_amount).toFixed(0)}/mo</span>
                    <Button asChild size="sm" className="bg-clay hover:bg-clay/90 text-cream rounded-none text-[11px] uppercase tracking-widest">
                      <Link to="/auth">Sponsor</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
