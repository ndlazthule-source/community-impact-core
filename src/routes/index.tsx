import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, ShoppingBag, HeartHandshake } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-community.jpg";
import icdaImg from "@/assets/division-icda.jpg";
import idwImg from "@/assets/division-idw.jpg";
import inqabaImg from "@/assets/division-inqaba.jpg";

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
    img: icdaImg,
    icon: GraduationCap,
    title: "ICDA Capacity Development",
    body: "Equipping youth and entrepreneurs with future-ready skills in digital literacy, leadership, and accredited vocational training.",
    label: "ICDA Academy",
  },
  {
    href: "/idw" as const,
    img: idwImg,
    icon: ShoppingBag,
    title: "Designers Warehouse",
    body: "A commercial marketplace empowering rural artisans to reach global audiences through ethical, designed-in-Africa commerce.",
    label: "IDW Marketplace",
  },
  {
    href: "/inqaba" as const,
    img: inqabaImg,
    icon: HeartHandshake,
    title: "INQABA Adopt-A-Child",
    body: "Transforming the lives of vulnerable learners through holistic support, nutrition, mentorship, and community guardianship.",
    label: "INQABA Programme",
  },
];

const testimonials = [
  {
    quote: "ICDA didn't just train me — they handed me the tools and the network to start my own business within a year.",
    name: "Thandi M.",
    role: "ICDA Graduate, 2024",
  },
  {
    quote: "Through INQABA, three children in our village are now in high school. The ripple effect on the community is real.",
    name: "Sipho N.",
    role: "Community Elder, Limpopo",
  },
  {
    quote: "Selling through IDW connected our weaving cooperative to buyers in Cape Town and London. Our income tripled.",
    name: "Nomvula D.",
    role: "Artisan, Eastern Cape",
  },
];

function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative px-6 md:px-8 pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-8">
            <span className="eyebrow text-clay">Impact Group of Companies</span>
            <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] text-navy-deep">
              Empowering <em className="italic text-clay font-normal">Generations</em> through Action.
            </h1>
            <p className="text-lg text-navy/80 max-w-md leading-relaxed">
              A South African social impact collective dedicated to unlocking human potential in
              rural communities through education, design, and child welfare.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-gold hover:bg-gold-soft text-navy-deep rounded-none px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em] shadow-card">
                <Link to="/icda">Explore Our Work</Link>
              </Button>
              <Button asChild variant="outline" className="border-navy/20 text-navy hover:bg-navy hover:text-cream rounded-none px-8 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
                <Link to="/about">Our Impact</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="South African community gathered at a vibrant outdoor center"
              width={1024}
              height={1280}
              className="w-full aspect-[4/5] object-cover rounded-sm shadow-elevated translate-x-3 translate-y-3 relative z-10"
            />
            <div className="absolute inset-0 bg-gold/30" aria-hidden />
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section className="px-6 md:px-8 py-24 bg-white border-y border-navy/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <span className="eyebrow text-clay">Our Divisions</span>
              <h2 className="text-4xl md:text-5xl font-serif text-navy-deep">Three Pillars of Change.</h2>
            </div>
            <p className="md:max-w-sm text-navy/60 leading-relaxed">
              From capacity development to economic marketplaces, we address the systemic
              challenges facing youth, women, and rural communities today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {divisions.map((d) => (
              <Link key={d.label} to={d.href} className="group block">
                <div className="aspect-[3/2] overflow-hidden mb-6 bg-navy/5">
                  <img
                    src={d.img}
                    alt={d.title}
                    width={1024}
                    height={768}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <span className="eyebrow text-clay">{d.label}</span>
                <h3 className="text-2xl font-serif mt-3 mb-3 group-hover:text-clay transition-colors">{d.title}</h3>
                <p className="text-sm text-navy/70 leading-relaxed mb-5 italic">{d.body}</p>
                <div className="h-px w-full bg-navy/10 group-hover:bg-clay transition-colors" />
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy group-hover:text-clay">
                  Learn more <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="bg-navy-deep text-cream py-20 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-5xl md:text-6xl font-serif text-gold mb-2">{s.value}</div>
              <div className="eyebrow text-cream/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 md:px-8 py-24 bg-cream">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="eyebrow text-clay">Our Mission</span>
          <h2 className="font-serif text-3xl md:text-5xl text-navy-deep leading-tight">
            We exist to bridge the gap between rural potential and economic reality.
          </h2>
          <p className="text-lg text-navy/70 leading-relaxed">
            IMPACT Group operates at the intersection of skills development, ethical commerce, and
            child welfare — building durable institutions that compound across generations.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-navy/5 px-6 md:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 space-y-4">
            <span className="eyebrow text-clay">Voices from the Ground</span>
            <h2 className="text-4xl md:text-5xl font-serif text-navy-deep">Real stories, real change.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {testimonials.map((t) => (
              <figure key={t.name} className="space-y-6">
                <div className="text-gold font-serif text-5xl leading-none">"</div>
                <blockquote className="font-serif text-xl italic text-navy-deep leading-snug">
                  {t.quote}
                </blockquote>
                <figcaption className="pt-4 border-t border-navy/10">
                  <div className="text-sm font-semibold text-navy">{t.name}</div>
                  <div className="text-xs text-navy/60 uppercase tracking-widest mt-1">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="px-6 md:px-8 py-16 bg-cream">
        <div className="max-w-7xl mx-auto text-center">
          <p className="eyebrow text-navy/40 mb-10">Strategic Institutional Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
            {["Standard Bank", "SAB Foundation", "NYDA", "Rebosis", "DTIC"].map((p) => (
              <span key={p} className="font-serif font-bold text-xl tracking-tight text-navy-deep">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-8 py-24 bg-navy-deep text-cream">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif italic text-gold">Join the movement.</h2>
          <p className="text-cream/70 text-lg max-w-2xl mx-auto">
            Whether you are a donor, a learner, or a partner, your contribution shapes the future
            of South Africa. Let's build something meaningful together.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
            <Button asChild className="bg-gold hover:bg-gold-soft text-navy-deep rounded-none px-10 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              <Link to="/inqaba">Become a Sponsor</Link>
            </Button>
            <Button asChild variant="outline" className="border-cream/30 text-cream hover:bg-cream hover:text-navy-deep rounded-none px-10 py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              <Link to="/auth">Create an Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
