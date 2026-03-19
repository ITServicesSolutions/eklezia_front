import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.jpeg';
import { 
  Home, 
  Users, 
  Calendar, 
  Clapperboard, 
  Film, 
  HandHeart, 
  Radio,
  ChevronRight,
  Settings
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem('ekklesia-token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:8000/api/v1/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          setUserRole(user.role.name); // 'moderator', 'admin', etc.
        } else {
          console.error('Erreur lors de la récupération du rôle');
        }
      } catch (e) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard', roles: ['admin', 'moderator'] },
    { to: '/users', icon: <Users size={20} />, label: 'Users', roles: ['admin'] },
    { to: '/programs', icon: <Calendar size={20} />, label: 'Programs', roles: ['admin', 'moderator'] },
    {to: '/program-types', icon: <Calendar size={20} />, label: 'Program Types', roles: ['admin', 'moderator'] },
    { to: '/events', icon: <Clapperboard size={20} />, label: 'Events', roles: ['admin', 'moderator'] },
    { to: '/medias', icon: <Film size={20} />, label: 'Medias', roles: ['admin', 'moderator'] },
    { to: '/contributions', icon: <HandHeart size={20} />, label: 'Contributions', roles: ['admin'] },
    { to: '/videos', icon: <Radio size={20} />, label: 'Live Streams', roles: ['admin', 'moderator'] },
    { to: '/platforms', icon: <Settings size={20} />, label: 'Configuration Vidéo', roles: ['admin'] },
  ];

  // Filtrer les éléments accessibles selon le rôle
  const filteredNavItems = userRole
    ? navItems.filter(item => item.roles.includes(userRole))
    : []; // Si pas de rôle (non connecté), on n'affiche rien

  // Affichage d'un squelette pendant le chargement
  if (loading) {
    return (
      <aside className="w-80 h-full bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl border-r border-gray-700">
        <div className="p-9">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 bg-white shadow-md">
              <img src={logo} alt="logo" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
        <nav className="p-4 mt-2">
          <ul className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i} className="h-10 bg-gray-700 animate-pulse rounded-xl"></li>
            ))}
          </ul>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-80 h-full bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl border-r border-gray-700">
      <div className="p-9">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 bg-white shadow-md">
            <img 
              src={logo} 
              alt="logo de l'église" 
              className="h-full w-full object-cover" 
            />
          </div>
        </div>
      </div>

      <nav className="p-4 mt-2">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-500/20 text-white border-l-4 border-blue-500 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-750 hover:text-white hover:translate-x-1'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      transition-colors duration-200
                      ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}
                    `}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  {isActive && (
                    <ChevronRight 
                      size={16} 
                      className="text-blue-400 animate-pulse" 
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;