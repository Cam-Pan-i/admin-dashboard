import { ShoppingCart, Home, Info, Users, Flame, History, Mail, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const navLinks = [
  { href: '/main', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: ShoppingCart },
];

export const PublicNavbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-black/85 backdrop-blur-xl border-b border-border flex items-center justify-between px-7 z-50">
      <Link to="/main" className="flex items-center gap-2.5 font-bold text-base tracking-tight">
        <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <ShoppingCart size={16} className="text-white" />
        </div>
        <span>Bob's Market</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide transition-all",
              location.pathname === link.href
                ? "text-white bg-white/10"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <a
        href="https://discord.gg/McCU2nPegT"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-1.5 bg-white text-black rounded-md text-xs font-bold uppercase tracking-wide hover:bg-white/90 transition-all shadow-[0_4px_16px_rgba(255,255,255,0.1)]"
      >
        Join Server
      </a>
    </nav>
  );
};
