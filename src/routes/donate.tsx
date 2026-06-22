import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — IMPACT Group" },
      { name: "description", content: "Make a one-time or recurring donation to IMPACT Group. No account required. Donate anonymously or share your details for a receipt." },
    ],
  }),
  component: DonatePage,
});

const presetAmounts = [100, 250, 500, 1000, 2500];

const donateSchema = z.object({
  amount: z.number().positive("Enter an amount").max(1_000_000),
  donor_name: z.string().trim().max(120).optional().nullable(),
  donor_email: z.string().trim().email("Invalid email").max(255).optional().nullable(),
  message: z.string().trim().max(500).optional().nullable(),
  is_recurring: z.boolean().default(false),
  anonymous: z.boolean().default(false),
});

function DonatePage() {
  const [amount, setAmount] = useState<number>(500);
  const [anonymous, setAnonymous] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = donateSchema.safeParse({
      amount,
      donor_name: anonymous ? null : (fd.get("donor_name") as string) || null,
      donor_email: anonymous ? null : (fd.get("donor_email") as string) || null,
      message: (fd.get("message") as string) || null,
      is_recurring: recurring,
      anonymous,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    if (!anonymous && !parsed.data.donor_email) {
      toast.error("Please enter your email, or tick 'Donate anonymously'.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("donations").insert({
      amount: parsed.data.amount,
      currency: "ZAR",
      donor_id: null,
      donor_name: parsed.data.donor_name,
      donor_email: parsed.data.donor_email,
      message: parsed.data.message,
      is_recurring: parsed.data.is_recurring,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    (e.currentTarget as HTMLFormElement).reset();
    setAmount(500);
    setAnonymous(false);
    setRecurring(false);
    toast.success("Thank you — your donation has been recorded. We'll be in touch with payment details.");
  };

  return (
    <SiteShell>
      <section className="bg-cream">
        <div className="container-page py-20 md:py-24 max-w-5xl">
          <span className="eyebrow text-clay">Donate</span>
          <h1 className="font-serif text-5xl md:text-6xl text-navy-deep mt-4 leading-tight">
            Give to <em className="italic text-clay font-normal">change a life</em>.
          </h1>
          <p className="mt-6 text-lg text-navy/70 max-w-2xl leading-relaxed">
            No account required. Donate as a guest or share your details to receive a tax certificate.
            You can also choose to remain anonymous.
          </p>
        </div>
      </section>

      <section className="bg-white border-t border-navy/10">
        <div className="container-page py-16 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-10 bg-cream/40 border border-navy/10 p-8 md:p-12">
            <div>
              <Label className="eyebrow text-clay">Choose an amount (ZAR)</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                {presetAmounts.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`py-4 border text-sm font-bold tracking-wide transition-colors ${
                      amount === a
                        ? "bg-navy text-cream border-navy"
                        : "bg-white border-navy/20 text-navy hover:border-gold hover:text-gold"
                    }`}
                  >
                    R{a}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="custom-amount" className="text-xs text-navy/60">Or enter a custom amount</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="rounded-none mt-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="anon" checked={anonymous} onCheckedChange={(c) => setAnonymous(!!c)} />
              <Label htmlFor="anon" className="text-sm text-navy cursor-pointer">
                Donate anonymously (skip my name &amp; email)
              </Label>
            </div>

            {!anonymous && (
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="donor_name">Full name</Label>
                  <Input id="donor_name" name="donor_name" required={!anonymous} className="rounded-none mt-2" />
                </div>
                <div>
                  <Label htmlFor="donor_email">Email (for receipt)</Label>
                  <Input id="donor_email" name="donor_email" type="email" required={!anonymous} className="rounded-none mt-2" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea id="message" name="message" rows={4} className="rounded-none mt-2" placeholder="Share why you're giving, or dedicate this gift." />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="rec" checked={recurring} onCheckedChange={(c) => setRecurring(!!c)} />
              <Label htmlFor="rec" className="text-sm text-navy cursor-pointer">Make this a monthly recurring gift</Label>
            </div>

            <Button
              type="submit"
              disabled={loading || amount <= 0}
              className="w-full bg-gold hover:bg-gold-soft text-navy-deep rounded-none py-7 text-[11px] font-bold uppercase tracking-[0.25em]"
            >
              {loading ? "Submitting…" : `Donate R${amount}${recurring ? " / month" : ""}`}
            </Button>
            <p className="text-xs text-navy/50 text-center">
              Your donation is recorded immediately. A team member will follow up with secure payment instructions.
            </p>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
