import React from 'react';
import { Navigate } from 'react-router-dom';

// This component takes two props: 
// 1. user (the current logged-in user state from Firebase)
// 2. children (the admin component you are trying to protect)
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // If there is no user logged in, redirect them to the home page (or login page)
    return <Navigate to="/" replace />;
  }

  // If the user IS logged in, render the protected component
  return children;
};

export default ProtectedRoute;