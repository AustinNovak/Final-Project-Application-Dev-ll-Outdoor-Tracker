// AuthContext.jsx
// Global authentication state — provides user info, login, logout, register
// to any component in the tree without prop drilling.
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  getToken,
  decodeToken,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { id, name, email }
  const [loading, setLoading] = useState(true);   // true while restoring session

  // On mount: check if there's a valid token still in sessionStorage
  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = decodeToken(token);
      if (payload) {
        // Restore lightweight user object from token payload
        setUser({ id: payload.sub, email: payload.email });
      }
    }
    setLoading(false);
  }, []);

  /** Log in and update global user state. Throws on bad credentials. */
  async function login(credentials) {
    const { user: u } = loginUser(credentials);
    setUser(u);
    return u;
  }

  /** Register and immediately log in. Throws if email already taken. */
  async function register(data) {
    const { user: u } = registerUser(data);
    setUser(u);
    return u;
  }

  /** Log out — clear token and reset state. */
  function logout() {
    logoutUser();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, register, isAuthenticated: !!user }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
