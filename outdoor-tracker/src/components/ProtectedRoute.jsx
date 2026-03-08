// ProtectedRoute.jsx
// Wraps routes that require authentication.
// Redirects unauthenticated users to /login, remembering where they wanted to go.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Don't redirect while we're still restoring the session from storage
  if (loading) {
    return (
      <div className="page">
        <p style={{ color: "var(--text-dim)", textAlign: "center" }}>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Pass current location so login can redirect back after success
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
