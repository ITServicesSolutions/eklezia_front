import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-gray-800">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
      </div>
      <div>
        {/* User profile, theme switcher, etc. can go here */}
      </div>
    </header>
  );
};

export default Navbar;
