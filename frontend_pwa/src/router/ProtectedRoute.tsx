// src/router/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../modules/auth/contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: Array<'client' | 'admin'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    // You might want to redirect to a generic login or a specific one based on context
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect if user role is not allowed for this route
    // For example, redirect to a generic home page or an unauthorized page
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Render the child route component if authenticated and authorized
};

export default ProtectedRoute;

