import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { LogIn, ChevronRight, Menu, X, Heart } from 'lucide-react';
import logo from '../assets/images/logo_eglise.jpeg';

const B = '#1a3a8a';
const G = '#c9a227';

const NAV: { label: string; href?: string; to?: string; scrollTop?: boolean; live?: boolean }[] = [
  { to: '/home',              label: 'Accueil',          scrollTop: true },
  { to: '/direct',            label: 'Direct',           live: true },
  { href: '/home#emission',   label: 'Émission' },
  { href: '/home#actualites', label: 'Actualités' },
  { to: '/dons',              label: 'Dons' },
  { to: '/contact',           label: 'Pasteur & Contact' },
];

const PublicNavbar: React.FC = () => {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLive, setIsLive]     = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  // Vérifie si un live est actif (toutes les 30s)
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://eklezia.api.it-servicegroup.com';
    const check = () =>
      fetch(`${baseUrl}/api/v1/livestreams/`)
        .then(r => r.json())
        .then(d => setIsLive(Array.isArray(d) && d.some((s: any) => s.is_live)))
        .catch(() => {});
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  const isAuth = !!localStorage.getItem('ekklesia-token');
  const role   = localStorage.getItem('ekklesia-role') || 'user';
  const dest   = ['admin', 'moderator'].includes(role) ? '/dashboard' : '/home';

  useEffect(() => {
    if (location.pathname !== '/home') { setScrolled(true); return; }
    return scrollY.on('change', v => setScrolled(v > 50));
  }, [scrollY, location.pathname]);

  const cls = 'px-3 py-1.5 text-sm text-white/75 hover:text-white font-medium rounded-lg hover:bg-white/10 transition-all';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? B : 'transparent',
        boxShadow: scrolled ? '0 4px 20px rgba(26,58,138,.3)' : 'none',
      }}>
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Link to="/home">
          <img src={logo} alt="EEAD" className="w-8 h-8 rounded-full object-cover border-2 border-white/30" />
        </Link>
        <Link to="/home" className="flex-1 min-w-0 no-underline">
          <p className="text-white font-black text-sm leading-tight">EEAD-TU</p>
          <p className="text-white/50 text-[9px] hidden sm:block">Temple Universitaire · Cotonou</p>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV.map(n => n.to
            ? <Link key={n.to} to={n.to}
                onClick={() => n.scrollTop && window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={cls + ' relative'}
                style={{ color: location.pathname === n.to ? 'white' : undefined,
                         background: location.pathname === n.to ? 'rgba(255,255,255,.15)' : undefined }}>
                {n.live && isLive
                  ? <span className="flex items-center gap-1">
                      <motion.span className="w-1.5 h-1.5 rounded-full bg-red-500"
                        animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                      {n.label}
                    </span>
                  : n.label}
              </Link>
            : <a key={n.href} href={n.href} className={cls}>{n.label}</a>
          )}
        </nav>

        {/* Bouton Donner ma vie */}
        <Link to="/appel-au-salut"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff' }}>
          <Heart size={11} fill="white" /> Donner ma vie
        </Link>

        <Link to={isAuth ? dest : '/login'}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105"
          style={{ background: G, color: B }}>
          {isAuth ? <><ChevronRight size={12} />Dashboard</> : <><LogIn size={12} />Connexion</>}
        </Link>

        <button onClick={() => setOpen(v => !v)} className="md:hidden text-white">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="md:hidden px-4 pb-4 flex flex-col gap-1" style={{ background: B }}>
            {NAV.map(n => n.to
              ? <Link key={n.to} to={n.to}
                  onClick={() => { setOpen(false); if (n.scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10">{n.label}</Link>
              : <a key={n.href} href={n.href} onClick={() => setOpen(false)}
                  className="px-3 py-2.5 text-sm text-white/80 rounded-lg hover:bg-white/10">{n.label}</a>
            )}
            <Link to="/appel-au-salut" onClick={() => setOpen(false)}
              className="mt-2 px-4 py-2.5 rounded-full text-sm font-bold text-center flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff' }}>
              <Heart size={14} fill="white" /> Donner ma vie à Jésus
            </Link>
            <Link to={isAuth ? dest : '/login'} onClick={() => setOpen(false)}
              className="mt-1 px-4 py-2.5 rounded-full text-sm font-bold text-center"
              style={{ background: G, color: B }}>
              {isAuth ? 'Dashboard' : 'Connexion'}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PublicNavbar;
