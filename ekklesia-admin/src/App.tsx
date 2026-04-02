import React, { useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './routes/PrivateRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Programs from './pages/Programs';
import ProgramTypes from './pages/programTypes';
import Events from './pages/Events';
import Medias from './pages/Medias';
import Contributions from './pages/Contributions';
import Videos from './pages/Videos';
import PlatformsSettings from './pages/PlatformsSettings';
import Profile from './pages/Profile';


const AdminLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const handleToggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);
  const handleCloseMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="flex min-h-screen flex-col">
        <Navbar onToggleMenu={handleToggleMobileNav} />
        <Sidebar mobileOpen={mobileNavOpen} onClose={handleCloseMobileNav} />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route element={<PrivateRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/program-types" element={<ProgramTypes />} />
        <Route path="/events" element={<Events />} />
        <Route path="/medias" element={<Medias />} />
        <Route path="/contributions" element={<Contributions />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/platforms" element={<PlatformsSettings />} />
      </Route>
    </Route>
  </Routes>
);

const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
