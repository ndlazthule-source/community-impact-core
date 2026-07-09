import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Pencil, Trash2, Upload, X, Archive } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Marketplace Products — Admin" }] }),
  component: AdminProductsPage,
});

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  designer_name: string | null;
  category_id: string | null;
  image_url: string | null;
  side_image_url: string | null;
  texture_image_url: string | null;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  visibility: "members_only" | "public";
  archived_at: string | null;
};

type CategoryRow = { id: string; name: string };

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365 * 5; // 5 years

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminProductsPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (primaryRole(roles) !== "administrator") navigate({ to: "/dashboard" });
  }, [loading, user, roles, navigate]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, description, designer_name, category_id, image_url, side_image_url, texture_image_url, price, stock, status, visibility, archived_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductRow[];
    },
    enabled: !!user && primaryRole(roles) === "administrator",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_categories").select("id, name").order("name");
      if (error) throw error;
      return (data ?? []) as CategoryRow[];
    },
  });

  const archive = async (id: string) => {
    const { error } = await supabase.from("products").update({ archived_at: new Date().toISOString(), status: "archived" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product archived.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const setVisibility = async (id: string, visibility: "members_only" | "public") => {
    const { error } = await supabase.from("products").update({ visibility }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(visibility === "public" ? "Now visible to everyone." : "Restricted to registered members.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  if (loading || !user) return <div className="min-h-screen grid place-items-center bg-cream text-navy/60 text-sm">Loading…</div>;

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="container-page py-12">
        <Link to="/dashboard" className="inline-flex items-center text-xs text-navy/60 hover:text-navy uppercase tracking-widest mb-4">
          <ArrowLeft size={14} className="mr-1" /> Back to dashboard
        </Link>
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <span className="eyebrow text-clay">Administrator</span>
            <h1 className="font-serif text-4xl md:text-5xl text-navy-deep mt-3">Marketplace Products</h1>
            <p className="text-sm text-navy/60 mt-2">Only administrators can add or edit marketplace items. Stock updates automatically as orders are placed.</p>
          </div>
          <Button onClick={() => setCreating(true)} className="bg-navy hover:bg-navy-deep text-white rounded-none">
            <Plus size={16} className="mr-2" /> Add product
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-white border border-navy/10 p-12 text-center text-navy/50">Loading…</div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-navy/10 p-12 text-center text-navy/50">No products yet. Add your first item.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const remaining = p.stock;
              const stockBadge = remaining <= 0
                ? <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest bg-red-100 text-red-700">Out of stock</span>
                : remaining <= 5
                  ? <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest bg-amber-100 text-amber-800">Only {remaining} left</span>
                  : <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700">{remaining} in stock</span>;
              return (
                <div key={p.id} className="bg-white border border-navy/10 p-4 flex flex-col">
                  <div className="aspect-square bg-navy/5 mb-3 overflow-hidden">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex gap-1 mb-2">
                    {p.side_image_url && <div className="w-10 h-10 bg-navy/5 overflow-hidden"><img src={p.side_image_url} alt="side" className="w-full h-full object-cover" /></div>}
                    {p.texture_image_url && <div className="w-10 h-10 bg-navy/5 overflow-hidden"><img src={p.texture_image_url} alt="texture" className="w-full h-full object-cover" /></div>}
                  </div>
                  <h3 className="font-serif text-lg text-navy-deep">{p.name}</h3>
                  {p.designer_name && <div className="text-xs italic text-navy/50">by {p.designer_name}</div>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-xl">R{Number(p.price).toFixed(2)}</span>
                    {stockBadge}
                  </div>
                  <div className="mt-2">
                    {p.visibility === "public" ? (
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200">Public — everyone can see</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest bg-navy/5 text-navy border border-navy/20">Members only</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy/10 flex-wrap">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)} className="text-xs"><Pencil size={12} className="mr-1" /> Edit</Button>
                    {p.visibility === "members_only" ? (
                      <Button size="sm" variant="ghost" onClick={() => setVisibility(p.id, "public")} className="text-xs text-blue-700 hover:text-blue-800">Make public</Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setVisibility(p.id, "members_only")} className="text-xs">Members only</Button>
                    )}
                    {!p.archived_at && <Button size="sm" variant="ghost" onClick={() => archive(p.id)} className="text-xs"><Archive size={12} className="mr-1" /> Archive</Button>}
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-xs text-red-600 hover:text-red-700 ml-auto"><Trash2 size={12} /></Button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {(editing || creating) && (
        <ProductDialog
          product={editing}
          categories={categories}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["admin-products"] }); }}
        />
      )}
    </div>
  );
}

function ProductDialog({ product, categories, onClose, onSaved }: { product: ProductRow | null; categories: CategoryRow[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    designer_name: product?.designer_name ?? "",
    category_id: product?.category_id ?? "",
    price: product?.price?.toString() ?? "0",
    stock: product?.stock?.toString() ?? "0",
    status: product?.status ?? "active",
    visibility: (product?.visibility ?? "members_only") as "members_only" | "public",
    image_url: product?.image_url ?? "",
    side_image_url: product?.side_image_url ?? "",
    texture_image_url: product?.texture_image_url ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleUpload = async (field: "image_url" | "side_image_url" | "texture_image_url", file: File) => {
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (upErr) { toast.error(upErr.message); return; }
    const { data: signed, error: signErr } = await supabase.storage.from("product-images").createSignedUrl(path, SIGNED_URL_EXPIRY);
    if (signErr || !signed) { toast.error(signErr?.message ?? "Could not get URL"); return; }
    setForm((f) => ({ ...f, [field]: signed.signedUrl }));
    toast.success("Image uploaded.");
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      description: form.description || null,
      designer_name: form.designer_name || null,
      category_id: form.category_id || null,
      price: Number(form.price) || 0,
      stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
      status: form.status as "active" | "draft" | "archived",
      image_url: form.image_url || null,
      side_image_url: form.side_image_url || null,
      texture_image_url: form.texture_image_url || null,
    };
    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(product ? "Product updated." : "Product added.");
    onSaved();
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-navy-deep">{product ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="rounded-none" />
            </div>
            <div>
              <Label>Designer / Maker</Label>
              <Input value={form.designer_name} onChange={(e) => setForm({ ...form, designer_name: e.target.value })} className="rounded-none" />
            </div>
            <div>
              <Label>Price (R)</Label>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-none" />
            </div>
            <div>
              <Label>Stock quantity</Label>
              <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-none" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (visible)</SelectItem>
                  <SelectItem value="draft">Draft (hidden)</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-none" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <ImageField label="Main image" url={form.image_url} onFile={(f) => handleUpload("image_url", f)} onClear={() => setForm({ ...form, image_url: "" })} />
            <ImageField label="Side view" url={form.side_image_url} onFile={(f) => handleUpload("side_image_url", f)} onClear={() => setForm({ ...form, side_image_url: "" })} />
            <ImageField label="Texture close-up" url={form.texture_image_url} onFile={(f) => handleUpload("texture_image_url", f)} onClear={() => setForm({ ...form, texture_image_url: "" })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-none">Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-navy hover:bg-navy-deep text-white rounded-none">{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImageField({ label, url, onFile, onClear }: { label: string; url: string; onFile: (f: File) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Label>{label}</Label>
      <div className="aspect-square bg-navy/5 border border-dashed border-navy/20 mt-1 relative overflow-hidden">
        {url ? (
          <>
            <img src={url} alt={label} className="w-full h-full object-cover" />
            <button type="button" onClick={onClear} className="absolute top-1 right-1 bg-white/90 p-1"><X size={12} /></button>
          </>
        ) : (
          <button type="button" onClick={() => ref.current?.click()} className="w-full h-full flex flex-col items-center justify-center text-navy/40 text-xs gap-1">
            <Upload size={20} /> Upload
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      </div>
      {url && <button type="button" onClick={() => ref.current?.click()} className="text-[11px] uppercase tracking-widest text-clay mt-1 hover:underline">Replace</button>}
    </div>
  );
}
