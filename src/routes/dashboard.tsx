import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, GraduationCap, ShoppingBag, HeartHandshake, Users, BookOpen, Settings } from "lucide-react";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — IMPACT Group" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-cream">
        <div className="text-navy/60 text-sm">Loading your dashboard…</div>
      </div>
    );
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
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="eyebrow text-clay">{role === "administrator" ? "Administrator" : role === "donor" ? "Donor" : "Student"} Dashboard</span>
            <h1 className="font-serif text-4xl md:text-5xl text-navy-deep mt-3">
              Welcome, {user.user_metadata?.full_name?.split(" ")[0] ?? "friend"}.
            </h1>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="rounded-none border-navy/20">
            <LogOut size={14} className="mr-2" /> Sign out
          </Button>
        </div>

        {role === "administrator" && <AdminDashboard />}
        {role === "donor" && <DonorDashboard />}
        {role === "student" && <StudentDashboard />}
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, body, href }: { icon: typeof Users; title: string; body: string; href: string }) {
  return (
    <Link to={href} className="bg-white border border-navy/10 p-6 shadow-soft hover:shadow-card transition-shadow group">
      <Icon className="text-clay mb-4" size={24} />
      <h3 className="font-serif text-xl text-navy-deep mb-2 group-hover:text-clay">{title}</h3>
      <p className="text-sm text-navy/60">{body}</p>
    </Link>
  );
}

function StudentDashboard() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card icon={BookOpen} title="Browse Courses" body="Discover and enrol in ICDA programmes." href="/icda" />
      <Card icon={GraduationCap} title="My Enrollments" body="Track active and completed courses." href="/dashboard" />
      <Card icon={ShoppingBag} title="My Cart" body="Review products and courses ready for checkout." href="/dashboard" />
      <Card icon={Settings} title="Profile" body="Update your personal details and avatar." href="/dashboard" />
    </div>
  );
}

function DonorDashboard() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card icon={HeartHandshake} title="Sponsor a Child" body="Browse INQABA profiles awaiting sponsorship." href="/inqaba" />
      <Card icon={GraduationCap} title="Donation History" body="Receipts and active sponsorships." href="/dashboard" />
      <Card icon={ShoppingBag} title="Marketplace" body="Shop IDW artisan goods — proceeds support makers." href="/idw" />
      <Card icon={Settings} title="Profile" body="Update your personal details." href="/dashboard" />
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card icon={Users} title="User Management" body="View users, assign roles, manage profiles." href="/dashboard" />
      <Card icon={BookOpen} title="Course Management" body="Create, edit, archive courses and approve enrollments." href="/dashboard" />
      <Card icon={ShoppingBag} title="Product Management" body="Manage IDW marketplace inventory and designers." href="/dashboard" />
      <Card icon={HeartHandshake} title="Sponsorships" body="Add and manage INQABA child profiles." href="/dashboard" />
      <Card icon={GraduationCap} title="Events" body="Create event records, upload galleries, manage feedback." href="/dashboard" />
      <Card icon={Settings} title="Reports & Audit" body="Export reports, view audit logs and donations." href="/dashboard" />
    </div>
  );
}
