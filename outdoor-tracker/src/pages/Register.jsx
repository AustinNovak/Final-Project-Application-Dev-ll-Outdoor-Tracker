// Register.jsx
// Registration form with full validation, password strength check, CSRF protection.
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generateCsrfToken, validateCsrfToken } from "../services/authService";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    setCsrfToken(generateCsrfToken());
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate("/trips", { replace: true });
  }, [isAuthenticated]);

  // Password strength indicator
  function passwordStrength(pw) {
    if (!pw) return { label: "", level: 0 };
    let score = 0;
    if (pw.length >= 8)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    return { label: labels[score] || "Weak", level: score };
  }

  function validate() {
    if (!name.trim())    return "Name is required.";
    if (name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!email.trim())   return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (!password)       return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateCsrfToken(csrfToken)) {
      setError("Security validation failed. Please refresh and try again.");
      return;
    }

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate("/trips", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const strength = passwordStrength(password);
  const strengthColors = ["", "#f87171", "#fb923c", "#facc15", "#4ade80"];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🌲</span>
          <h2>Create Account</h2>
          <p>Start your outdoor journal today</p>
        </div>

        <input type="hidden" value={csrfToken} readOnly />

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {password && (
              <div className="strength-bar-wrap">
                <div
                  className="strength-bar"
                  style={{
                    width: `${(strength.level / 4) * 100}%`,
                    background: strengthColors[strength.level],
                  }}
                />
                <span className="strength-label" style={{ color: strengthColors[strength.level] }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            {confirm && confirm !== password && (
              <p className="field-error">Passwords don't match</p>
            )}
            {confirm && confirm === password && (
              <p className="field-ok">✓ Passwords match</p>
            )}
          </div>

          {error && (
            <div className="auth-error" role="alert">
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
