// Header.jsx — Sticky nav, auth-aware, mobile hamburger
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🌲</span> Outdoor Tracker
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Home
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Explore
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/log" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Log Trip
              </NavLink>
              <NavLink to="/trips" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                My Trips
              </NavLink>
            </>
          )}
          <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            About
          </NavLink>

          {isAuthenticated ? (
            <div className="nav-user">
              <span className="nav-username">👤 {user?.name || user?.email}</span>
              <button className="nav-logout" onClick={handleLogout}>Sign Out</button>
            </div>
          ) : (
            <div className="nav-auth">
              <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                Sign In
              </NavLink>
              <Link to="/register" className="nav-register">Get Started</Link>
            </div>
          )}
        </nav>

        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
          <span className="ham-bar" />
          <span className="ham-bar" />
          <span className="ham-bar" />
        </button>
      </div>

      {open && (
        <nav className="mobile-nav">
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/explore" onClick={() => setOpen(false)}>Explore</NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/log" onClick={() => setOpen(false)}>Log Trip</NavLink>
              <NavLink to="/trips" onClick={() => setOpen(false)}>My Trips</NavLink>
            </>
          )}
          <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
          {isAuthenticated ? (
            <button className="mobile-logout" onClick={handleLogout}>Sign Out</button>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Sign In</NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}>Get Started</NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
