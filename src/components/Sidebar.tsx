import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.jpeg';
import {
  Calendar, Clapperboard, Film, HandHeart,
  Settings2, Tags, UserCircle, Users, Video, X, LayoutDashboard, Radio,
} from 'lucide-react';
import { getUsersMe } from '../api/users';

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/',              icon: <LayoutDashboard size={18} />, label: 'Dashboard'          },
  { to: '/users',         icon: <Users size={18} />,           label: 'Utilisateurs'       },
  { to: '/programs',      icon: <Calendar size={18} />,        label: 'Programmes'         },
  { to: '/program-types', icon: <Tags size={18} />,            label: 'Types de programme' },
  { to: '/events',        icon: <Clapperboard size={18} />,    label: 'Événements'         },
  { to: '/medias',        icon: <Film size={18} />,            label: 'Médias'             },
  { to: '/contributions', icon: <HandHeart size={18} />,       label: 'Contributions'      },
  { to: '/livestreams',   icon: <Radio size={18} />,           label: 'Direct'             },
  { to: '/videos',        icon: <Video size={18} />,           label: 'Vidéos'             },
  { to: '/platforms',     icon: <Settings2 size={18} />,       label: 'Plateformes'        },
  { to: '/profile',       icon: <UserCircle size={18} />,      label: 'Profil'             },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const NavMenu: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const location = useLocation();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    getUsersMe()
      .then(user => setUserName(user?.name || user?.email || ''))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Logo + identité */}
      <div className="flex items-center gap-3 px-5 py-6 flex-shrink-0">
        <div
          className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff' }}
        >
          <img src={logo} alt="Logo EEAD-TU" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-neo-text truncate leading-tight">EEAD-TU</p>
          <p className="text-xs text-neo-text-secondary truncate">
            {userName || 'Administration'}
          </p>
        </div>
      </div>

      {/* Séparateur */}
      <div className="mx-5 mb-3 h-px" style={{ background: 'linear-gradient(90deg, #c5ccd4, transparent)' }} />

      {/* Label section */}
      <p className="px-5 mb-2 text-[10px] font-bold uppercase tracking-widest text-neo-text-secondary">
        Menu
      </p>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
        {NAV_ITEMS.map(item => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
                      color: '#ffffff',
                      boxShadow: '4px 4px 10px #c5ccd4, -2px -2px 6px #ffffff',
                    }
                  : {
                      color: '#718096',
                    }
              }
            >
              <span
                className="flex-shrink-0 transition-colors duration-200"
                style={{ color: isActive ? '#ffffff' : '#a0aec0' }}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 flex-shrink-0">
        <p className="text-[10px] text-neo-text-secondary text-center opacity-60">
          © {new Date().getFullYear()} EEAD-TU
        </p>
      </div>
    </>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  return (
    <>
      {/* ── Desktop : sidebar verticale gauche ── */}
      <aside
        className="hidden lg:flex lg:flex-col lg:flex-shrink-0 lg:w-64 lg:h-screen relative z-10"
        style={{
          background: '#e8ecef',
          boxShadow: '6px 0 24px rgba(197, 204, 212, 0.6), 2px 0 0 #ffffff inset',
        }}
      >
        <NavMenu />
      </aside>

      {/* ── Mobile : drawer depuis la gauche ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <aside
            className="absolute inset-y-0 left-0 w-72 flex flex-col z-10"
            style={{
              background: '#e8ecef',
              boxShadow: '8px 0 32px #b0b8c4',
            }}
          >
            {/* Bouton fermer */}
            <div className="flex justify-end px-4 pt-4 flex-shrink-0">
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{ boxShadow: '4px 4px 8px #c5ccd4, -4px -4px 8px #ffffff' }}
              >
                <X size={18} className="text-neo-text-secondary" />
              </button>
            </div>
            <NavMenu onLinkClick={onClose} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
