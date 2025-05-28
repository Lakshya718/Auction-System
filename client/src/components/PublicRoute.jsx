import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);

  if (user) {
    // If logged in, redirect to profile page
    return <Navigate to="/profile" replace />;
  }

  // Not logged in, render children components
  return children;
};

export default PublicRoute;
