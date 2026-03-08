// Home.jsx
import { Link } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";
import TripCard from "../components/TripCard";
import heroImg from "../assets/hero.jpg";

const TYPE_META = {
  fishing: { icon: "🎣", label: "Fishing" },
  hunting: { icon: "🦌", label: "Hunting" },
  hiking:  { icon: "🥾", label: "Hiking" },
  camping: { icon: "⛺", label: "Camping" },
  other:   { icon: "🌲", label: "Other" },
};

// Reusable stat pill row
function StatRow({ trips }) {
  const typeCounts = trips.reduce((acc, t) => {
    if (t.tripType) acc[t.tripType] = (acc[t.tripType] || 0) + 1;
    return acc;
  }, {});
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const uniqueLocations = new Set(trips.map((t) => t.location)).size;

  return (
    <div className="stats-inner">
      <div className="stat-item">
        <span className="stat-num">{trips.length}</span>
        <span className="stat-label">Total Trips</span>
      </div>
      {typeEntries.map(([type, count]) => (
        <div className="stat-item" key={type}>
          <span className="stat-num">{TYPE_META[type]?.icon} {count}</span>
          <span className="stat-label">{TYPE_META[type]?.label || type}</span>
        </div>
      ))}
      <div className="stat-item">
        <span className="stat-num">{uniqueLocations}</span>
        <span className="stat-label">Unique Locations</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { myTrips, publicTrips, trips } = useTrip();
  const { isAuthenticated, user } = useAuth();

  // All public trips = community stats
  // myTrips = personal stats (logged in only)

  const myRecent = myTrips.slice(0, 3);
  const communityRecent = publicTrips
    .filter((t) => t.userId !== user?.id)
    .slice(0, 6);

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero">
        <img src={heroImg} alt="Outdoor adventure" className="hero-bg" />
        <div className="hero-overlay">
          <span className="hero-eyebrow">🌲 Your Outdoor Journal</span>
          {isAuthenticated
            ? <h2>Welcome back,<br />{user?.name || "Explorer"}.</h2>
            : <h2>Track Every<br />Adventure.</h2>
          }
          <p>
            Log fishing trips, hunting spots, hikes, and camps — with
            automatic weather snapshots and map pins for every location.
          </p>
          <div className="hero-cta-row">
            {isAuthenticated ? (
              <>
                <Link to="/log" className="hero-btn">Log a Trip</Link>
                <Link to="/trips" className="hero-btn-ghost">View Journal →</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="hero-btn">Get Started — Free</Link>
                <Link to="/login" className="hero-btn-ghost">Sign In →</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── DUAL STATS BAR ── */}
      {/* Always shows community stats. When logged in, also shows personal stats. */}
      {(publicTrips.length > 0 || isAuthenticated) && (
        <section className="dual-stats-bar">

          {/* Community stats — always visible */}
          <div className="dual-stats-panel community-panel">
            <p className="dual-stats-heading">
              <span className="dual-stats-icon">🌐</span> Community
            </p>
            {publicTrips.length > 0
              ? <StatRow trips={publicTrips} />
              : <p className="dual-stats-empty">No public trips yet — be the first!</p>
            }
          </div>

          {/* Personal stats — logged in only */}
          {isAuthenticated && (
            <div className="dual-stats-panel personal-panel">
              <p className="dual-stats-heading">
                <span className="dual-stats-icon">👤</span> Your Stats
              </p>
              {myTrips.length > 0
                ? <StatRow trips={myTrips} />
                : <p className="dual-stats-empty">
                    Log your first trip to see your stats.{" "}
                    <Link to="/log">Log one now →</Link>
                  </p>
              }
            </div>
          )}

        </section>
      )}

      {/* ── YOUR RECENT TRIPS (logged in only) ── */}
      {isAuthenticated && myRecent.length > 0 && (
        <section className="recent-section">
          <div className="recent-inner">
            <div className="recent-header">
              <h3>Your Recent Trips</h3>
              <Link to="/trips" className="see-all">See all →</Link>
            </div>
            <div className="trip-grid">
              {myRecent.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── LOGGED-IN EMPTY STATE ── */}
      {isAuthenticated && myTrips.length === 0 && (
        <section className="home-empty">
          <div className="home-empty-inner">
            <p className="home-empty-icon">🗺️</p>
            <h3>Start Your Outdoor Journal</h3>
            <p>Log your first trip and get automatic weather data, map pins, and notes.</p>
            <Link to="/log" className="btn-accent" style={{ marginTop: "1.5rem", display: "inline-block" }}>
              Log Your First Trip
            </Link>
          </div>
        </section>
      )}

      {/* ── COMMUNITY RECENT PUBLIC TRIPS ── */}
      {(isAuthenticated ? communityRecent : publicTrips.slice(0, 6)).length > 0 && (
        <section className="recent-section community-section">
          <div className="recent-inner">
            <div className="recent-header">
              <h3>Recent from the Community</h3>
              <Link to="/explore" className="see-all">Explore all →</Link>
            </div>
            <div className="trip-grid">
              {(isAuthenticated ? communityRecent : publicTrips.slice(0, 6))
                .map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURE CARDS (logged out only) ── */}
      {!isAuthenticated && (
        <section className="features-section">
          <div className="features-inner">
            <h3 className="features-title">Everything in one place</h3>
            <div className="features-grid">
              {[
                { icon: "📍", title: "Location Autocomplete", desc: "Search any lake, trail, or park with instant suggestions." },
                { icon: "⛅", title: "Auto Weather Snapshots", desc: "Weather conditions are captured automatically when you log a trip." },
                { icon: "🗺️", title: "Interactive Maps", desc: "Every trip is pinned on a map so you never forget a spot." },
                { icon: "📓", title: "Trip Journal", desc: "Record what you caught, saw, or did — public or private." },
              ].map((f) => (
                <div key={f.title} className="feature-card">
                  <span className="feature-icon">{f.icon}</span>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link to="/register" className="btn-accent" style={{ fontSize: "0.95rem", padding: "0.8rem 2rem" }}>
                Start Your Free Journal →
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
