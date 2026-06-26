import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

const productsQuery = queryOptions({
  queryKey: ["products", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, description, designer_name, image_url, side_image_url, texture_image_url, price, stock, product_categories(name)")
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

  const maxPrice = useMemo(() => Math.max(1000, ...products.map((p) => Number(p.price) || 0)), [products]);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<[number, number]>([0, maxPrice]);
  const [hideOOS, setHideOOS] = useState(false);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products.filter((p) => {
      const price = Number(p.price);
      if (price < range[0] || price > range[1]) return false;
      if (hideOOS && (p.stock ?? 0) <= 0) return false;
      if (s && !`${p.name} ${p.designer_name ?? ""} ${(p.product_categories as { name?: string } | null)?.name ?? ""}`.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [products, search, range, hideOOS]);

  const handleAdd = (productId: string, stock: number) => {
    if (stock <= 0) return;
    if (!user) { navigate({ to: "/idw/auth" }); return; }
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

      <section className="container-page py-12">
        <div className="bg-white border border-navy/10 p-5 grid md:grid-cols-3 gap-5 items-end">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-navy/50">Search</label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, designer, category…" className="rounded-none mt-1" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-navy/50">Price range</label>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-navy/60 w-14">R{range[0]}</span>
              <Slider
                min={0}
                max={maxPrice}
                step={10}
                value={range}
                onValueChange={(v) => setRange([v[0], v[1]] as [number, number])}
                className="flex-1"
              />
              <span className="text-xs text-navy/60 w-16 text-right">R{range[1]}</span>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy/70 cursor-pointer">
            <input type="checkbox" checked={hideOOS} onChange={(e) => setHideOOS(e.target.checked)} />
            Hide out-of-stock
          </label>
        </div>
      </section>

      <section className="container-page pb-20">
        {filtered.length === 0 ? (
          <div className="bg-white border border-navy/10 p-12 text-center rounded-xl">
            <p className="text-mute">{products.length === 0 ? "Our marketplace is being curated." : "No items match your filters."}</p>
            {products.length === 0 && (
              <Button asChild className="mt-6 bg-blue hover:bg-navy text-white rounded-full">
                <Link to="/idw/auth">Create a buyer account</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filtered.map((p) => {
              const stock = p.stock ?? 0;
              const oos = stock <= 0;
              return (
                <article key={p.id} className="group">
                  <div className="aspect-[3/4] bg-navy/5 mb-3 overflow-hidden relative">
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    )}
                    {oos && (
                      <div className="absolute inset-0 bg-white/70 grid place-items-center">
                        <span className="text-[11px] uppercase tracking-[0.2em] text-red-700 bg-white px-3 py-1 border border-red-200">Out of stock</span>
                      </div>
                    )}
                  </div>
                  {(p.side_image_url || p.texture_image_url) && (
                    <div className="flex gap-1 mb-2">
                      {p.side_image_url && <div className="w-10 h-10 bg-navy/5 overflow-hidden"><img src={p.side_image_url} alt="side view" className="w-full h-full object-cover" loading="lazy" /></div>}
                      {p.texture_image_url && <div className="w-10 h-10 bg-navy/5 overflow-hidden"><img src={p.texture_image_url} alt="texture detail" className="w-full h-full object-cover" loading="lazy" /></div>}
                    </div>
                  )}
                  {p.product_categories && (
                    <div className="text-xs text-navy/60 mb-1">{(p.product_categories as { name: string }).name}</div>
                  )}
                  <h3 className="font-serif text-base text-navy-deep">{p.name}</h3>
                  {p.designer_name && <div className="text-xs text-navy/50 italic">by {p.designer_name}</div>}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-serif text-lg leading-tight">R{Number(p.price).toFixed(0)}</div>
                      {!oos && (
                        <div className={`text-[10px] uppercase tracking-widest ${stock <= 5 ? "text-amber-700" : "text-navy/50"}`}>
                          {stock <= 5 ? `Only ${stock} left` : `${stock} in stock`}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={oos}
                      onClick={() => handleAdd(p.id, stock)}
                      className="text-[11px] uppercase tracking-widest text-navy hover:text-clay disabled:opacity-40"
                    >
                      {oos ? "Sold out" : "Add to cart"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
