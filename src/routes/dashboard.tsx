import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LogOut, GraduationCap, ShoppingBag, HeartHandshake, Users, BookOpen, Settings,
  Bell, Award, Upload, User as UserIcon, Receipt,
} from "lucide-react";
import { useAuth, primaryRole, type AppRole } from "@/hooks/use-auth";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SuspensionBanner } from "@/components/site/SuspensionBanner";
import { SuspensionDialog, type SuspensionSubject } from "@/components/admin/SuspensionDialog";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — IMPACT Group" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center bg-cream text-navy/60 text-sm">Loading your dashboard…</div>;
  }

  const role = primaryRole(roles);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow text-clay">{roleLabel(role)} Dashboard</span>
            <h1 className="font-serif text-4xl md:text-5xl text-navy-deep mt-3">
              Welcome, {user.user_metadata?.full_name?.split(" ")[0] ?? "friend"}.
            </h1>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="rounded-none border-navy/20">
            <LogOut size={14} className="mr-2" /> Sign out
          </Button>
        </div>

        {(role === "student" || role === "donor") && <SuspensionBanner />}

        {role === "administrator" && <AdminDashboard />}
        {role === "donor" && <DonorDashboard userId={user.id} />}
        {role === "student" && <StudentDashboard userId={user.id} />}
      </div>
    </div>
  );
}

function roleLabel(r: AppRole) {
  return r === "administrator" ? "Administrator" : r === "donor" ? "Donor" : "Student";
}

/* ---------------- STUDENT ---------------- */

function StudentDashboard({ userId }: { userId: string }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 rounded-none bg-white border border-navy/10 h-auto p-1">
        <TabTrig value="profile" icon={UserIcon}>Profile</TabTrig>
        <TabTrig value="enrollments" icon={GraduationCap}>Enrollments</TabTrig>
        <TabTrig value="certificates" icon={Award}>Certificates</TabTrig>
        <TabTrig value="notifications" icon={Bell}>Notifications</TabTrig>
      </TabsList>

      <TabsContent value="profile" className="mt-8"><ProfilePanel userId={userId} /></TabsContent>
      <TabsContent value="enrollments" className="mt-8"><EnrollmentsPanel userId={userId} /></TabsContent>
      <TabsContent value="certificates" className="mt-8"><CertificatesPanel userId={userId} /></TabsContent>
      <TabsContent value="notifications" className="mt-8"><NotificationsPanel userId={userId} /></TabsContent>
    </Tabs>
  );
}

/* ---------------- DONOR ---------------- */

function DonorDashboard({ userId }: { userId: string }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 rounded-none bg-white border border-navy/10 h-auto p-1">
        <TabTrig value="profile" icon={UserIcon}>Profile</TabTrig>
        <TabTrig value="donations" icon={Receipt}>Donations</TabTrig>
        <TabTrig value="sponsorships" icon={HeartHandshake}>Sponsorships</TabTrig>
        <TabTrig value="notifications" icon={Bell}>Notifications</TabTrig>
      </TabsList>

      <TabsContent value="profile" className="mt-8"><ProfilePanel userId={userId} /></TabsContent>
      <TabsContent value="donations" className="mt-8"><DonationsPanel userId={userId} /></TabsContent>
      <TabsContent value="sponsorships" className="mt-8"><SponsorshipsPanel userId={userId} /></TabsContent>
      <TabsContent value="notifications" className="mt-8"><NotificationsPanel userId={userId} /></TabsContent>
    </Tabs>
  );
}

/* ---------------- ADMIN ---------------- */

function AdminDashboard() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-6 rounded-none bg-white border border-navy/10 h-auto p-1">
        <TabTrig value="overview" icon={Settings}>Overview</TabTrig>
        <TabTrig value="orders" icon={ShoppingBag}>Orders</TabTrig>
        <TabTrig value="courses" icon={BookOpen}>Courses</TabTrig>
        <TabTrig value="users" icon={Users}>Users</TabTrig>
        <TabTrig value="donations" icon={HeartHandshake}>Donations</TabTrig>
        <TabTrig value="events" icon={GraduationCap}>Events</TabTrig>
      </TabsList>
      <TabsContent value="overview" className="mt-8"><AdminOverviewPanel /></TabsContent>
      <TabsContent value="orders" className="mt-8"><AdminOrdersInline /></TabsContent>
      <TabsContent value="courses" className="mt-8"><AdminCoursesInline /></TabsContent>
      <TabsContent value="users" className="mt-8"><AdminUsersInline /></TabsContent>
      <TabsContent value="donations" className="mt-8"><AdminDonationsInline /></TabsContent>
      <TabsContent value="events" className="mt-8"><AdminEventsInline /></TabsContent>
    </Tabs>
  );
}

function AdminOverviewPanel() {
  const { data: stats } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [orders, donations, users, courses] = await Promise.all([
        supabase.from("orders").select("id, total_amount, fulfillment_status"),
        supabase.from("donations").select("id, amount"),
        supabase.from("profiles").select("id"),
        supabase.from("courses").select("id, enrolled_count"),
      ]);
      const orderRows = orders.data ?? [];
      return {
        orders: orderRows.length,
        active: orderRows.filter((o) => o.fulfillment_status !== "delivered" && o.fulfillment_status !== "cancelled").length,
        revenue: orderRows.reduce((s, o) => s + Number(o.total_amount ?? 0), 0),
        donations: donations.data?.length ?? 0,
        donationsTotal: (donations.data ?? []).reduce((s, d) => s + Number(d.amount ?? 0), 0),
        users: users.data?.length ?? 0,
        courses: courses.data?.length ?? 0,
      };
    },
  });
  const cards = [
    { label: "Total orders", value: stats?.orders ?? "—", sub: `${stats?.active ?? 0} active` },
    { label: "Order revenue", value: `R${(stats?.revenue ?? 0).toFixed(0)}` },
    { label: "Donations", value: stats?.donations ?? "—", sub: `R${(stats?.donationsTotal ?? 0).toFixed(0)} raised` },
    { label: "Registered users", value: stats?.users ?? "—" },
    { label: "Courses", value: stats?.courses ?? "—" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-navy/10 p-5">
            <div className="text-[11px] uppercase tracking-widest text-navy/50">{c.label}</div>
            <div className="font-serif text-3xl text-navy-deep mt-2">{c.value}</div>
            {c.sub && <div className="text-xs text-navy/50 mt-1">{c.sub}</div>}
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard to="/admin/products" icon={ShoppingBag} title="Marketplace Products" body="Add items, upload main / side / texture photos, set price and stock." />
        <AdminCard to="/admin/orders" icon={ShoppingBag} title="Order Management" body="Review buyer orders, update status, view delivery addresses." />
        <AdminCard to="/admin/courses" icon={BookOpen} title="Courses & Enrollments" body="Manage course capacity and approve enrollments." />
        <AdminCard to="/admin/events" icon={GraduationCap} title="Events" body="Publish upcoming events and document past events with outcomes." />
        <AdminCard icon={HeartHandshake} title="Donations" body="See all donations on the Donations tab above." />
      </div>
    </div>
  );
}

function AdminCard({ icon: Icon, title, body, to }: { icon: typeof Users; title: string; body: string; to?: string }) {
  const content = (
    <div className="bg-white border border-navy/10 p-6 shadow-soft h-full hover:border-clay transition-colors">
      <Icon className="text-clay mb-4" size={24} />
      <h3 className="font-serif text-xl text-navy-deep mb-2">{title}</h3>
      <p className="text-sm text-navy/60">{body}</p>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function AdminOrdersInline() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders-inline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, fulfillment_status, user_id")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      const ids = Array.from(new Set((data ?? []).map((o) => o.user_id).filter(Boolean)));
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", ids)
        : { data: [] as { id: string; full_name: string | null; email: string | null }[] };
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((o) => ({ ...o, profile: o.user_id ? map.get(o.user_id) ?? null : null }));
    },
  });
  return (
    <div className="bg-white border border-navy/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-navy-deep">Recent Orders</h2>
        <Link to="/admin/orders" className="text-xs uppercase tracking-widest text-clay hover:underline">Open full manager →</Link>
      </div>
      {isLoading ? <div className="text-navy/50 text-sm">Loading…</div> : orders.length === 0 ? <div className="text-navy/50 text-sm">No orders yet.</div> : (
        <div className="divide-y divide-navy/10">
          {orders.map((o) => {
            const p = o.profile as { full_name?: string; email?: string } | null;
            return (
              <div key={o.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <div className="font-medium text-navy-deep">{p?.full_name ?? p?.email ?? "Buyer"}</div>
                  <div className="text-xs text-navy/50">#{o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <span className="text-[11px] uppercase tracking-widest border border-navy/20 px-3 py-1 capitalize">{(o.fulfillment_status ?? "processing").replace(/_/g, " ")}</span>
                <div className="font-serif text-navy">R{Number(o.total_amount).toFixed(0)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminCoursesInline() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["admin-courses-inline"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, enrolled_count, max_capacity, status, start_date").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="bg-white border border-navy/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-navy-deep">Courses</h2>
        <Link to="/admin/courses" className="text-xs uppercase tracking-widest text-clay hover:underline">Manage courses →</Link>
      </div>
      {isLoading ? <div className="text-navy/50 text-sm">Loading…</div> : courses.length === 0 ? <div className="text-navy/50 text-sm">No courses yet.</div> : (
        <div className="divide-y divide-navy/10">
          {courses.map((c) => (
            <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <div className="font-medium text-navy-deep">{c.title}</div>
                <div className="text-xs text-navy/50">{c.start_date ? new Date(c.start_date).toLocaleDateString() : "TBD"}</div>
              </div>
              <div className="text-xs text-navy/60">{c.enrolled_count}/{c.max_capacity} enrolled</div>
              <span className="text-[11px] uppercase tracking-widest border border-navy/20 px-3 py-1 capitalize">{c.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminUsersInline() {
  const qc = useQueryClient();
  const [suspendTarget, setSuspendTarget] = useState<SuspensionSubject | null>(null);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-users-inline"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, suspended, suspension_type, suspension_reason, suspended_at, suspended_until")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const ids = (profiles ?? []).map((p) => p.id);
      const { data: rolesData } = ids.length ? await supabase.from("user_roles").select("user_id, role").in("user_id", ids) : { data: [] };
      const byUser = new Map<string, string[]>();
      (rolesData ?? []).forEach((r) => {
        const arr = byUser.get(r.user_id) ?? [];
        arr.push(r.role);
        byUser.set(r.user_id, arr);
      });
      return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
    },
  });

  return (
    <div className="bg-white border border-navy/10 p-6">
      <h2 className="font-serif text-2xl text-navy-deep mb-4">Users</h2>
      {isLoading ? <div className="text-navy/50 text-sm">Loading…</div> : (
        <div className="divide-y divide-navy/10">
          {rows.map((u) => {
            const isAdmin = u.roles.includes("administrator");
            const until = u.suspended_until ? new Date(u.suspended_until) : null;
            return (
              <div key={u.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="min-w-[180px]">
                  <div className="font-medium text-navy-deep flex items-center gap-2 flex-wrap">
                    {u.full_name ?? "—"}
                    {u.suspended && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px] capitalize">
                        {u.suspension_type ?? "suspended"}
                        {until ? ` · until ${until.toLocaleDateString()}` : ""}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-navy/50">{u.email}</div>
                  {u.suspended && u.suspension_reason && (
                    <div className="text-[11px] text-red-700/80 mt-1 max-w-md">Reason: {u.suspension_reason}</div>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {u.roles.length === 0 ? <Badge variant="outline" className="text-[10px]">no role</Badge> :
                    u.roles.map((r) => <Badge key={r} variant="outline" className="text-[10px] capitalize">{r}</Badge>)}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-navy/40">{new Date(u.created_at).toLocaleDateString()}</div>
                  {!isAdmin && (
                    <Button
                      size="sm"
                      variant={u.suspended ? "outline" : "destructive"}
                      onClick={() => setSuspendTarget({
                        id: u.id,
                        name: u.full_name ?? u.email,
                        suspended: u.suspended,
                        suspension_type: u.suspension_type,
                        suspension_reason: u.suspension_reason,
                        suspended_until: u.suspended_until,
                      })}
                      className="rounded-none text-[10px] uppercase tracking-widest h-8"
                    >
                      {u.suspended ? "Manage" : "Suspend"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {suspendTarget && (
        <SuspensionDialog
          subject={suspendTarget}
          open
          onOpenChange={(v) => { if (!v) setSuspendTarget(null); }}
          onDone={() => { setSuspendTarget(null); qc.invalidateQueries({ queryKey: ["admin-users-inline"] }); }}
        />
      )}
    </div>
  );
}



function AdminDonationsInline() {
  const { data: donations = [], isLoading } = useQuery({
    queryKey: ["admin-donations-inline"],
    queryFn: async () => {
      const { data, error } = await supabase.from("donations").select("id, amount, currency, donor_name, donor_email, is_recurring, status, created_at").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
  const total = donations.reduce((s, d) => s + Number(d.amount ?? 0), 0);
  return (
    <div className="bg-white border border-navy/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-navy-deep">Donations</h2>
        <div className="text-sm text-navy/60">Total: <span className="font-serif text-navy">R{total.toFixed(0)}</span></div>
      </div>
      {isLoading ? <div className="text-navy/50 text-sm">Loading…</div> : donations.length === 0 ? <div className="text-navy/50 text-sm">No donations yet.</div> : (
        <div className="divide-y divide-navy/10">
          {donations.map((d) => (
            <div key={d.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <div className="font-medium text-navy-deep">{d.donor_name ?? "Anonymous"}</div>
                <div className="text-xs text-navy/50">{d.donor_email ?? "—"}</div>
              </div>
              <div className="font-serif text-navy">{d.currency} {Number(d.amount).toFixed(2)}{d.is_recurring ? " /mo" : ""}</div>
              <span className="text-[11px] uppercase tracking-widest border border-navy/20 px-3 py-1 capitalize">{d.status}</span>
              <div className="text-xs text-navy/40">{new Date(d.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminEventsInline() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events-inline"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("id, title, event_date, status, location").order("event_date", { ascending: false }).limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="bg-white border border-navy/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl text-navy-deep">Events</h2>
        <Link to="/admin/events" className="text-xs uppercase tracking-widest text-clay hover:text-navy">Open event manager →</Link>
      </div>
      {isLoading ? <div className="text-navy/50 text-sm">Loading…</div> : events.length === 0 ? <div className="text-navy/50 text-sm">No events yet.</div> : (
        <div className="divide-y divide-navy/10">
          {events.map((e) => (
            <div key={e.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <div className="font-medium text-navy-deep">{e.title}</div>
                <div className="text-xs text-navy/50">{e.location ?? "—"}</div>
              </div>
              <div className="text-xs text-navy/60">{e.event_date ? new Date(e.event_date).toLocaleDateString() : "—"}</div>
              <span className="text-[11px] uppercase tracking-widest border border-navy/20 px-3 py-1 capitalize">{e.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ---------------- SHARED PANELS ---------------- */

function TabTrig({ value, icon: Icon, children }: { value: string; icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <TabsTrigger value={value} className="rounded-none data-[state=active]:bg-navy data-[state=active]:text-cream py-3 text-xs uppercase tracking-widest">
      <Icon size={14} className="mr-2" />{children}
    </TabsTrigger>
  );
}

function ProfilePanel({ userId }: { userId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: String(f.get("full_name") ?? ""),
      phone: String(f.get("phone") ?? ""),
      city: String(f.get("city") ?? ""),
      country: String(f.get("country") ?? ""),
      address: String(f.get("address") ?? ""),
      bio: String(f.get("bio") ?? ""),
    }).eq("id", userId);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile updated."); refetch(); }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    const url = signed?.signedUrl ?? null;
    if (url) await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    setUploading(false);
    toast.success("Profile picture updated.");
    refetch();
  };

  const initials = (profile?.full_name ?? "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="bg-white border border-navy/10 p-6 text-center">
        <Avatar className="w-32 h-32 mx-auto mb-4 ring-4 ring-cream">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? "Avatar"} />
          <AvatarFallback className="bg-navy text-cream font-serif text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="font-serif text-xl text-navy-deep">{profile?.full_name ?? "—"}</div>
        <div className="text-xs text-navy/50 mt-1">{profile?.email}</div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="mt-6 w-full rounded-none bg-navy text-cream text-[11px] uppercase tracking-widest">
          <Upload size={14} className="mr-2" />{uploading ? "Uploading…" : "Change picture"}
        </Button>
      </div>

      <form onSubmit={handleSave} className="lg:col-span-2 bg-white border border-navy/10 p-6 space-y-4">
        <h2 className="font-serif text-2xl text-navy-deep mb-2">Personal details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field name="full_name" label="Full name" defaultValue={profile?.full_name ?? ""} />
          <Field name="phone" label="Phone" defaultValue={profile?.phone ?? ""} />
          <Field name="city" label="City" defaultValue={profile?.city ?? ""} />
          <Field name="country" label="Country" defaultValue={profile?.country ?? ""} />
        </div>
        <Field name="address" label="Address" defaultValue={profile?.address ?? ""} />
        <div>
          <Label htmlFor="bio">Short bio</Label>
          <Textarea id="bio" name="bio" rows={4} defaultValue={profile?.bio ?? ""} className="rounded-none mt-1" />
        </div>
        <Button type="submit" disabled={saving} className="bg-navy text-cream rounded-none py-5 px-8 text-[11px] uppercase tracking-widest">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} className="rounded-none mt-1" />
    </div>
  );
}

function EnrollmentsPanel({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["enrollments", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, status, enrollment_year, created_at, completed_at, certificate_url, course:courses(id, title, instructor, start_date, end_date)")
        .eq("student_id", userId)
        .order("enrollment_year", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <PanelEmpty msg="Loading enrolments…" />;
  if (!data || data.length === 0) {
    return <PanelEmpty msg="You haven't enrolled in any courses yet." cta={{ to: "/icda", label: "Browse courses" }} />;
  }

  const byYear = data.reduce<Record<number, typeof data>>((acc, e) => {
    (acc[e.enrollment_year] ??= []).push(e);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  const statusTone: Record<string, string> = {
    pending: "border-gold/40 bg-gold/10 text-navy-deep",
    approved: "border-emerald-600/30 bg-emerald-50 text-emerald-800",
    rejected: "border-destructive/30 bg-destructive/10 text-destructive",
    completed: "border-navy/30 bg-navy/5 text-navy-deep",
    cancelled: "border-navy/20 bg-navy/5 text-navy/60",
    waitlisted: "border-clay/30 bg-clay/10 text-clay",
  };

  return (
    <div className="space-y-10">
      {years.map((year) => (
        <section key={year}>
          <div className="flex items-baseline gap-3 mb-4 border-b border-navy/10 pb-2">
            <h2 className="font-serif text-2xl text-navy-deep">{year}</h2>
            <span className="text-xs text-navy/50 uppercase tracking-widest">{byYear[year].length} enrolment{byYear[year].length === 1 ? "" : "s"}</span>
          </div>
          <div className="space-y-3">
            {byYear[year].map((e) => {
              const c = e.course as { title: string; instructor: string | null; start_date: string | null } | null;
              return (
                <div key={e.id} className="bg-white border border-navy/10 p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg text-navy-deep">{c?.title ?? "Course"}</h3>
                    <div className="text-xs text-navy/60 mt-1">
                      {c?.instructor && <>Instructor · {c.instructor} · </>}Submitted {new Date(e.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-[11px] uppercase tracking-widest border px-3 py-1 capitalize ${statusTone[e.status] ?? "border-navy/20"}`}>
                    {e.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}


function CertificatesPanel({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["certificates", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, completed_at, certificate_url, course:courses(title)")
        .eq("student_id", userId)
        .not("certificate_url", "is", null);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <PanelEmpty msg="Loading certificates…" />;
  if (!data || data.length === 0) {
    return <PanelEmpty msg="Certificates appear here once you complete a course." />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {data.map((e) => {
        const c = e.course as { title: string } | null;
        return (
          <a key={e.id} href={e.certificate_url!} target="_blank" rel="noreferrer" className="bg-white border border-navy/10 p-6 hover:border-clay transition-colors">
            <Award className="text-gold mb-3" size={28} />
            <h3 className="font-serif text-lg text-navy-deep">{c?.title}</h3>
            <p className="text-xs text-navy/60 mt-1">Completed {e.completed_at ? new Date(e.completed_at).toLocaleDateString() : "—"}</p>
            <span className="text-xs uppercase tracking-widest text-clay mt-3 inline-block">Download →</span>
          </a>
        );
      })}
    </div>
  );
}

function NotificationsPanel({ userId }: { userId: string }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    refetch();
  };

  if (isLoading) return <PanelEmpty msg="Loading notifications…" />;
  if (!data || data.length === 0) return <PanelEmpty msg="You're all caught up." />;

  return (
    <div className="space-y-2">
      {data.map((n) => (
        <div key={n.id} className={`bg-white border border-navy/10 p-4 flex items-start gap-3 ${n.is_read ? "opacity-60" : ""}`}>
          <Bell size={16} className="text-clay mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-navy-deep">{n.title}</div>
            {n.body && <div className="text-sm text-navy/70 mt-1">{n.body}</div>}
            <div className="text-[11px] text-navy/40 mt-1">{new Date(n.created_at).toLocaleString()}</div>
          </div>
          {!n.is_read && (
            <button onClick={() => markRead(n.id)} className="text-xs text-clay hover:underline">Mark read</button>
          )}
        </div>
      ))}
    </div>
  );
}

function DonationsPanel({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["donations", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations").select("*").eq("donor_id", userId).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <PanelEmpty msg="Loading donations…" />;
  if (!data || data.length === 0) {
    return <PanelEmpty msg="No donations yet." cta={{ to: "/inqaba", label: "Sponsor a child" }} />;
  }

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.id} className="bg-white border border-navy/10 p-5 flex items-center justify-between">
          <div>
            <div className="font-serif text-lg text-navy-deep">{d.currency} {Number(d.amount).toFixed(2)}</div>
            <div className="text-xs text-navy/60 mt-1">{new Date(d.created_at).toLocaleDateString()} · {d.is_recurring ? "Recurring" : "One-time"}</div>
          </div>
          <Badge variant="outline" className="rounded-none border-navy/20 capitalize">{d.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function SponsorshipsPanel({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["sponsorships-mine", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("id, amount, currency, created_at, status, sponsorship:sponsorships(id, child_name, child_age, location, image_url, monthly_amount)")
        .eq("donor_id", userId)
        .not("sponsorship_id", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <PanelEmpty msg="Loading sponsorships…" />;
  if (!data || data.length === 0) {
    return <PanelEmpty msg="You haven't sponsored a child yet." cta={{ to: "/inqaba", label: "Find a child to sponsor" }} />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {data.map((row) => {
        const s = row.sponsorship as { child_name: string; child_age: number | null; location: string | null; image_url: string | null; monthly_amount: number } | null;
        if (!s) return null;
        return (
          <div key={row.id} className="bg-white border border-navy/10 overflow-hidden">
            <div className="aspect-[16/10] bg-navy/5">
              {s.image_url && <img src={s.image_url} alt={s.child_name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg text-navy-deep">{s.child_name}{s.child_age && <span className="text-clay">, {s.child_age}</span>}</h3>
              {s.location && <div className="text-xs text-navy/60">{s.location}</div>}
              <div className="text-sm text-navy/70 mt-3">R{Number(s.monthly_amount).toFixed(0)} / month · since {new Date(row.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PanelEmpty({ msg, cta }: { msg: string; cta?: { to: string; label: string } }) {
  return (
    <div className="bg-white border border-navy/10 p-12 text-center">
      <p className="text-navy/60">{msg}</p>
      {cta && (
        <Button asChild className="mt-6 bg-navy text-cream rounded-none">
          <Link to={cta.to}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}
