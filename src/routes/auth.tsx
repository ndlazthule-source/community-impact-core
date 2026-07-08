import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — IMPACT Group" },
      { name: "description", content: "Sign in to enrol in ICDA courses, manage your sponsorships, or shop the IDW marketplace." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
      const isBuyer = (r ?? []).some((x) => x.role === "buyer") && !(r ?? []).some((x) => x.role === "administrator");
      throw redirect({ to: isBuyer ? "/idw/dashboard" : "/dashboard" });
    }
  },
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");


  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back.");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result.error) {
      setLoading(false);
      toast.error(result.error.message ?? "Google sign-in failed");
    }
  };

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = z.string().trim().email().safeParse(forgotEmail);
    if (!parsed.success) {
      toast.error("Please enter a valid email.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Check your inbox for the reset link.");
      setShowForgot(false);
      setForgotEmail("");
    }
  };


  return (
    <SiteShell>
      <section className="container-page py-16 md:py-24">
        <div className="max-w-md mx-auto bg-white border border-navy/10 shadow-card p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-navy-deep">Welcome back</h1>
            <p className="text-sm text-navy/60 mt-2">Sign in to your IMPACT account.</p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleGoogle}
            className="w-full rounded-none border-navy/20 py-6 mb-6 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-navy/10" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white px-3 text-navy/40">or</span></div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="si-email">Email</Label>
              <Input id="si-email" name="email" type="email" required className="rounded-none mt-1" />
            </div>
            <div>
              <Label htmlFor="si-password">Password</Label>
              <Input id="si-password" name="password" type="password" required className="rounded-none mt-1" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy-deep text-cream rounded-none py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            <button
              type="button"
              onClick={() => setShowForgot((v) => !v)}
              className="block w-full text-center text-xs text-navy/60 hover:text-gold underline-offset-4 hover:underline"
            >
              Forgot password?
            </button>
          </form>

          {showForgot && (
            <form onSubmit={handleForgot} className="mt-4 border-t border-navy/10 pt-4 space-y-3">
              <Label htmlFor="fp-email" className="text-xs uppercase tracking-widest text-navy/60">Reset your password</Label>
              <Input
                id="fp-email"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-none"
              />
              <Button type="submit" disabled={loading} variant="outline" className="w-full rounded-none border-navy/20 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          )}


          <p className="text-center text-xs text-navy/60 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-navy font-bold underline-offset-4 hover:underline hover:text-gold">
              Get started
            </Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
