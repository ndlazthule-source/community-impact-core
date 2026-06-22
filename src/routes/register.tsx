import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Get Started — Create your IMPACT account" },
      { name: "description", content: "Create your free IMPACT account to enrol in ICDA courses, sponsor a child, or shop the IDW marketplace." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: RegisterPage,
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      fullName: form.get("fullName"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: parsed.data.fullName },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created — welcome to IMPACT.");
  };

  return (
    <SiteShell>
      <section className="container-page py-16 md:py-24">
        <div className="max-w-md mx-auto bg-white border border-navy/10 shadow-card p-8 md:p-10">
          <div className="text-center mb-8">
            <span className="eyebrow text-clay">Get Started</span>
            <h1 className="font-serif text-3xl text-navy-deep mt-3">Create your account</h1>
            <p className="text-sm text-navy/60 mt-2">Free to join. Takes under a minute.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="su-name">Full name</Label>
              <Input id="su-name" name="fullName" required className="rounded-none mt-1" />
            </div>
            <div>
              <Label htmlFor="su-email">Email</Label>
              <Input id="su-email" name="email" type="email" required className="rounded-none mt-1" />
            </div>
            <div>
              <Label htmlFor="su-password">Password</Label>
              <Input id="su-password" name="password" type="password" required minLength={6} className="rounded-none mt-1" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold-soft text-navy-deep rounded-none py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-xs text-navy/60 mt-6">
            Already have an account?{" "}
            <Link to="/auth" className="text-navy font-bold underline-offset-4 hover:underline hover:text-gold">Sign in</Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
