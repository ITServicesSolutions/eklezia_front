import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute: React.FC = () => {
  // This is a basic check. In a real app, you'd also want to verify the token's validity.
  const isAuthenticated = !!localStorage.getItem('ekklesia-token');

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
