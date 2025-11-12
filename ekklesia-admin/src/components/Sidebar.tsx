import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, Clapperboard, Film, HandHeart, Radio } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/users', icon: <Users size={20} />, label: 'Users' },
    // { to: '/payments', icon: <DollarSign size={20} />, label: 'Payments' },
    { to: '/programs', icon: <Calendar size={20} />, label: 'Programs' },
    { to: '/events', icon: <Clapperboard size={20} />, label: 'Events' },
    { to: '/medias', icon: <Film size={20} />, label: 'Medias' },
    { to: '/contributions', icon: <HandHeart size={20} />, label: 'Contributions' },
    { to: '/livestreams', icon: <Radio size={20} />, label: 'Live Streams' },
  ];

  return (
    <aside className="w-64 h-full bg-white shadow-md dark:bg-gray-800">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ekklesia</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
