import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "administrator" | "student" | "donor" | "buyer";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadRoles = async (userId: string) => {
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
        // Defer to avoid deadlocks inside the auth callback
        setTimeout(() => {
          if (!cancelled) loadRoles(s.user.id);
        }, 0);
      } else {
        setRoles([]);
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

  return { user, session, roles, loading };
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
