import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, ShoppingBag, HeartHandshake } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

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
      {/* HERO BANNER — full-bleed image + navy overlay */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <img
          src={heroBanner}
          alt="IMPACT community workshop at dusk"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-deep/80" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(10,19,45,0.92) 0%, rgba(15,27,61,0.7) 60%, rgba(59,111,160,0.55) 100%)" }}
        />

        <div className="container-page relative py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="tag-pill bg-blue-pill text-navy">
              <span className="w-1.5 h-1.5 rounded-full bg-blue" />
              Empowering South Africa Since 2014
            </span>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-white mt-8">
              Empowering <span className="text-blue-soft">generations</span>
              <br />through <span className="text-blue-soft">action</span>.
            </h1>

            <p className="mt-8 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              A South African social impact collective dedicated to unlocking human potential in
              rural communities through education, ethical commerce, and child welfare.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild className="bg-blue hover:bg-blue-soft text-white rounded-full px-8 py-7 text-sm font-semibold tracking-wide group">
                <Link to="/icda">
                  Explore Our Work
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/40 bg-white/5 text-white hover:bg-white hover:text-navy-deep rounded-full px-8 py-7 text-sm font-semibold tracking-wide backdrop-blur">
                <Link to="/donate">Donate Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — clean white band */}
      <section className="bg-white border-b border-navy/10">
        <div className="container-page py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl md:text-5xl text-navy-deep">{s.value}</div>
              <div className="eyebrow text-blue mt-3">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Divisions */}
      <section className="bg-cream">
        <div className="container-page py-24">
          <div className="grid md:grid-cols-3 gap-10 mb-16 items-end">
            <div className="md:col-span-2 space-y-4">
              <span className="tag-pill">Our Divisions</span>
              <h2 className="text-4xl md:text-6xl font-serif text-navy-deep leading-tight">Three pillars,<br />one mission.</h2>
            </div>
            <p className="text-mute leading-relaxed">
              From capacity development to economic marketplaces, each division addresses systemic
              challenges facing youth, women, and rural communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {divisions.map((d, i) => {
              const Icon = d.icon;
              return (
                <Link
                  key={d.label}
                  to={d.href}
                  className="group block bg-white hover:shadow-card transition-all duration-300 p-10 rounded-2xl border border-navy/10"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 grid place-items-center rounded-full bg-blue-pill group-hover:bg-blue transition-colors">
                      <Icon size={20} className="text-navy group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-serif text-4xl text-navy/15">0{i + 1}</span>
                  </div>
                  <span className="eyebrow text-blue">{d.label}</span>
                  <h3 className="text-2xl font-serif mt-3 mb-4 text-navy-deep">{d.title}</h3>
                  <p className="text-sm text-mute leading-relaxed mb-6">{d.body}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue group-hover:text-navy">
                    Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-white border-t border-navy/10">
        <div className="container-page py-20 text-center">
          <p className="eyebrow text-mute mb-12">Strategic Institutional Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-8">
            {["Standard Bank", "SAB Foundation", "NYDA", "Rebosis", "DTIC"].map((p) => (
              <span key={p} className="font-serif font-bold text-xl md:text-2xl tracking-tight text-navy-deep/70 hover:text-navy-deep transition-colors">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream border-t border-navy/10">
        <div className="container-page py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="tag-pill">Join the movement</span>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-deep mt-4 leading-tight">
              Your contribution shapes <span className="text-blue">South Africa's</span> future.
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-mute text-lg leading-relaxed">
              Make a one-time or recurring donation in under a minute — no account required.
              Every rand goes to learners, artisans, and the children of INQABA.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-blue hover:bg-navy text-white rounded-full px-8 py-6 text-sm font-semibold">
                <Link to="/donate">Donate <ArrowRight size={16} className="ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-navy/30 text-navy rounded-full px-8 py-6 text-sm font-semibold">
                <Link to="/contact">Partner with us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
