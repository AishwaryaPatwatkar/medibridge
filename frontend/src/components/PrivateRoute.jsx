import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-50">
        <div className="flex flex-col items-center">
          <Loader size="lg" text="Verifying session..." />
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated, preserving history state
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
