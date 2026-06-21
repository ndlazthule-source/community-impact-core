import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/about", label: "About" },
  { to: "/icda", label: "ICDA Academy" },
  { to: "/idw", label: "IDW Marketplace" },
  { to: "/inqaba", label: "INQABA" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

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
          {!loading && user ? (
            <Button asChild variant="ghost" className="text-navy hover:text-gold">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" className="text-navy hover:text-gold">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button asChild className="bg-navy hover:bg-navy-deep text-cream rounded-none px-6 text-[11px] font-bold uppercase tracking-[0.18em]">
            <Link to="/inqaba">Donate</Link>
          </Button>
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
              <Button asChild variant="outline" className="flex-1 border-navy text-navy rounded-none">
                <Link to={user ? "/dashboard" : "/auth"}>{user ? "Dashboard" : "Sign in"}</Link>
              </Button>
              <Button asChild className="flex-1 bg-navy text-cream rounded-none">
                <Link to="/inqaba">Donate</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
