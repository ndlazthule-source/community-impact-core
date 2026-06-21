import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";


const productsQuery = queryOptions({
  queryKey: ["products", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, description, designer_name, image_url, price, stock, product_categories(name)")
      .is("archived_at", null)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/idw")({
  head: () => ({
    meta: [
      { title: "IDW Marketplace — Designers Warehouse" },
      { name: "description", content: "Ethically sourced artisan goods from rural South African designers. Every purchase supports the maker directly." },
      { property: "og:title", content: "IDW Marketplace — Designers Warehouse" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
  },
  component: IDWPage,
});

function IDWPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { user, roles } = useAuth();
  const { addProduct } = useCart();
  const navigate = useNavigate();

  const handleAdd = (productId: string) => {
    if (!user) { navigate({ to: "/auth" }); return; }
    if (primaryRole(roles) === "administrator") { navigate({ to: "/dashboard" }); return; }
    addProduct.mutate(productId);
  };


  return (
    <SiteShell>
      <section className="container-page py-20 md:py-28 border-b border-navy/10">
        <span className="eyebrow text-clay">IDW Marketplace</span>
        <h1 className="font-serif text-5xl md:text-7xl text-navy-deep mt-4 max-w-3xl leading-[0.95]">
          Designed in Africa. <em className="italic text-clay font-normal">Made</em> by hand.
        </h1>
        <p className="mt-8 text-lg text-navy/75 max-w-2xl leading-relaxed">
          A curated marketplace connecting rural South African artisans, weavers, ceramicists, and
          textile designers with global conscious consumers.
        </p>
      </section>

      <section className="container-page py-20">
        {products.length === 0 ? (
          <div className="bg-white border border-navy/10 p-12 text-center">
            <p className="text-navy/60">Our marketplace is being curated. Sign up to be notified when collections launch.</p>
            <Button asChild className="mt-6 bg-navy text-cream rounded-none">
              <Link to="/auth">Create an Account</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((p) => (
              <article key={p.id} className="group">
                <div className="aspect-[3/4] bg-navy/5 mb-4 overflow-hidden">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  )}
                </div>
                {p.product_categories && (
                  <div className="text-xs text-navy/60 mb-1">{(p.product_categories as { name: string }).name}</div>
                )}
                <h3 className="font-serif text-base text-navy-deep">{p.name}</h3>
                {p.designer_name && <div className="text-xs text-navy/50 italic">by {p.designer_name}</div>}
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-serif text-lg">R{Number(p.price).toFixed(0)}</span>
                  <Button asChild size="sm" variant="ghost" className="text-[11px] uppercase tracking-widest text-navy hover:text-clay">
                    <Link to="/auth">Add to cart</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
