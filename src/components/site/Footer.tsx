import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-cream/80 mt-24">
      <div className="container-page py-20 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2 space-y-4">
          <div className="font-serif text-2xl font-bold text-cream">
            IMPACT<span className="text-gold">.</span>
          </div>
          <p className="text-sm leading-relaxed text-cream/60 max-w-sm">
            A South African social impact collective dedicated to unlocking human potential
            through education, design, and child welfare.
          </p>
          <p className="text-xs text-cream/40 pt-4">
            42 Melville Road, Johannesburg, South Africa<br />
            +27 11 000 0000 · info@impactgroup.co.za
          </p>
        </div>
        <div>
          <h4 className="eyebrow text-gold mb-5">Divisions</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/icda" className="hover:text-gold">ICDA Academy</Link></li>
            <li><Link to="/idw" className="hover:text-gold">IDW Marketplace</Link></li>
            <li><Link to="/inqaba" className="hover:text-gold">INQABA Programme</Link></li>
            <li><Link to="/events" className="hover:text-gold">Event History</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-gold mb-5">Company</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/auth" className="hover:text-gold">Sign In</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page py-6 flex flex-col md:flex-row justify-between gap-3 text-[11px] uppercase tracking-widest text-cream/40">
          <span>© {new Date().getFullYear()} IMPACT Group of Companies</span>
          <span>Designed for South Africa</span>
        </div>
      </div>
    </footer>
  );
}
