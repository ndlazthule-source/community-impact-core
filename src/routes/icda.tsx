import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Calendar, Users, MapPin } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";


const coursesQuery = queryOptions({
  queryKey: ["courses", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, slug, description, instructor, start_date, end_date, max_capacity, enrolled_count, price, status, cover_image, course_categories(name)")
      .is("archived_at", null)
      .neq("status", "draft")
      .order("start_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/icda")({
  head: () => ({
    meta: [
      { title: "ICDA Academy — Capacity Development & Skills" },
      { name: "description", content: "Accredited vocational training, digital literacy, and entrepreneurship courses from IMPACT Capacity Development Agency." },
      { property: "og:title", content: "ICDA Academy — Capacity Development" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(coursesQuery);
  },
  component: ICDAPage,
});

function ICDAPage() {
  const { data: courses } = useSuspenseQuery(coursesQuery);
  const { user, roles } = useAuth();
  const { addCourse } = useCart();
  const navigate = useNavigate();

  const handleEnrol = async (courseId: string) => {
    if (!user) { navigate({ to: "/auth" }); return; }
    const role = primaryRole(roles);
    if (role === "administrator") { navigate({ to: "/dashboard" }); return; }
    // Already authed — go straight to cart with the course added
    await addCourse.mutateAsync(courseId);
    navigate({ to: "/cart" });
  };

  return (

    <SiteShell>
      <section className="container-page py-20 md:py-28 border-b border-navy/10">
        <span className="eyebrow text-clay">ICDA Academy</span>
        <h1 className="font-serif text-5xl md:text-7xl text-navy-deep mt-4 max-w-3xl leading-[0.95]">
          Accredited skills for <em className="italic text-clay font-normal">future-ready</em> South Africans.
        </h1>
        <p className="mt-8 text-lg text-navy/75 max-w-2xl leading-relaxed">
          The IMPACT Capacity Development Agency delivers vocational training, digital literacy,
          and entrepreneurial pathways for youth, women, and rural learners.
        </p>
      </section>

      <section className="container-page py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="eyebrow text-clay">Course Catalogue</span>
            <h2 className="font-serif text-3xl md:text-4xl mt-3 text-navy-deep">Open enrolments.</h2>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border border-navy/10 p-12 text-center">
            <p className="text-navy/60">Courses are being prepared. Please check back soon, or sign up to be notified.</p>
            <Button asChild className="mt-6 bg-navy text-cream rounded-none">
              <Link to="/auth">Create an Account</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((c) => {
              const seatsLeft = c.max_capacity - (c.enrolled_count ?? 0);
              const isFull = c.status === "full" || seatsLeft <= 0;
              return (
                <article key={c.id} className="bg-white border border-navy/10 shadow-soft flex flex-col">
                  <div className="aspect-[16/10] bg-navy/5">
                    {c.cover_image && (
                      <img src={c.cover_image} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    {c.course_categories && (
                      <span className="eyebrow text-clay mb-2">{(c.course_categories as { name: string }).name}</span>
                    )}
                    <h3 className="font-serif text-xl text-navy-deep mb-3">{c.title}</h3>
                    <p className="text-sm text-navy/70 mb-4 line-clamp-3 flex-1">{c.description}</p>
                    <div className="space-y-2 text-xs text-navy/60 mb-5">
                      {c.start_date && (
                        <div className="flex items-center gap-2"><Calendar size={14} /> Starts {new Date(c.start_date).toLocaleDateString()}</div>
                      )}
                      {c.instructor && (
                        <div className="flex items-center gap-2"><Users size={14} /> {c.instructor}</div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={isFull ? "text-destructive font-semibold" : "text-navy/70"}>
                          {isFull ? "Course Full" : `${seatsLeft} of ${c.max_capacity} seats available`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-navy/10">
                      <span className="font-serif text-2xl text-navy-deep">
                        {Number(c.price) === 0 ? "Free" : `R${Number(c.price).toFixed(0)}`}
                      </span>
                      <Button size="sm" disabled={isFull} onClick={() => handleEnrol(c.id)} className="bg-navy text-cream rounded-none text-[11px] uppercase tracking-widest">
                        {isFull ? "Full" : "Enrol"}
                      </Button>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-navy-deep text-cream py-20">
        <div className="container-page grid md:grid-cols-3 gap-12">
          {[
            { icon: Calendar, title: "Rolling Intakes", body: "New cohorts open quarterly across all programmes." },
            { icon: Users, title: "Small Cohorts", body: "Maximum 30 learners per programme for personalised attention." },
            { icon: MapPin, title: "Hybrid Delivery", body: "Online plus in-person sessions at regional rural hubs." },
          ].map((f) => (
            <div key={f.title}>
              <f.icon className="text-gold mb-4" size={28} />
              <h3 className="font-serif text-2xl mb-2 text-cream">{f.title}</h3>
              <p className="text-sm text-cream/70 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
