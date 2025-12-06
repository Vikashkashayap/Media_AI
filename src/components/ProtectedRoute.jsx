import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export default function ProtectedRoute({ children }) {
  // Check if user is authenticated by checking for auth token in localStorage
  // Since the backend uses httpOnly cookies, we need to store a flag in localStorage
  // after successful login/signup
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
}

