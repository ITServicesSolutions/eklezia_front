import React, { useState, useCallback } from 'react';
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
import LiveStreams from './pages/LiveStreams';
import Videos from './pages/Videos';
import PlatformsSettings from './pages/PlatformsSettings';
import Profile from './pages/Profile';

const AdminLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const handleToggleMobileNav = useCallback(() => setMobileNavOpen(prev => !prev), []);
  const handleCloseMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="flex h-screen bg-neo-bg overflow-hidden">
      <Sidebar mobileOpen={mobileNavOpen} onClose={handleCloseMobileNav} />
      <div className="flex flex-col flex-1 min-w-0 relative" style={{ boxShadow: 'inset 3px 0 12px rgba(197, 204, 212, 0.4)' }}>
        <Navbar onToggleMenu={handleToggleMobileNav} />
        <main className="flex-1 overflow-y-auto bg-neo-bg">
          <Outlet />
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
        <Route path="/livestreams" element={<LiveStreams />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/platforms" element={<PlatformsSettings />} />
      </Route>
    </Route>
  </Routes>
);

const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
