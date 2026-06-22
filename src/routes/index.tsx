import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, ShoppingBag, HeartHandshake, Quote } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IMPACT Group — Empowering Generations Through Action" },
      { name: "description", content: "South African social impact collective unlocking human potential through education (ICDA), artisan commerce (IDW), and child welfare (INQABA)." },
    ],
  }),
  component: HomePage,
});

const stats = [
  { value: "12k+", label: "Youth Trained" },
  { value: "450", label: "Entrepreneurs Launched" },
  { value: "85%", label: "Employment Rate" },
  { value: "R15M", label: "Direct Investment" },
];

const divisions = [
  {
    href: "/icda" as const,
    icon: GraduationCap,
    title: "ICDA Capacity Development",
    body: "Equipping youth and entrepreneurs with future-ready skills in digital literacy, leadership, and accredited vocational training.",
    label: "ICDA Academy",
  },
  {
    href: "/idw" as const,
    icon: ShoppingBag,
    title: "Designers Warehouse",
    body: "A commercial marketplace empowering rural artisans to reach global audiences through ethical, designed-in-Africa commerce.",
    label: "IDW Marketplace",
  },
  {
    href: "/inqaba" as const,
    icon: HeartHandshake,
    title: "INQABA Adopt-A-Child",
    body: "Transforming the lives of vulnerable learners through holistic support, nutrition, mentorship, and community guardianship.",
    label: "INQABA Programme",
  },
];

function HomePage() {
  return (
    <SiteShell>
      {/* Hero — editorial typographic, no photography */}
      <section className="relative overflow-hidden bg-cream">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-clay/10 blur-3xl" />
        </div>
        <div className="container-page relative py-20 md:py-32">
          <div className="max-w-4xl">
            <span className="eyebrow text-clay">Impact Group of Companies</span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-navy-deep mt-6">
              Empowering <em className="italic text-clay font-normal">Generations</em>
              <br />through Action.
            </h1>
            <p className="mt-10 text-lg md:text-xl text-navy/75 max-w-2xl leading-relaxed">
              A South African social impact collective dedicated to unlocking human potential in
              rural communities through education, ethical commerce, and child welfare.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Button asChild className="bg-navy hover:bg-navy-deep text-cream rounded-none px-10 py-7 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Link to="/icda">Explore Our Work</Link>
              </Button>
              <Button asChild variant="outline" className="border-navy/30 text-navy hover:bg-gold hover:text-navy-deep hover:border-gold rounded-none px-10 py-7 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Link to="/donate">Donate Now</Link>
              </Button>
            </div>
          </div>

          {/* Floating stat strip */}
          <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 border-t border-navy/15">
            {stats.map((s) => (
              <div key={s.label} className="py-8 md:py-10 border-b md:border-b-0 md:border-r last:border-r-0 border-navy/15 pr-6">
                <div className="font-serif text-4xl md:text-5xl text-navy-deep">{s.value}</div>
                <div className="eyebrow text-clay mt-3">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions — icon cards, no photos */}
      <section className="bg-white border-y border-navy/10">
        <div className="container-page py-24">
          <div className="grid md:grid-cols-3 gap-10 mb-16 items-end">
            <div className="md:col-span-2 space-y-4">
              <span className="eyebrow text-clay">Our Divisions</span>
              <h2 className="text-4xl md:text-6xl font-serif text-navy-deep leading-tight">Three pillars,<br />one mission.</h2>
            </div>
            <p className="text-navy/65 leading-relaxed">
              From capacity development to economic marketplaces, each division addresses systemic
              challenges facing youth, women, and rural communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-navy/10 border border-navy/10">
            {divisions.map((d, i) => {
              const Icon = d.icon;
              return (
                <Link
                  key={d.label}
                  to={d.href}
                  className="group block bg-cream hover:bg-navy-deep transition-colors duration-500 p-10 md:p-12"
                >
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-14 h-14 grid place-items-center border border-navy/30 group-hover:border-gold group-hover:bg-gold transition-colors">
                      <Icon size={22} className="text-navy-deep group-hover:text-navy-deep" />
                    </div>
                    <span className="font-serif text-5xl text-navy/15 group-hover:text-gold/40 transition-colors">0{i + 1}</span>
                  </div>
                  <span className="eyebrow text-clay group-hover:text-gold transition-colors">{d.label}</span>
                  <h3 className="text-2xl md:text-3xl font-serif mt-3 mb-5 text-navy-deep group-hover:text-cream transition-colors">{d.title}</h3>
                  <p className="text-sm text-navy/70 group-hover:text-cream/70 leading-relaxed mb-8 transition-colors">{d.body}</p>
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-navy group-hover:text-gold transition-colors">
                    Learn more <ArrowRight size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission — quote-led */}
      <section className="bg-navy-deep text-cream">
        <div className="container-page py-28 md:py-36 max-w-5xl">
          <Quote size={56} className="text-gold mb-10" />
          <blockquote className="font-serif text-3xl md:text-5xl leading-tight">
            We exist to bridge the gap between <em className="italic text-gold font-normal">rural potential</em> and economic reality — building durable institutions that compound across generations.
          </blockquote>
          <div className="mt-14 pt-8 border-t border-cream/15 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="eyebrow text-gold/70">Our Mission</div>
              <div className="font-serif text-xl mt-2">IMPACT Group of Companies</div>
            </div>
            <Button asChild variant="outline" className="border-cream/30 text-cream hover:bg-gold hover:text-navy-deep hover:border-gold rounded-none px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em] w-fit">
              <Link to="/about">Read our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-cream">
        <div className="container-page py-20 text-center">
          <p className="eyebrow text-navy/40 mb-12">Strategic Institutional Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-8">
            {["Standard Bank", "SAB Foundation", "NYDA", "Rebosis", "DTIC"].map((p) => (
              <span key={p} className="font-serif font-bold text-xl md:text-2xl tracking-tight text-navy-deep/70 hover:text-navy-deep transition-colors">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — donate-first, no account required */}
      <section className="bg-white border-t border-navy/10">
        <div className="container-page py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow text-clay">Join the movement</span>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-deep mt-4 leading-tight">
              Your contribution shapes <em className="italic text-clay font-normal">South Africa's</em> future.
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-navy/70 text-lg leading-relaxed">
              Make a one-time or recurring donation in under a minute — no account required.
              Every rand is directed to learners, artisans, and the children of INQABA.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-gold hover:bg-gold-soft text-navy-deep rounded-none px-10 py-7 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Link to="/donate">Donate</Link>
              </Button>
              <Button asChild variant="outline" className="border-navy/30 text-navy rounded-none px-10 py-7 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Link to="/contact">Partner with us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
