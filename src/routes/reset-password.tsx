import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — IMPACT Group" },
      { name: "description", content: "Set a new password for your IMPACT account." },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z.object({
  password: z.string().min(8, "Use at least 8 characters").max(72),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-exchanges the recovery token from the URL hash
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      password: form.get("password"),
      confirm: form.get("confirm"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. Welcome back.");
    navigate({ to: "/dashboard" });
  };

  return (
    <SiteShell>
      <section className="container-page py-16 md:py-24">
        <div className="max-w-md mx-auto bg-white border border-navy/10 shadow-card p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-navy-deep">Reset password</h1>
            <p className="text-sm text-navy/60 mt-2">
              {ready ? "Choose a new password for your account." : "Verifying your reset link…"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="rp-password">New password</Label>
              <Input id="rp-password" name="password" type="password" required minLength={8} disabled={!ready} className="rounded-none mt-1" />
            </div>
            <div>
              <Label htmlFor="rp-confirm">Confirm password</Label>
              <Input id="rp-confirm" name="confirm" type="password" required minLength={8} disabled={!ready} className="rounded-none mt-1" />
            </div>
            <Button
              type="submit"
              disabled={loading || !ready}
              className="w-full bg-navy hover:bg-navy-deep text-cream rounded-none py-6 text-[11px] font-bold uppercase tracking-[0.2em]"
            >
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
