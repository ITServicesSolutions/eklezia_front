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
import VerseOfDay from './pages/VerseOfDay';
import Motivations from './pages/Motivations';
import WeeklyEmission from './pages/WeeklyEmission';
import SalvationPage from './pages/SalvationPage';
import SalvationCalls from './pages/SalvationCalls';
import LivePage from './pages/LivePage';
import DonsPage from './pages/DonsPage';
import PublicHome from './pages/PublicHome';
import PastorPage from './pages/PastorPage';
import VersetsPage from './pages/VersetsPage';

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
    {/* Redirection racine → accueil public */}
    <Route path="/" element={<Navigate to="/home" replace />} />

    {/* Pages publiques (sans connexion) */}
    <Route path="/home" element={<PublicHome />} />
    <Route path="/contact" element={<PastorPage />} />
    <Route path="/versets" element={<VersetsPage />} />
    <Route path="/appel-au-salut" element={<SalvationPage />} />
    <Route path="/direct"         element={<LivePage />} />
    <Route path="/dons"           element={<DonsPage />} />

    {/* Auth */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* Pages admin (connexion requise) */}
    <Route element={<PrivateRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
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
        <Route path="/verse-of-day" element={<VerseOfDay />} />
        <Route path="/motivations" element={<Motivations />} />
        <Route path="/salvation-calls" element={<SalvationCalls />} />
        <Route path="/weekly-emission" element={<WeeklyEmission />} />
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
