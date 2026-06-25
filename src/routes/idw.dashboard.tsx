import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Calendar, MapPin, Package, ShoppingBag, User as UserIcon, CreditCard, Truck, CheckCircle2, Clock, Download, RotateCw, Plus, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

const productsQuery = queryOptions({
  queryKey: ["idw", "catalogue"],
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

const eventsQuery = queryOptions({
  queryKey: ["idw", "events"],
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

export const Route = createFileRoute("/idw/dashboard")({
  head: () => ({ meta: [{ title: "IDW Buyer Dashboard" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/idw/auth" });
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
    context.queryClient.ensureQueryData(eventsQuery);
  },
  component: IDWDashboard,
});

function IDWDashboard() {
  const { user, loading } = useAuth();
  if (loading || !user) {
    return <SiteShell><div className="container-page py-24 text-center text-mute">Loading…</div></SiteShell>;
  }
  return (
    <SiteShell>
      <section className="bg-navy-deep text-white">
        <div className="container-page py-12">
          <span className="tag-pill bg-white/10 text-white">IDW Marketplace</span>
          <h1 className="font-serif text-4xl md:text-5xl mt-4 text-white">My IDW Account</h1>
          <p className="text-white/70 mt-2">Welcome back, {user.email}</p>
        </div>
      </section>

      <section className="container-page py-10">
        <Tabs defaultValue="catalogue" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1 bg-blue-pill p-1 rounded-full h-auto mb-8">
            <TabsTrigger value="catalogue" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-navy">Catalogue</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-navy">Orders</TabsTrigger>
            <TabsTrigger value="events" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-navy">Events</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-navy">Profile</TabsTrigger>
            <TabsTrigger value="payment" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-navy">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogue"><CataloguePanel /></TabsContent>
          <TabsContent value="orders"><OrdersPanel userId={user.id} /></TabsContent>
          <TabsContent value="events"><EventsPanel /></TabsContent>
          <TabsContent value="profile"><ProfilePanel userId={user.id} /></TabsContent>
          <TabsContent value="payment"><PaymentPanel userId={user.id} /></TabsContent>
        </Tabs>
      </section>

      <StickyCartBar />
    </SiteShell>
  );
}

/* ------------------ Catalogue ------------------ */
function CataloguePanel() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { addProduct } = useCart();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl text-navy-deep">Product Catalogue</h2>
          <p className="text-sm text-mute">{products.length} items available</p>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="bg-white border border-navy/10 rounded-xl p-12 text-center text-mute">
          The catalogue is being curated. Check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <article key={p.id} className="bg-white rounded-xl border border-navy/10 overflow-hidden group hover:shadow-card transition-shadow">
              <div className="aspect-[3/4] bg-blue-pill overflow-hidden">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
              </div>
              <div className="p-4">
                {p.product_categories && (
                  <div className="text-[10px] uppercase tracking-widest text-blue mb-1">{(p.product_categories as { name: string }).name}</div>
                )}
                <h3 className="font-serif text-base text-navy-deep">{p.name}</h3>
                {p.designer_name && <div className="text-xs text-mute italic">by {p.designer_name}</div>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-serif text-lg text-navy">R{Number(p.price).toFixed(0)}</span>
                  <Button size="sm" onClick={() => addProduct.mutate(p.id)} className="bg-blue hover:bg-navy text-white rounded-full text-xs px-4">
                    Add to Cart
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------ Sticky cart bar ------------------ */
function StickyCartBar() {
  const { count, total, remove } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  if (count === 0) return null;

  const clear = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    qc.invalidateQueries({ queryKey: ["cart", user.id] });
    toast.success("Your cart has been cleared");
  };

  // Note: 'remove' is wired up via useCart for individual items elsewhere
  void remove;

  return (
    <div className="sticky bottom-4 z-40 px-4">
      <div className="container-page">
        <div className="bg-navy-deep text-white rounded-full shadow-elevated flex items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-blue-soft" />
            <span className="text-sm">
              <strong>{count}</strong> item{count !== 1 ? "s" : ""} · <strong>R{total.toFixed(0)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clear} className="text-xs text-white/60 hover:text-white px-3 py-1">Clear</button>
            <Button onClick={() => navigate({ to: "/cart" })} size="sm" className="bg-blue hover:bg-blue-soft text-white rounded-full">
              View Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Orders ------------------ */
function OrdersPanel({ userId }: { userId: string }) {
  const [view, setView] = useState<"current" | "history">("current");
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(quantity, unit_price, products(name, image_url))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  // Realtime subscription: live status updates from admin
  useEffect(() => {
    const channel = supabase
      .channel(`orders:${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
        (payload) => {
          const next = payload.new as { fulfillment_status?: string };
          if (next?.fulfillment_status) {
            const label = next.fulfillment_status.replace(/_/g, " ");
            toast.success(`Order update: ${label}`);
          }
          qc.invalidateQueries({ queryKey: ["orders", userId] });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, qc]);

  const current = orders.filter((o) => o.fulfillment_status !== "delivered" && o.fulfillment_status !== "cancelled");
  const past = orders.filter((o) => o.fulfillment_status === "delivered" || o.fulfillment_status === "cancelled");
  const visible = view === "current" ? current : past;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-navy-deep">Orders</h2>
        <div className="inline-flex bg-blue-pill rounded-full p-1 text-sm">
          <button onClick={() => setView("current")} className={`px-4 py-1.5 rounded-full ${view === "current" ? "bg-white text-navy font-semibold" : "text-mute"}`}>
            Current ({current.length})
          </button>
          <button onClick={() => setView("history")} className={`px-4 py-1.5 rounded-full ${view === "history" ? "bg-white text-navy font-semibold" : "text-mute"}`}>
            History ({past.length})
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-navy/10 rounded-xl p-12 text-center text-mute">
          {view === "current" ? "No active orders. Start shopping the catalogue!" : "No past orders yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}

const statusSteps = [
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

function OrderCard({ order }: { order: { id: string; created_at: string; total_amount: number; fulfillment_status: string; tracking_number: string | null; order_items: { quantity: number; unit_price: number; products: { name: string; image_url: string | null } | null }[] } }) {
  const currentStep = statusSteps.findIndex((s) => s.key === order.fulfillment_status);

  return (
    <div className="bg-white border border-navy/10 rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-xs text-mute">Order #{order.id.slice(0, 8).toUpperCase()}</div>
          <div className="font-serif text-lg text-navy-deep">R{Number(order.total_amount).toFixed(0)}</div>
          <div className="text-xs text-mute">{new Date(order.created_at).toLocaleDateString()}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full text-xs border-navy/20"><Download size={12} className="mr-1" /> Invoice</Button>
          {order.fulfillment_status === "delivered" && (
            <Button size="sm" className="rounded-full text-xs bg-blue hover:bg-navy text-white"><RotateCw size={12} className="mr-1" /> Re-order</Button>
          )}
        </div>
      </div>

      {order.fulfillment_status !== "cancelled" && (
        <div className="flex items-center gap-2 mb-4">
          {statusSteps.map((s, i) => {
            const Icon = s.icon;
            const done = i <= currentStep;
            return (
              <div key={s.key} className="flex items-center flex-1 last:flex-none">
                <div className={`w-8 h-8 rounded-full grid place-items-center text-xs ${done ? "bg-blue text-white" : "bg-blue-pill text-mute"}`}>
                  <Icon size={14} />
                </div>
                <div className="ml-2 hidden md:block">
                  <div className={`text-xs font-semibold ${done ? "text-navy" : "text-mute"}`}>{s.label}</div>
                </div>
                {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? "bg-blue" : "bg-blue-pill"}`} />}
              </div>
            );
          })}
        </div>
      )}

      {order.tracking_number && (
        <div className="text-xs text-mute mb-3">Tracking: <span className="font-mono text-navy">{order.tracking_number}</span></div>
      )}

      <div className="space-y-1 text-sm text-mute">
        {order.order_items.map((it, idx) => (
          <div key={idx}>{it.quantity} × {it.products?.name ?? "Item"} — R{Number(it.unit_price).toFixed(0)}</div>
        ))}
      </div>
    </div>
  );
}

/* ------------------ Events ------------------ */
function EventsPanel() {
  const { data: events } = useSuspenseQuery(eventsQuery);
  const upcoming = events.filter((e) => e.status === "upcoming" || e.status === "ongoing");
  const past = events.filter((e) => e.status === "completed");

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl text-navy-deep mb-4">Upcoming Events</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white border border-navy/10 rounded-xl p-8 text-center text-mute">No events scheduled. Stay tuned.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">{upcoming.map((e) => <EventCard key={e.id} e={e} />)}</div>
        )}
      </div>
      <div>
        <h2 className="font-serif text-2xl text-navy-deep mb-4">Past Events</h2>
        {past.length === 0 ? (
          <div className="bg-white border border-navy/10 rounded-xl p-8 text-center text-mute">Recap gallery will appear here.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">{past.map((e) => <EventCard key={e.id} e={e} />)}</div>
        )}
      </div>
    </div>
  );
}

function EventCard({ e }: { e: { id: string; title: string; description: string | null; category: string | null; location: string | null; event_date: string; featured_image: string | null } }) {
  return (
    <article className="bg-white border border-navy/10 rounded-xl overflow-hidden">
      <div className="aspect-[16/9] bg-blue-pill">
        {e.featured_image && <img src={e.featured_image} alt={e.title} className="w-full h-full object-cover" loading="lazy" />}
      </div>
      <div className="p-5">
        {e.category && <span className="tag-pill text-[10px]">{e.category}</span>}
        <h3 className="font-serif text-lg text-navy-deep mt-2 mb-2">{e.title}</h3>
        {e.description && <p className="text-sm text-mute line-clamp-3 mb-3">{e.description}</p>}
        <div className="flex flex-wrap gap-4 text-xs text-mute">
          <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(e.event_date).toLocaleDateString()}</span>
          {e.location && <span className="flex items-center gap-1"><MapPin size={12} /> {e.location}</span>}
        </div>
      </div>
    </article>
  );
}

/* ------------------ Profile ------------------ */
const profileSchema = z.object({
  first_name: z.string().trim().max(80),
  last_name: z.string().trim().max(80),
  phone: z.string().trim().max(20),
  delivery_street: z.string().trim().max(200),
  delivery_suburb: z.string().trim().max(100),
  delivery_city: z.string().trim().max(100),
  delivery_postal_code: z.string().trim().max(20),
});

function ProfilePanel({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["buyer_profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("buyer_profiles").select("*").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const { error } = await supabase.from("buyer_profiles").upsert({ user_id: userId, ...values }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile saved."); qc.invalidateQueries({ queryKey: ["buyer_profile", userId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-mute">Loading…</div>;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    save.mutate(parsed.data);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-pill grid place-items-center"><UserIcon size={20} className="text-blue" /></div>
        <div>
          <h2 className="font-serif text-2xl text-navy-deep">Buyer Profile</h2>
          <p className="text-sm text-mute">Used for delivery and contact</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-navy/10 rounded-xl p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="First name" name="first_name" defaultValue={profile?.first_name ?? ""} />
          <Field label="Last name" name="last_name" defaultValue={profile?.last_name ?? ""} />
        </div>
        <Field label="Phone number" name="phone" type="tel" defaultValue={profile?.phone ?? ""} />

        <div className="pt-3 border-t border-navy/10">
          <h3 className="text-sm font-semibold text-navy mb-3">Delivery address</h3>
          <Field label="Street" name="delivery_street" defaultValue={profile?.delivery_street ?? ""} />
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <Field label="Suburb" name="delivery_suburb" defaultValue={profile?.delivery_suburb ?? ""} />
            <Field label="City" name="delivery_city" defaultValue={profile?.delivery_city ?? ""} />
            <Field label="Postal code" name="delivery_postal_code" defaultValue={profile?.delivery_postal_code ?? ""} />
          </div>
        </div>

        <Button type="submit" disabled={save.isPending} className="bg-blue hover:bg-navy text-white rounded-full px-8">
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, name, defaultValue, type = "text" }: { label: string; name: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <Label htmlFor={name} className="text-xs text-mute">{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} className="mt-1 rounded-md" />
    </div>
  );
}

/* ------------------ Payment ------------------ */
function PaymentPanel({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const { data: methods = [] } = useQuery({
    queryKey: ["buyer_payment_methods", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("buyer_payment_methods").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async (fd: FormData) => {
      const cardNumber = String(fd.get("cardNumber") ?? "").replace(/\s/g, "");
      const cardholder = String(fd.get("cardholder") ?? "").trim();
      const expiry = String(fd.get("expiry") ?? "").trim(); // MM/YY
      // NOTE: We deliberately DO NOT store CVV or the full card number — PCI compliance.
      if (!/^\d{12,19}$/.test(cardNumber)) throw new Error("Card number must be 12-19 digits.");
      if (!/^\d{2}\/\d{2}$/.test(expiry)) throw new Error("Expiry must be MM/YY.");
      if (cardholder.length < 2) throw new Error("Cardholder name required.");
      const [mm, yy] = expiry.split("/").map((x) => parseInt(x, 10));
      const brand = cardNumber.startsWith("4") ? "visa" : cardNumber.startsWith("5") ? "mastercard" : cardNumber.startsWith("3") ? "amex" : "card";
      const { error } = await supabase.from("buyer_payment_methods").insert({
        user_id: userId,
        cardholder_name: cardholder,
        brand,
        last4: cardNumber.slice(-4),
        exp_month: mm,
        exp_year: 2000 + yy,
        is_default: methods.length === 0,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Payment method saved."); setAdding(false); qc.invalidateQueries({ queryKey: ["buyer_payment_methods", userId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeM = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("buyer_payment_methods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Removed."); qc.invalidateQueries({ queryKey: ["buyer_payment_methods", userId] }); },
  });

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-pill grid place-items-center"><CreditCard size={20} className="text-blue" /></div>
          <div>
            <h2 className="font-serif text-2xl text-navy-deep">Payment Methods</h2>
            <p className="text-sm text-mute">Saved cards for fast checkout</p>
          </div>
        </div>
        {!adding && (
          <Button onClick={() => setAdding(true)} className="bg-blue hover:bg-navy text-white rounded-full"><Plus size={14} className="mr-1" /> Add card</Button>
        )}
      </div>

      <div className="bg-blue-pill border border-blue/20 text-xs text-navy p-3 rounded-lg mb-4">
        For your security, only the last 4 digits and expiry are stored. We never store the full card number or CVV.
      </div>

      <div className="space-y-3 mb-6">
        {methods.length === 0 && !adding && (
          <div className="bg-white border border-navy/10 rounded-xl p-8 text-center text-mute">No payment methods saved.</div>
        )}
        {methods.map((m) => (
          <div key={m.id} className="bg-white border border-navy/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-navy capitalize">{m.brand} •••• {m.last4}</div>
              <div className="text-xs text-mute">{m.cardholder_name} · Expires {String(m.exp_month).padStart(2, "0")}/{String(m.exp_year).slice(2)}</div>
            </div>
            <button onClick={() => removeM.mutate(m.id)} className="text-mute hover:text-destructive p-2"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      {adding && (
        <form onSubmit={(e) => { e.preventDefault(); add.mutate(new FormData(e.currentTarget)); }} className="bg-white border border-navy/10 rounded-xl p-6 space-y-4">
          <Field label="Cardholder name" name="cardholder" />
          <Field label="Card number" name="cardNumber" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expiry (MM/YY)" name="expiry" />
            <div>
              <Label htmlFor="cvv-display" className="text-xs text-mute">CVV (not stored)</Label>
              <Input id="cvv-display" name="cvv" type="password" maxLength={4} className="mt-1 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={add.isPending} className="bg-blue hover:bg-navy text-white rounded-full">Save card</Button>
            <Button type="button" variant="outline" onClick={() => setAdding(false)} className="rounded-full">Cancel</Button>
          </div>
        </form>
      )}

      <Link to="/idw" className="block text-center text-sm text-blue hover:underline mt-6">← Back to marketplace</Link>
    </div>
  );
}
