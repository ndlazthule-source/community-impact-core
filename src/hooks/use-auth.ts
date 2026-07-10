import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "administrator" | "student" | "donor" | "buyer";

export interface Suspension {
  type: "temporary" | "permanent";
  reason: string | null;
  suspendedAt: string | null;
  suspendedUntil: string | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  suspension: Suspension | null;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [suspension, setSuspension] = useState<Suspension | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadRoles = async (userId: string) => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("suspended, suspension_type, suspension_reason, suspended_at, suspended_until")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;

      let active = !!prof?.suspended;
      // Auto-lift expired temporary suspensions
      if (active && prof?.suspension_type === "temporary" && prof.suspended_until && new Date(prof.suspended_until) <= new Date()) {
        await supabase
          .from("profiles")
          .update({ suspended: false, suspension_type: null, suspension_reason: null, suspended_at: null, suspended_until: null })
          .eq("id", userId);
        active = false;
      }

      if (active) {
        setSuspension({
          type: (prof?.suspension_type as "temporary" | "permanent") ?? "permanent",
          reason: prof?.suspension_reason ?? null,
          suspendedAt: prof?.suspended_at ?? null,
          suspendedUntil: prof?.suspended_until ?? null,
        });
      } else {
        setSuspension(null);
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (cancelled) return;
      setRoles((data ?? []).map((r) => r.role as AppRole));
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setLoading(true);
        setRoles([]);
        setSuspension(null);
        setTimeout(() => { if (!cancelled) loadRoles(s.user.id); }, 0);
      } else {
        setRoles([]);
        setSuspension(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadRoles(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, session, roles, loading, suspension };
}

export function primaryRole(roles: AppRole[]): AppRole {
  if (roles.includes("administrator")) return "administrator";
  if (roles.includes("buyer")) return "buyer";
  if (roles.includes("donor")) return "donor";
  return "student";
}

export function dashboardPath(role: AppRole): "/idw/dashboard" | "/dashboard" {
  return role === "buyer" ? "/idw/dashboard" : "/dashboard";
}
