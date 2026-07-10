import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Pencil, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth, primaryRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SuspensionDialog, type SuspensionSubject } from "@/components/admin/SuspensionDialog";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({ meta: [{ title: "Course & Enrollment Management — Admin" }] }),
  component: AdminCoursesPage,
});

function AdminCoursesPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (primaryRole(roles) !== "administrator") navigate({ to: "/dashboard" });
  }, [loading, user, roles, navigate]);

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
        <div className="mb-10">
          <span className="eyebrow text-clay">Administrator</span>
          <h1 className="font-serif text-4xl md:text-5xl text-navy-deep mt-3">Course & Enrollment Management</h1>
        </div>

        <Tabs defaultValue="courses">
          <TabsList className="rounded-none bg-white border border-navy/10 h-auto p-1">
            <TabsTrigger value="courses" className="rounded-none data-[state=active]:bg-navy data-[state=active]:text-cream py-3 px-6 text-xs uppercase tracking-widest">Courses</TabsTrigger>
            <TabsTrigger value="enrollments" className="rounded-none data-[state=active]:bg-navy data-[state=active]:text-cream py-3 px-6 text-xs uppercase tracking-widest">Enrollments</TabsTrigger>
          </TabsList>
          <TabsContent value="courses" className="mt-8"><CoursesAdmin /></TabsContent>
          <TabsContent value="enrollments" className="mt-8"><EnrollmentsAdmin /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------------- COURSES ---------------- */

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructor: string | null;
  category_id: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_deadline: string | null;
  max_capacity: number;
  enrolled_count: number;
  price: number;
  status: "draft" | "open" | "full" | "in_progress" | "completed" | "archived";
};

function CoursesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [open, setOpen] = useState(false);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, slug, description, instructor, category_id, start_date, end_date, registration_deadline, max_capacity, enrolled_count, price, status")
        .is("archived_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CourseRow[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["course-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("course_categories").select("id, name").order("name");
      return data ?? [];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Archive this course? Enrollments will remain.")) return;
    const { error } = await supabase.from("courses").update({ archived_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Course archived."); qc.invalidateQueries({ queryKey: ["admin-courses"] }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-navy/60">{courses?.length ?? 0} active courses</p>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-navy text-cream rounded-none text-[11px] uppercase tracking-widest" onClick={() => setEditing(null)}>
              <Plus size={14} className="mr-2" /> New course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">{editing ? "Edit course" : "New course"}</DialogTitle>
            </DialogHeader>
            <CourseForm
              course={editing}
              categories={categories ?? []}
              onSaved={() => { setOpen(false); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-courses"] }); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-navy/50 text-sm">Loading…</div>
      ) : (
        <div className="bg-white border border-navy/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy text-cream text-[11px] uppercase tracking-widest">
              <tr>
                <th className="text-left p-4">Course</th>
                <th className="text-left p-4">Dates</th>
                <th className="text-left p-4">Reg. deadline</th>
                <th className="text-left p-4">Seats</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(courses ?? []).map((c) => {
                const seatsLeft = c.max_capacity - (c.enrolled_count ?? 0);
                const full = seatsLeft <= 0;
                return (
                  <tr key={c.id} className="border-t border-navy/10">
                    <td className="p-4">
                      <div className="font-serif text-navy-deep">{c.title}</div>
                      <div className="text-xs text-navy/50">{c.instructor ?? "—"}</div>
                    </td>
                    <td className="p-4 text-xs text-navy/70">
                      {c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"}<br />
                      {c.end_date ? new Date(c.end_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-xs text-navy/70">
                      {c.registration_deadline ? new Date(c.registration_deadline).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-xs">
                      <span className={full ? "text-destructive font-semibold" : "text-navy-deep"}>
                        {c.enrolled_count ?? 0}/{c.max_capacity}
                      </span>
                      <div className="text-navy/50">{full ? "Course Full" : `${seatsLeft} left`}</div>
                    </td>
                    <td className="p-4 text-xs capitalize">{c.status}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" className="rounded-none" onClick={() => { setEditing(c); setOpen(true); }}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-none text-destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {(courses ?? []).length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-navy/50">No courses yet. Create one to begin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CourseForm({
  course,
  categories,
  onSaved,
}: {
  course: CourseRow | null;
  categories: { id: string; name: string }[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<CourseRow["status"]>(course?.status ?? "open");
  const [categoryId, setCategoryId] = useState<string>(course?.category_id ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSaving(true);
    const title = String(f.get("title") ?? "").trim();
    const slug = (course?.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) || crypto.randomUUID();
    const payload = {
      title,
      slug,
      description: String(f.get("description") ?? ""),
      instructor: String(f.get("instructor") ?? "") || null,
      category_id: categoryId || null,
      start_date: (f.get("start_date") || null) as string | null,
      end_date: (f.get("end_date") || null) as string | null,
      registration_deadline: (f.get("registration_deadline") || null) as string | null,
      max_capacity: Number(f.get("max_capacity") ?? 30),
      price: Number(f.get("price") ?? 0),
      status,
    };
    const { error } = course
      ? await supabase.from("courses").update(payload).eq("id", course.id)
      : await supabase.from("courses").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(course ? "Course updated." : "Course created.");
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Course name</Label>
        <Input id="title" name="title" required defaultValue={course?.title ?? ""} className="rounded-none mt-1" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={course?.description ?? ""} className="rounded-none mt-1" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="rounded-none mt-1"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="instructor">Instructor</Label>
          <Input id="instructor" name="instructor" defaultValue={course?.instructor ?? ""} className="rounded-none mt-1" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={course?.start_date?.slice(0, 10) ?? ""} className="rounded-none mt-1" />
        </div>
        <div>
          <Label htmlFor="end_date">End date</Label>
          <Input id="end_date" name="end_date" type="date" defaultValue={course?.end_date?.slice(0, 10) ?? ""} className="rounded-none mt-1" />
        </div>
        <div>
          <Label htmlFor="registration_deadline">Registration deadline</Label>
          <Input id="registration_deadline" name="registration_deadline" type="date" defaultValue={course?.registration_deadline?.slice(0, 10) ?? ""} className="rounded-none mt-1" />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="max_capacity">Maximum capacity</Label>
          <Input id="max_capacity" name="max_capacity" type="number" min={1} required defaultValue={course?.max_capacity ?? 30} className="rounded-none mt-1" />
        </div>
        <div>
          <Label htmlFor="price">Price (R)</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={course?.price ?? 0} className="rounded-none mt-1" />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as CourseRow["status"])}>
            <SelectTrigger className="rounded-none mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={saving} className="bg-navy text-cream rounded-none py-5 px-8 text-[11px] uppercase tracking-widest w-full">
        {saving ? "Saving…" : course ? "Save changes" : "Create course"}
      </Button>
    </form>
  );
}

/* ---------------- ENROLLMENTS ---------------- */

function EnrollmentsAdmin() {
  const qc = useQueryClient();
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [suspendTarget, setSuspendTarget] = useState<SuspensionSubject | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, status, enrollment_year, created_at, student_id, course:courses(id, title)")
        .order("enrollment_year", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const studentIds = useMemo(() => Array.from(new Set((data ?? []).map((e) => e.student_id))), [data]);
  const { data: profiles } = useQuery({
    queryKey: ["enrollment-profiles", studentIds],
    enabled: studentIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, suspended, suspension_type, suspension_reason, suspended_until")
        .in("id", studentIds);
      const m = new Map<string, { full_name: string | null; email: string | null; suspended: boolean | null; suspension_type: string | null; suspension_reason: string | null; suspended_until: string | null }>();
      (data ?? []).forEach((p) => m.set(p.id, {
        full_name: p.full_name, email: p.email, suspended: p.suspended,
        suspension_type: p.suspension_type, suspension_reason: p.suspension_reason, suspended_until: p.suspended_until,
      }));
      return m;
    },
  });

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("enrollments")
      .update({ status, approved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Enrollment ${status}.`); qc.invalidateQueries({ queryKey: ["admin-enrollments"] }); }
  };


  const toggleSuspend = async (studentId: string, next: boolean) => {
    const { error } = await supabase.from("profiles").update({ suspended: next }).eq("id", studentId);
    if (error) { toast.error(error.message); return; }
    toast.success(next ? "Student suspended." : "Student reinstated.");
    qc.invalidateQueries({ queryKey: ["enrollment-profiles", studentIds] });
  };


  const years = useMemo(() => Array.from(new Set((data ?? []).map((e) => e.enrollment_year))).sort((a, b) => b - a), [data]);

  const filtered = (data ?? []).filter((e) =>
    (yearFilter === "all" || e.enrollment_year === Number(yearFilter)) &&
    (statusFilter === "all" || e.status === statusFilter),
  );

  const byYear = filtered.reduce<Record<number, typeof filtered>>((acc, e) => {
    (acc[e.enrollment_year] ??= []).push(e);
    return acc;
  }, {});
  const sortedYears = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  if (isLoading) return <div className="text-navy/50 text-sm">Loading…</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <Label className="text-xs uppercase tracking-widest text-navy/60">Year</Label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="rounded-none w-40 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-widest text-navy/60">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-none w-44 mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedYears.length === 0 && (
        <div className="bg-white border border-navy/10 p-8 text-center text-navy/50 text-sm">No enrollments match these filters.</div>
      )}

      {sortedYears.map((year) => (
        <section key={year}>
          <div className="flex items-baseline gap-3 mb-4 border-b border-navy/10 pb-2">
            <h2 className="font-serif text-2xl text-navy-deep">{year}</h2>
            <span className="text-xs text-navy/50 uppercase tracking-widest">{byYear[year].length} enrolment{byYear[year].length === 1 ? "" : "s"}</span>
          </div>
          <div className="bg-white border border-navy/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy/5 text-[11px] uppercase tracking-widest text-navy/70">
                <tr>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Course</th>
                  <th className="text-left p-4">Submitted</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {byYear[year].map((e) => {
                  const p = profiles?.get(e.student_id);
                  const c = e.course as { title: string } | null;
                  return (
                    <tr key={e.id} className="border-t border-navy/10">
                      <td className="p-4">
                        <div className="text-navy-deep flex items-center gap-2">
                          {p?.full_name ?? "—"}
                          {p?.suspended && <span className="text-[10px] uppercase tracking-widest bg-red-100 text-red-700 px-2 py-0.5">Suspended</span>}
                        </div>
                        <div className="text-xs text-navy/50">{p?.email ?? ""}</div>
                      </td>
                      <td className="p-4 text-navy/80">{c?.title ?? "—"}</td>
                      <td className="p-4 text-xs text-navy/60">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-xs capitalize">{e.status}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        {e.status === "pending" ? (
                          <>
                            <Button size="sm" className="rounded-none bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] mr-2" onClick={() => updateStatus(e.id, "approved")}>
                              <Check size={14} className="mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-none border-destructive text-destructive text-[11px]" onClick={() => updateStatus(e.id, "rejected")}>
                              <X size={14} className="mr-1" /> Reject
                            </Button>
                          </>
                        ) : e.status === "approved" ? (
                          <Button
                            size="sm"
                            variant={p?.suspended ? "outline" : "destructive"}
                            className="rounded-none text-[11px] uppercase tracking-widest"
                            onClick={() => toggleSuspend(e.student_id, !p?.suspended)}
                          >
                            {p?.suspended ? "Unsuspend" : "Suspend"}
                          </Button>
                        ) : (
                          <span className="text-xs text-navy/40">—</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
