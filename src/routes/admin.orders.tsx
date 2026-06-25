import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Order Management — Admin" }] }),
  component: AdminOrdersPage,
});

const STATUSES = ["processing", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const statusIcon: Record<Status, typeof Clock> = {
  processing: Clock,
  shipped: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

function AdminOrdersPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (primaryRole(roles) !== "administrator") navigate({ to: "/dashboard" });
  }, [loading, user, roles, navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, fulfillment_status, tracking_number, user_id, status, order_items(quantity, unit_price, products(name)), buyer:buyer_profiles!buyer_profiles_user_id_fkey(first_name, last_name, phone, delivery_street, delivery_suburb, delivery_city, delivery_postal_code), profile:profiles!orders_user_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && primaryRole(roles) === "administrator",
  });

  // Realtime: refetch list when any order changes
  useEffect(() => {
    const ch = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== "all" && o.fulfillment_status !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        const p = o.profile as { full_name?: string; email?: string } | null;
        const b = o.buyer as { first_name?: string; last_name?: string } | null;
        const hay = [o.id, p?.email, p?.full_name, b?.first_name, b?.last_name, o.tracking_number].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [orders, filter, search]);

  const updateStatus = async (id: string, fulfillment_status: Status) => {
    const { error } = await supabase.from("orders").update({ fulfillment_status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Order marked as ${fulfillment_status.replace(/_/g, " ")}.`);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const updateTracking = async (id: string, tracking_number: string) => {
    const { error } = await supabase.from("orders").update({ tracking_number }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Tracking saved.");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center bg-cream text-navy/60 text-sm">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="container-page py-12">
        <Link to="/dashboard" className="inline-flex items-center text-xs text-navy/60 hover:text-navy uppercase tracking-widest mb-4">
          <ArrowLeft size={14} className="mr-1" /> Back to dashboard
        </Link>
        <div className="mb-8">
          <span className="eyebrow text-clay">Administrator</span>
          <h1 className="font-serif text-4xl md:text-5xl text-navy-deep mt-3">Order Management</h1>
          <p className="text-sm text-navy/60 mt-2">All buyer orders, fulfillment status, and delivery addresses. Updates broadcast live to buyers.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Input placeholder="Search by buyer, email, order id, tracking…" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-none max-w-md" />
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-56 rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-navy/60 self-center">{filtered.length} order{filtered.length === 1 ? "" : "s"}</div>
        </div>

        {isLoading ? (
          <div className="bg-white border border-navy/10 p-12 text-center text-navy/50">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-navy/10 p-12 text-center text-navy/50">No orders match.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => {
              const buyer = o.buyer as { first_name?: string; last_name?: string; phone?: string; delivery_street?: string; delivery_suburb?: string; delivery_city?: string; delivery_postal_code?: string } | null;
              const profile = o.profile as { full_name?: string; email?: string } | null;
              const items = (o.order_items ?? []) as { quantity: number; unit_price: number; products: { name: string } | null }[];
              const status = (o.fulfillment_status ?? "processing") as Status;
              const Icon = statusIcon[status] ?? Clock;
              const buyerName = [buyer?.first_name, buyer?.last_name].filter(Boolean).join(" ") || profile?.full_name || "Unknown buyer";
              return (
                <div key={o.id} className="bg-white border border-navy/10 p-6 grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    <div className="text-[11px] uppercase tracking-widest text-navy/50">Order</div>
                    <div className="font-mono text-sm text-navy-deep">#{o.id.slice(0, 8).toUpperCase()}</div>
                    <div className="mt-3 font-serif text-lg text-navy-deep">{buyerName}</div>
                    <div className="text-xs text-navy/60">{profile?.email}</div>
                    {buyer?.phone && <div className="text-xs text-navy/60">{buyer.phone}</div>}
                    <div className="text-xs text-navy/40 mt-2">{new Date(o.created_at).toLocaleString()}</div>
                    <div className="font-serif text-xl text-navy mt-3">R{Number(o.total_amount).toFixed(2)}</div>
                  </div>

                  <div className="lg:col-span-4 text-sm">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-navy/50 mb-2">
                      <MapPin size={12} /> Delivery address
                    </div>
                    {buyer?.delivery_street ? (
                      <div className="text-navy/80 leading-relaxed">
                        {buyer.delivery_street}<br />
                        {[buyer.delivery_suburb, buyer.delivery_city].filter(Boolean).join(", ")}<br />
                        {buyer.delivery_postal_code}
                      </div>
                    ) : <div className="text-navy/40 italic">No address on file</div>}

                    <div className="mt-4 text-[11px] uppercase tracking-widest text-navy/50">Items</div>
                    <ul className="text-xs text-navy/70 mt-1 space-y-0.5">
                      {items.map((it, i) => <li key={i}>{it.quantity} × {it.products?.name ?? "Item"}</li>)}
                    </ul>
                  </div>

                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-clay" />
                      <span className="text-[11px] uppercase tracking-widest text-navy/50">Current status</span>
                    </div>
                    <Select value={status} onValueChange={(v) => updateStatus(o.id, v as Status)}>
                      <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div>
                      <label className="text-[11px] uppercase tracking-widest text-navy/50">Tracking number</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          defaultValue={o.tracking_number ?? ""}
                          placeholder="e.g. TRK-12345"
                          className="rounded-none"
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v !== (o.tracking_number ?? "")) updateTracking(o.id, v);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
