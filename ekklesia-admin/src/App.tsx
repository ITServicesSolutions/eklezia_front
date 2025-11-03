import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './routes/PrivateRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Programs from './pages/Programs';
import Events from './pages/Events';
import Medias from './pages/Medias';
import Contributions from './pages/Contributions';
import LiveStreams from './pages/LiveStreams';

const AdminLayout: React.FC = () => (
  <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
    <Sidebar />
    <div className="flex flex-col flex-1">
      <Navbar />
      <main className="h-full p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<PrivateRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/medias" element={<Medias />} />
        <Route path="/contributions" element={<Contributions />} />
        <Route path="/livestreams" element={<LiveStreams />} />
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
