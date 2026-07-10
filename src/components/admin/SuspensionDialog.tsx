import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SuspensionSubject = {
  id: string;
  name: string | null;
  suspended: boolean | null;
  suspension_type: string | null;
  suspension_reason: string | null;
  suspended_until: string | null;
};

export function SuspensionDialog({
  subject,
  open,
  onOpenChange,
  onDone,
}: {
  subject: SuspensionSubject;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
}) {
  const [type, setType] = useState<"temporary" | "permanent">(
    (subject.suspension_type as "temporary" | "permanent") ?? "temporary",
  );
  const [reason, setReason] = useState<string>(subject.suspension_reason ?? "");
  const [until, setUntil] = useState<string>(subject.suspended_until?.slice(0, 10) ?? "");
  const [saving, setSaving] = useState(false);

  const applySuspension = async () => {
    if (!reason.trim()) { toast.error("A reason is required."); return; }
    if (type === "temporary" && !until) { toast.error("Pick an end date for a temporary suspension."); return; }
    setSaving(true);
    const untilIso = type === "temporary" ? new Date(until + "T23:59:59").toISOString() : null;
    const { error } = await supabase
      .from("profiles")
      .update({
        suspended: true,
        suspension_type: type,
        suspension_reason: reason.trim(),
        suspended_at: new Date().toISOString(),
        suspended_until: untilIso,
      })
      .eq("id", subject.id);
    if (error) { setSaving(false); toast.error(error.message); return; }

    // In-app notification for the student
    await supabase.from("notifications").insert({
      user_id: subject.id,
      title: type === "permanent" ? "Your account has been suspended" : "Your account has been temporarily suspended",
      body: `Reason: ${reason.trim()}${type === "temporary" && untilIso ? ` — Suspension ends ${new Date(untilIso).toLocaleDateString()}.` : " — This suspension is permanent until lifted by an administrator."}`,
      link: "/dashboard",
    });

    setSaving(false);
    toast.success("Suspension applied. The student has been notified.");
    onDone();
  };

  const lift = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ suspended: false, suspension_type: null, suspension_reason: null, suspended_at: null, suspended_until: null })
      .eq("id", subject.id);
    if (error) { setSaving(false); toast.error(error.message); return; }
    await supabase.from("notifications").insert({
      user_id: subject.id,
      title: "Your suspension has been lifted",
      body: "Your account has been reinstated. You can now access all features again.",
      link: "/dashboard",
    });
    setSaving(false);
    toast.success("Suspension lifted. The student has been notified.");
    onDone();
  };

  const isActive = !!subject.suspended;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-navy-deep">
            {isActive ? "Modify suspension" : "Suspend account"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-navy/70">
            {subject.name ?? "This user"}
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-navy/60">Suspension type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "temporary" | "permanent")}>
              <SelectTrigger className="rounded-none mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="temporary">Temporary (auto-lifts on end date)</SelectItem>
                <SelectItem value="permanent">Permanent (until admin lifts it)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === "temporary" && (
            <div>
              <Label className="text-xs uppercase tracking-widest text-navy/60">Suspension ends on</Label>
              <Input type="date" value={until} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setUntil(e.target.value)} className="rounded-none mt-1" />
            </div>
          )}
          <div>
            <Label className="text-xs uppercase tracking-widest text-navy/60">Reason (visible to student)</Label>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-none mt-1" placeholder="e.g. Repeated violation of community guidelines" />
          </div>
        </div>
        <DialogFooter className="flex flex-wrap gap-2">
          {isActive && (
            <Button variant="outline" onClick={lift} disabled={saving} className="rounded-none border-emerald-600 text-emerald-700 hover:bg-emerald-50">
              Lift suspension
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-none">Cancel</Button>
          <Button onClick={applySuspension} disabled={saving} className="bg-navy hover:bg-navy-deep text-white rounded-none">
            {saving ? "Saving…" : isActive ? "Update suspension" : "Suspend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
