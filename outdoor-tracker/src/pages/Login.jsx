// Login.jsx
// Login form with validation, error feedback, and CSRF protection.
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateCsrfToken, validateCsrfToken } from "../services/authService";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/trips";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  // Generate CSRF token on mount
  useEffect(() => {
    setCsrfToken(generateCsrfToken());
  }, []);

  // If already logged in, redirect away
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  // Client-side validation
  function validate() {
    if (!email.trim())    return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (!password)        return "Password is required.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // CSRF check
    if (!validateCsrfToken(csrfToken)) {
      setError("Security validation failed. Please refresh and try again.");
      return;
    }

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🌲</span>
          <h2>Welcome Back</h2>
          <p>Sign in to your outdoor journal</p>
        </div>

        {/* Hidden CSRF token — included in form context */}
        <input type="hidden" value={csrfToken} readOnly />

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
