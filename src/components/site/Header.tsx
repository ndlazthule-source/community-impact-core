import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, GraduationCap, HeartHandshake, ShieldCheck, User as UserIcon, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

import { useAuth, primaryRole, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const publicNav = [
  { to: "/about", label: "About" },
  { to: "/icda", label: "ICDA Academy" },
  { to: "/idw", label: "IDW Marketplace" },
  { to: "/inqaba", label: "INQABA" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

const roleNav: Record<AppRole, { to: string; label: string }[]> = {
  student: [
    { to: "/icda", label: "Courses" },
    { to: "/events", label: "Events" },
    { to: "/dashboard", label: "My Learning" },
  ],
  donor: [
    { to: "/inqaba", label: "Sponsor" },
    { to: "/idw", label: "Marketplace" },
    { to: "/events", label: "Events" },
    { to: "/dashboard", label: "My Giving" },
  ],
  administrator: [
    { to: "/icda", label: "Courses" },
    { to: "/idw", label: "Marketplace" },
    { to: "/inqaba", label: "INQABA" },
    { to: "/events", label: "Events" },
    { to: "/dashboard", label: "Admin" },
  ],
};

const roleLabel: Record<AppRole, string> = {
  student: "Student",
  donor: "Donor",
  administrator: "Administrator",
};

const roleIcon: Record<AppRole, typeof GraduationCap> = {
  student: GraduationCap,
  donor: HeartHandshake,
  administrator: ShieldCheck,
};

export function Header() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count: cartCount } = useCart();


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isAuthed = !loading && !!user;
  const role = isAuthed ? primaryRole(roles) : null;
  const nav = role ? roleNav[role] : publicNav;
  const RoleIcon = role ? roleIcon[role] : UserIcon;
  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Account";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/" });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md border-b border-navy/10 shadow-soft"
          : "bg-cream border-b border-navy/5"
      }`}
    >
      <div className="container-page flex items-center justify-between py-5">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-navy">
          IMPACT<span className="text-gold">.</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium uppercase tracking-[0.15em]">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-navy/80 hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthed && role ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-navy hover:text-gold gap-2">
                  <RoleIcon size={16} />
                  <span className="text-sm">{name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-none">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-navy-deep">{name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-clay font-normal">{roleLabel[role]}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard"><LayoutDashboard size={14} className="mr-2" /> Dashboard</Link>
                </DropdownMenuItem>
                {role === "student" && (
                  <DropdownMenuItem asChild>
                    <Link to="/icda"><GraduationCap size={14} className="mr-2" /> Browse courses</Link>
                  </DropdownMenuItem>
                )}
                {role === "donor" && (
                  <DropdownMenuItem asChild>
                    <Link to="/inqaba"><HeartHandshake size={14} className="mr-2" /> Sponsor a child</Link>
                  </DropdownMenuItem>
                )}
                {role === "administrator" && (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><ShieldCheck size={14} className="mr-2" /> Admin tools</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-navy">
                  <LogOut size={14} className="mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="text-navy hover:text-gold">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          {role !== "administrator" && (
            <Button asChild className="bg-navy hover:bg-navy-deep text-cream rounded-none px-6 text-[11px] font-bold uppercase tracking-[0.18em]">
              <Link to="/inqaba">{role === "donor" ? "Give" : "Donate"}</Link>
            </Button>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="lg:hidden text-navy"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-navy/10 bg-cream">
          <div className="container-page py-6 flex flex-col gap-4 text-sm">
            {isAuthed && role && (
              <div className="flex items-center gap-2 pb-3 border-b border-navy/10">
                <RoleIcon size={16} className="text-clay" />
                <div className="flex flex-col">
                  <span className="text-navy-deep font-medium">{name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-clay">{roleLabel[role]}</span>
                </div>
              </div>
            )}
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-navy/80 hover:text-gold py-1"
                activeProps={{ className: "text-gold" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t border-navy/10">
              {isAuthed ? (
                <Button variant="outline" onClick={handleSignOut} className="flex-1 border-navy text-navy rounded-none">
                  <LogOut size={14} className="mr-2" /> Sign out
                </Button>
              ) : (
                <Button asChild variant="outline" className="flex-1 border-navy text-navy rounded-none">
                  <Link to="/auth">Sign in</Link>
                </Button>
              )}
              {role !== "administrator" && (
                <Button asChild className="flex-1 bg-navy text-cream rounded-none">
                  <Link to="/inqaba">{role === "donor" ? "Give" : "Donate"}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
