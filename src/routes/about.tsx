import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — IMPACT Group of Companies" },
      { name: "description", content: "Mission, vision, values, leadership, and structure of IMPACT Group — a South African social impact collective." },
      { property: "og:title", content: "About — IMPACT Group of Companies" },
    ],
  }),
  component: AboutPage,
});

const leaders = [
  { name: "Dr. Lerato Khumalo", role: "Founder & Group Chairperson" },
  { name: "Sipho Dlamini", role: "Chief Executive, ICDA" },
  { name: "Nomvula Mokoena", role: "Chief Operations, IDW" },
  { name: "Thandi Mbeki", role: "Director, INQABA" },
];

const values = [
  { title: "Dignity First", body: "Every interaction with beneficiaries, designers, and donors begins from a position of mutual respect." },
  { title: "Measured Impact", body: "We publish what we measure. Progress without evidence is performance." },
  { title: "Rural Centred", body: "Decisions are made closest to the people they affect — not in boardrooms detached from the ground." },
  { title: "Long Horizon", body: "We build institutions, not interventions. The work compounds across generations." },
];

function AboutPage() {
  return (
    <SiteShell>
      <section className="container-page py-20 md:py-28 border-b border-navy/10">
        <span className="eyebrow text-clay">About IMPACT</span>
        <h1 className="font-serif text-5xl md:text-7xl text-navy-deep mt-4 max-w-3xl leading-[0.95]">
          A foundation built on <em className="italic text-clay font-normal">dignity</em>, evidence, and patience.
        </h1>
        <p className="mt-8 text-lg text-navy/75 max-w-2xl leading-relaxed">
          IMPACT Group of Companies is a South African social impact collective spanning three
          divisions: capacity development, ethical commerce, and child welfare. Together they form
          one durable institution dedicated to the socio-economic advancement of South Africa's
          most vital resource — its people.
        </p>
      </section>

      <section className="container-page py-20 grid md:grid-cols-2 gap-16">
        <div>
          <span className="eyebrow text-clay">Mission</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-4 mb-4 text-navy-deep">What we are here to do.</h2>
          <p className="text-navy/75 leading-relaxed">
            To empower youth, women, rural communities, entrepreneurs, learners, and donors through
            skills development, education, economic empowerment, community development, and direct
            social impact initiatives.
          </p>
        </div>
        <div>
          <span className="eyebrow text-clay">Vision</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-4 mb-4 text-navy-deep">The South Africa we are building.</h2>
          <p className="text-navy/75 leading-relaxed">
            A South Africa where geography is not destiny — where a child in a rural village has
            the same access to skills, markets, and mentorship as a child in a metropolitan suburb.
          </p>
        </div>
      </section>

      <section className="bg-navy-deep text-cream py-20">
        <div className="container-page">
          <span className="eyebrow text-gold">Our Values</span>
          <h2 className="font-serif text-3xl md:text-5xl mt-4 mb-12 max-w-3xl">The principles that govern every decision.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {values.map((v, i) => (
              <div key={v.title}>
                <div className="font-serif text-3xl text-gold/40 mb-4">0{i + 1}</div>
                <h3 className="font-serif text-xl mb-3 text-cream">{v.title}</h3>
                <p className="text-sm text-cream/70 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <span className="eyebrow text-clay">Leadership</span>
        <h2 className="font-serif text-3xl md:text-5xl mt-4 mb-12 text-navy-deep">Stewards of the work.</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {leaders.map((l) => (
            <div key={l.name} className="bg-white border border-navy/10 p-6 shadow-soft">
              <div className="aspect-square bg-navy/5 mb-4" />
              <h3 className="font-serif text-lg text-navy-deep">{l.name}</h3>
              <p className="text-xs uppercase tracking-widest text-navy/50 mt-1">{l.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20 border-t border-navy/10">
        <span className="eyebrow text-clay">Quality Policy</span>
        <h2 className="font-serif text-3xl md:text-4xl mt-4 mb-6 text-navy-deep max-w-3xl">
          We hold ourselves to the standards we would demand of our partners.
        </h2>
        <p className="text-navy/75 leading-relaxed max-w-3xl">
          IMPACT Group operates under documented governance procedures, publishes annual impact
          reports audited by independent third parties, and maintains B-BBEE Level 2 contributor
          status. All ICDA training programmes are SETA-accredited where applicable.
        </p>
      </section>
    </SiteShell>
  );
}
