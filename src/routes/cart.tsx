import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — IMPACT Group" }] }),
  component: CartPage,
});

function CartPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const { items, total, updateQty, remove, addProduct, clear } = useCart();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Preserve pending add intent across the sign-in detour.
      navigate({ to: "/idw/auth" });
      return;
    }
    if (primaryRole(roles) === "administrator") {
      navigate({ to: "/dashboard" });
      return;
    }
    // Drain any pending "Add to cart" intent captured before authentication.
    let pending: string | null = null;
    try { pending = sessionStorage.getItem("idw_pending_add_product"); } catch { pending = null; }
    if (pending && !addProduct.isPending) {
      addProduct.mutate(pending, {
        onSettled: () => {
          try {
            sessionStorage.removeItem("idw_pending_add_product");
            sessionStorage.removeItem("idw_post_auth_return_to");
          } catch { /* noop */ }
        },
      });
    }
  }, [user, roles, loading, navigate, addProduct]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center bg-cream text-navy/60 text-sm">Loading…</div>;
  }

  const checkout = async () => {
    if (items.length === 0) return;
    // Create a pending order and clear cart — payments wiring comes next.
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total_amount: total, status: "pending" })
      .select("id")
      .single();
    if (error || !order) { toast.error(error?.message ?? "Could not start checkout"); return; }
    const orderItems = items.map((i) => ({
      order_id: order.id,
      item_type: i.item_type,
      product_id: i.product_id,
      course_id: i.course_id,
      quantity: i.quantity,
      unit_price: Number(i.product?.price ?? i.course?.price ?? 0),
    }));
    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    toast.success("Order placed. We'll be in touch about payment.");
    navigate({ to: "/dashboard" });
  };

  return (
    <SiteShell>
      <section className="container-page py-16">
        <span className="eyebrow text-clay">Checkout</span>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-3 mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-navy-deep">Your cart</h1>
          {items.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => clear.mutate()}
              disabled={clear.isPending}
              className="rounded-none border-navy/20 text-navy"
            >
              Clear cart
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-navy/10 p-12 text-center">
            <ShoppingBag className="mx-auto text-clay mb-4" size={32} />
            <p className="text-navy/60">Your cart is empty.</p>
            <div className="flex gap-3 justify-center mt-6">
              <Button asChild className="bg-navy text-cream rounded-none"><Link to="/icda">Browse Courses</Link></Button>
              <Button asChild variant="outline" className="rounded-none border-navy/20"><Link to="/idw">Shop Marketplace</Link></Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {items.map((i) => {
                const title = i.product?.name ?? i.course?.title ?? "Item";
                const price = Number(i.product?.price ?? i.course?.price ?? 0);
                const img = i.product?.image_url ?? i.course?.cover_image ?? null;
                return (
                  <div key={i.id} className="bg-white border border-navy/10 p-4 flex gap-4 items-center">
                    <div className="w-20 h-20 bg-navy/5 shrink-0">
                      {img && <img src={img} alt={title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-clay">{i.item_type}</div>
                      <h3 className="font-serif text-lg text-navy-deep truncate">{title}</h3>
                      <div className="text-sm text-navy/60 mt-1">R{price.toFixed(0)} each</div>
                    </div>
                    {i.item_type === "product" ? (
                      <div className="flex items-center border border-navy/15">
                        <button
                          aria-label="Decrease"
                          className="p-2 hover:bg-cream disabled:opacity-30"
                          disabled={i.quantity <= 1}
                          onClick={() => updateQty.mutate({ id: i.id, quantity: i.quantity - 1 })}
                        ><Minus size={14} /></button>
                        <span className="w-10 text-center text-sm">{i.quantity}</span>
                        <button
                          aria-label="Increase"
                          className="p-2 hover:bg-cream"
                          onClick={() => updateQty.mutate({ id: i.id, quantity: i.quantity + 1 })}
                        ><Plus size={14} /></button>
                      </div>
                    ) : <span className="text-xs text-navy/50 px-3">1 seat</span>}
                    <div className="w-20 text-right font-serif text-navy-deep">R{(price * i.quantity).toFixed(0)}</div>
                    <button aria-label="Remove" className="text-navy/40 hover:text-destructive p-2" onClick={() => remove.mutate(i.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <aside className="bg-white border border-navy/10 p-6 h-fit">
              <h2 className="font-serif text-xl text-navy-deep mb-4">Order summary</h2>
              <div className="flex justify-between text-sm py-2 border-b border-navy/10">
                <span className="text-navy/70">Subtotal</span>
                <span className="font-medium">R{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-navy/10">
                <span className="text-navy/70">Shipping</span>
                <span className="text-navy/50">Calculated at delivery</span>
              </div>
              <div className="flex justify-between text-base py-3 font-serif text-navy-deep">
                <span>Total</span><span>R{total.toFixed(2)}</span>
              </div>
              <Button onClick={checkout} className="w-full bg-navy hover:bg-navy-deep text-cream rounded-none py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
                Place order
              </Button>
              <p className="text-[11px] text-navy/50 mt-3 text-center">Secure checkout. Payment processing connects next.</p>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
