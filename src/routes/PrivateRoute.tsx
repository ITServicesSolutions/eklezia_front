import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute: React.FC = () => {
  const token = localStorage.getItem('ekklesia-token');
  const role  = localStorage.getItem('ekklesia-role') || 'user';
  const isAdmin = ['admin', 'moderator'].includes(role);

  if (!token)   return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/home"  replace />;
  return <Outlet />;
};

export default PrivateRoute;
