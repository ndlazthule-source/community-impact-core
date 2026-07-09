import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, GraduationCap, HeartHandshake, ShieldCheck, User as UserIcon, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

import { useAuth, primaryRole, dashboardPath, type AppRole } from "@/hooks/use-auth";
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
  { to: "/donate", label: "Donate" },
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
  buyer: [
    { to: "/idw", label: "Marketplace" },
    { to: "/events", label: "Events" },
    { to: "/idw/dashboard", label: "My Account" },
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
  buyer: "IDW Buyer",
  administrator: "Administrator",
};

const roleIcon: Record<AppRole, typeof GraduationCap> = {
  student: GraduationCap,
  donor: HeartHandshake,
  buyer: ShoppingBag,
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
  const dash = role ? dashboardPath(role) : "/dashboard";
  const showCart = role === "student" || role === "donor" || role === "buyer";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/" });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-navy/10 shadow-soft"
          : "bg-white border-b border-navy/5"
      }`}
    >
      <div className="container-page flex items-center justify-between py-4">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-navy">
          IMPACT GroupNet
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium uppercase tracking-[0.12em]">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-mute hover:text-blue transition-colors"
              activeProps={{ className: "text-blue" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {isAuthed && showCart && (
            <Link to="/cart" aria-label="Cart" className="relative p-2 text-navy hover:text-blue">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue text-white text-[10px] font-bold rounded-full w-4 h-4 grid place-items-center">{cartCount}</span>
              )}
            </Link>
          )}
          {isAuthed && role ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-navy hover:text-blue gap-2">
                  <RoleIcon size={16} />
                  <span className="text-sm">{name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-navy-deep">{name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-blue font-normal">{roleLabel[role]}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={dash}><LayoutDashboard size={14} className="mr-2" /> Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-navy">
                  <LogOut size={14} className="mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="text-navy hover:text-blue">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          {!isAuthed && (
            <Button asChild className="bg-blue hover:bg-navy text-white rounded-full px-6 text-[11px] font-bold uppercase tracking-[0.18em]">
              <Link to="/register">Get Started</Link>
            </Button>
          )}
          {isAuthed && role !== "administrator" && (
            <Button asChild className="bg-blue hover:bg-navy text-white rounded-full px-6 text-[11px] font-bold uppercase tracking-[0.18em]">
              <Link to="/donate">{role === "donor" ? "Give" : "Donate"}</Link>
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
        <div className="lg:hidden border-t border-navy/10 bg-white">
          <div className="container-page py-6 flex flex-col gap-4 text-sm">
            {isAuthed && role && (
              <div className="flex items-center gap-2 pb-3 border-b border-navy/10">
                <RoleIcon size={16} className="text-blue" />
                <div className="flex flex-col">
                  <span className="text-navy-deep font-medium">{name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-blue">{roleLabel[role]}</span>
                </div>
              </div>
            )}
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-mute hover:text-blue py-1"
                activeProps={{ className: "text-blue" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-4 border-t border-navy/10">
              {isAuthed ? (
                <>
                  <Button variant="outline" onClick={handleSignOut} className="flex-1 border-navy text-navy rounded-full">
                    <LogOut size={14} className="mr-2" /> Sign out
                  </Button>
                  {role !== "administrator" && (
                    <Button asChild className="flex-1 bg-blue text-white rounded-full">
                      <Link to="/donate">{role === "donor" ? "Give" : "Donate"}</Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="flex-1 border-navy text-navy rounded-full">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button asChild className="flex-1 bg-blue text-white rounded-full">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
