import React from 'react';
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
  ChevronRight
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/programs', icon: <Calendar size={20} />, label: 'Programs' },
    { to: '/events', icon: <Clapperboard size={20} />, label: 'Events' },
    { to: '/medias', icon: <Film size={20} />, label: 'Medias' },
    { to: '/contributions', icon: <HandHeart size={20} />, label: 'Contributions' },
    { to: '/livestreams', icon: <Radio size={20} />, label: 'Live Streams' },
  ];

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

      {/* Navigation */}
      <nav className="p-4 mt-2">
        <ul className="space-y-2">
          {navItems.map((item) => {
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