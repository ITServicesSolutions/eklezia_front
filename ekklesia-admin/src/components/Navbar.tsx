import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.jpeg';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('ekklesia-token');
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-gray-800">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 bg-white">
          <img src={logo} alt="logo de l'église" className="h-full w-full object-cover" />
        </div>
      </div>
      <div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
