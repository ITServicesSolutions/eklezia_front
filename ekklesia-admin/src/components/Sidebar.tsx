import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.jpeg';
import {
  Calendar,
  ChevronRight,
  Clapperboard,
  Film,
  HandHeart,
  Home,
  MoreHorizontal,
  Radio,
  Settings,
  Users,
  X,
} from 'lucide-react';

type NavItem = {
  to: string;
  label: string;
  roles: string[];
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: <Home size={18} />, label: 'Dashboard', roles: ['admin', 'moderator'] },
  { to: '/users', icon: <Users size={18} />, label: 'Users', roles: ['admin'] },
  { to: '/programs', icon: <Calendar size={18} />, label: 'Programs', roles: ['admin', 'moderator'] },
  { to: '/program-types', icon: <Calendar size={18} />, label: 'Program Types', roles: ['admin', 'moderator'] },
  { to: '/events', icon: <Clapperboard size={18} />, label: 'Events', roles: ['admin', 'moderator'] },
  { to: '/medias', icon: <Film size={18} />, label: 'Medias', roles: ['admin', 'moderator'] },
  { to: '/contributions', icon: <HandHeart size={18} />, label: 'Contributions', roles: ['admin'] },
  { to: '/videos', icon: <Radio size={18} />, label: 'Live Streams', roles: ['admin', 'moderator'] },
  { to: '/platforms', icon: <Settings size={18} />, label: 'Configuration Video', roles: ['admin'] },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDesktopOverflowOpen, setIsDesktopOverflowOpen] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem('ekklesia-token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const baseURL =
          import.meta.env.VITE_API_BASE_URL ??
          import.meta.env.VITE_API_URL;

        if (!baseURL) {
          throw new Error('Missing VITE_API_BASE_URL (or VITE_API_URL) for backend requests.');
        }

        const res = await fetch(`${baseURL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const user = await res.json();
          setUserRole(user.role.name);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  useEffect(() => {
    onClose();
    setIsDesktopOverflowOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDesktopOverflowOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-desktop-overflow-menu]')) {
        setIsDesktopOverflowOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const filteredNavItems = useMemo(
    () => (userRole ? NAV_ITEMS.filter((item) => item.roles.includes(userRole)) : []),
    [userRole]
  );

  const { primaryNavItems, overflowNavItems } = useMemo(() => {
    const overflowPaths = ['/medias', '/contributions', '/videos', '/platforms'];
    const primary = filteredNavItems.filter((item) => !overflowPaths.includes(item.to));
    const overflow = filteredNavItems.filter((item) => overflowPaths.includes(item.to));

    return {
      primaryNavItems: primary,
      overflowNavItems: overflow,
    };
  }, [filteredNavItems]);

  const linkClasses = (isActive: boolean, compact = false) =>
    [
      'group flex items-center justify-between rounded-2xl border transition-all duration-200',
      compact ? 'shrink-0 whitespace-nowrap' : '',
      compact ? 'px-3 py-2.5 text-sm' : 'px-4 py-3.5 text-sm',
      isActive
        ? 'border-blue-500/40 bg-blue-500/15 text-white shadow-lg'
        : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white',
    ].join(' ');

  const renderNavLinks = (compact = false, items = filteredNavItems) => {
    if (loading) {
      return (
        <div className={compact ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className={`animate-pulse rounded-2xl bg-slate-700/70 ${compact ? 'h-10' : 'h-12'}`}
            />
          ))}
        </div>
      );
    }

    return items.map((item) => {
      const isActive = location.pathname === item.to;

      return (
        <NavLink key={item.to} to={item.to} className={linkClasses(isActive, compact)}>
          <div className="flex min-w-0 items-center gap-3">
            <span className={`${isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className="truncate font-medium">{item.label}</span>
          </div>
          {isActive && <ChevronRight size={16} className="shrink-0 text-blue-300" />}
        </NavLink>
      );
    });
  };

  return (
    <>
      <div className="hidden border-b border-slate-200 bg-slate-950/95 shadow-lg backdrop-blur lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2">
            <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/20 bg-white shadow-md">
              <img src={logo} alt="Logo EEAD-TU" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Navigation</p>
              <p className="truncate text-xs text-slate-400">Acces rapide a l'administration</p>
            </div>
          </div>

          <nav className="flex min-w-0 flex-1 items-center gap-2 overflow-visible pb-1">
            <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden">
              {renderNavLinks(true, primaryNavItems)}
            </div>

            {!loading && overflowNavItems.length > 0 && (
              <div className="relative shrink-0" data-desktop-overflow-menu>
                <button
                  type="button"
                  onClick={() => setIsDesktopOverflowOpen((prev) => !prev)}
                  className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-3 py-2.5 text-sm transition-all duration-200 ${
                    overflowNavItems.some((item) => location.pathname === item.to)
                      ? 'border-blue-500/40 bg-blue-500/15 text-white shadow-lg'
                      : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  aria-expanded={isDesktopOverflowOpen}
                  aria-label="Plus de menus"
                >
                  <MoreHorizontal size={18} className="shrink-0" />
                  <span className="font-medium">Plus</span>
                </button>

                {isDesktopOverflowOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl backdrop-blur">
                    <div className="space-y-2">{renderNavLinks(false, overflowNavItems)}</div>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-[70] bg-slate-950/65 backdrop-blur-sm" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 z-[80] flex w-[min(88vw,22rem)] flex-col border-r border-slate-700 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-white/20 bg-white shadow-lg">
                  <img src={logo} alt="Logo EEAD-TU" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">EEAD-TU</p>
                  <p className="truncate text-sm text-slate-400">Menu principal</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                aria-label="Fermer le menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-2">{renderNavLinks()}</div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
