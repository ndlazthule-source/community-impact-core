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
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/idw/auth")({
  head: () => ({
    meta: [
      { title: "IDW Marketplace — Buyer Sign in" },
      { name: "description", content: "Sign in or create an IDW Marketplace buyer account to shop ethically made African goods." },
    ],
  }),
  beforeLoad: async () => {
    const pending = typeof window !== "undefined" ? sessionStorage.getItem("idw_pending_add_product") : null;
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);
      const isBuyer = (roles ?? []).some((r) => r.role === "buyer");

      // Add-to-cart must always enter the buyer flow. Existing buyers continue to cart;
      // non-buyer sessions are cleared so the dedicated buyer sign-in/sign-up page is shown.
      if (pending) {
        if (isBuyer) throw redirect({ to: "/cart" });
        await supabase.auth.signOut();
        return;
      }

      if (isBuyer) throw redirect({ to: "/idw/dashboard" });
      throw redirect({ to: "/dashboard" });
    }
  },
  component: IDWAuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6).max(72),
});

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(80),
  lastName: z.string().trim().min(1, "Last name required").max(80),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters").max(72),
});

function IDWAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Ensure buyer role
        await supabase.from("user_roles").insert({ user_id: session.user.id, role: "buyer" }).then(() => null, () => null);
        const returnTo = sessionStorage.getItem("idw_post_auth_return_to");
        const pending = sessionStorage.getItem("idw_pending_add_product");
        if (pending || returnTo === "/cart") {
          navigate({ to: "/cart" });
        } else {
          navigate({ to: "/idw/dashboard" });
        }
      }
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back to IDW Market.");
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/idw/auth`,
        data: {
          full_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
          role: "buyer",
        },
      },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }
    // Seed buyer_profiles + role (defense-in-depth — handle_new_user uses role from metadata)
    if (data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: "buyer" }).then(() => null, () => null);
      await supabase.from("buyer_profiles").insert({
        user_id: data.user.id,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      }).then(() => null, () => null);
    }
    setLoading(false);
    toast.success("Welcome to IDW Market.");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/idw/auth`,
    });
    if (result.error) { setLoading(false); toast.error(result.error.message ?? "Google sign-in failed"); }
  };

  const handleForgot = async () => {
    const email = window.prompt("Enter your buyer account email:");
    if (!email) return;
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) { toast.error("Invalid email."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Check your inbox for the reset link.");
  };

  return (
    <SiteShell>
      <section className="container-page py-16 md:py-24">
        <div className="max-w-md mx-auto bg-white border border-navy/10 shadow-card rounded-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 grid place-items-center rounded-full bg-blue-pill mx-auto mb-4">
              <ShoppingBag size={22} className="text-blue" />
            </div>
            <span className="tag-pill mb-3">IDW Marketplace</span>
            <h1 className="font-serif text-3xl text-navy-deep mt-4">
              {mode === "signin" ? "Buyer Sign In" : "Create Buyer Account"}
            </h1>
            <p className="text-sm text-mute mt-2">
              {mode === "signin" ? "Access your orders, cart, and saved details." : "Shop ethically made African goods."}
            </p>
          </div>

          <div className="grid grid-cols-2 mb-6 rounded-full bg-blue-pill p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`py-2 rounded-full transition-colors ${mode === "signin" ? "bg-white text-navy shadow-sm font-semibold" : "text-mute"}`}
            >Sign In</button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`py-2 rounded-full transition-colors ${mode === "signup" ? "bg-white text-navy shadow-sm font-semibold" : "text-mute"}`}
            >Sign Up</button>
          </div>

          <Button
            type="button" variant="outline" disabled={loading} onClick={handleGoogle}
            className="w-full rounded-full border-navy/20 py-6 mb-6 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-navy/10" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-white px-3 text-mute">or</span></div>
          </div>

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" name="email" type="email" required className="rounded-md mt-1" />
              </div>
              <div>
                <Label htmlFor="si-password">Password</Label>
                <Input id="si-password" name="password" type="password" required className="rounded-md mt-1" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue hover:bg-navy text-white rounded-full py-6 text-sm font-semibold">
                {loading ? "Signing in…" : "Sign in to IDW"}
              </Button>
              <button type="button" onClick={handleForgot} className="block w-full text-center text-xs text-mute hover:text-blue underline-offset-4 hover:underline">
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="su-first">First name</Label>
                  <Input id="su-first" name="firstName" required className="rounded-md mt-1" />
                </div>
                <div>
                  <Label htmlFor="su-last">Last name</Label>
                  <Input id="su-last" name="lastName" required className="rounded-md mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" name="email" type="email" required className="rounded-md mt-1" />
              </div>
              <div>
                <Label htmlFor="su-password">Password</Label>
                <Input id="su-password" name="password" type="password" required minLength={6} className="rounded-md mt-1" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue hover:bg-navy text-white rounded-full py-6 text-sm font-semibold">
                {loading ? "Creating account…" : "Create buyer account"}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-mute mt-6">
            Looking for the student or donor portal?{" "}
            <Link to="/auth" className="text-blue font-semibold hover:underline">Go to main sign in</Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
