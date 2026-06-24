import { Link } from "@tanstack/react-router";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-deep text-white/80 mt-24">
      <div className="container-page py-20 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2 space-y-4">
          <div className="font-serif text-2xl font-bold text-white">
            IMPACT<span className="text-blue-soft">.</span>
          </div>
          <p className="text-sm leading-relaxed text-white/60 max-w-sm">
            A South African social impact collective dedicated to unlocking human potential
            through education, design, and child welfare.
          </p>
          <address className="not-italic text-xs text-white/40 pt-4 leading-relaxed">
            42 Melville Road, Johannesburg, South Africa
            <span className="block">+27 11 000 0000 · info@impactgroup.co.za</span>
          </address>
        </div>
        <div>
          <h4 className="eyebrow text-blue-soft mb-5">Divisions</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/icda" className="hover:text-blue-soft">ICDA Academy</Link></li>
            <li><Link to="/idw" className="hover:text-blue-soft">IDW Marketplace</Link></li>
            <li><Link to="/inqaba" className="hover:text-blue-soft">INQABA Programme</Link></li>
            <li><Link to="/events" className="hover:text-blue-soft">Events</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-blue-soft mb-5">Company</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-blue-soft">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-blue-soft">Contact</Link></li>
            <li><Link to="/auth" className="hover:text-blue-soft">Sign In</Link></li>
            <li><Link to="/idw/auth" className="hover:text-blue-soft">IDW Buyer Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6 flex flex-col md:flex-row justify-between gap-3 text-[11px] uppercase tracking-widest text-white/40">
          <span>© {year} IMPACT Group of Companies</span>
          <span>Designed for South Africa</span>
        </div>
      </div>
    </footer>
  );
}
