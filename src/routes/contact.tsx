import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — IMPACT Group" },
      { name: "description", content: "Get in touch with IMPACT Group of Companies. Johannesburg head office, donor enquiries, partnership opportunities." },
      { property: "og:title", content: "Contact — IMPACT Group" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  return (
    <SiteShell>
      <section className="container-page py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <span className="eyebrow text-clay">Contact</span>
            <h1 className="font-serif text-5xl md:text-6xl text-navy-deep mt-4 leading-[0.95]">
              Let's talk about <em className="italic text-clay font-normal">impact</em>.
            </h1>
            <p className="mt-8 text-lg text-navy/75 leading-relaxed">
              Whether you represent a foundation, government agency, corporate partner, or you're
              an individual donor — we'd love to hear from you.
            </p>

            <div className="mt-12 space-y-6">
              <ContactRow icon={MapPin} title="Head Office" body="42 Melville Road, Johannesburg, 2092, South Africa" />
              <ContactRow icon={Phone} title="Telephone" body="+27 11 000 0000" />
              <ContactRow icon={Mail} title="Email" body="info@impactgroup.co.za" />
            </div>
          </div>

          <form
            className="bg-white border border-navy/10 p-8 shadow-soft space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              setSending(true);
              setTimeout(() => {
                setSending(false);
                toast.success("Message received. We'll be in touch within 2 business days.");
                (e.target as HTMLFormElement).reset();
              }, 600);
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" required maxLength={50} className="rounded-none mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" required maxLength={50} className="rounded-none mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={255} className="rounded-none mt-1" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required maxLength={120} className="rounded-none mt-1" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required maxLength={1000} rows={6} className="rounded-none mt-1" />
            </div>
            <Button type="submit" disabled={sending} className="w-full bg-navy hover:bg-navy-deep text-cream rounded-none py-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}

function ContactRow({ icon: Icon, title, body }: { icon: typeof Mail; title: string; body: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 flex-shrink-0 bg-gold/20 grid place-items-center text-navy-deep">
        <Icon size={18} />
      </div>
      <div>
        <div className="eyebrow text-clay mb-1">{title}</div>
        <div className="text-navy-deep">{body}</div>
      </div>
    </div>
  );
}
