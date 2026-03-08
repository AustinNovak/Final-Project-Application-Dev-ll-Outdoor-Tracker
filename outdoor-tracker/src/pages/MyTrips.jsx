// MyTrips.jsx — Shows only the current user's own trips, with filter + search
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import TripCard from "../components/TripCard";

const FILTERS = [
  { value: "all",      label: "All" },
  { value: "fishing",  label: "🎣 Fishing" },
  { value: "hunting",  label: "🦌 Hunting" },
  { value: "hiking",   label: "🥾 Hiking" },
  { value: "camping",  label: "⛺ Camping" },
  { value: "other",    label: "🌲 Other" },
];

const VISIBILITY = [
  { value: "all",      label: "All" },
  { value: "personal", label: "🔒 Personal" },
  { value: "public",   label: "🌐 Public" },
];

export default function MyTrips() {
  // myTrips = only trips owned by the logged-in user
  const { myTrips } = useTrip();
  const [typeFilter,       setTypeFilter]       = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [search,           setSearch]           = useState("");

  const filtered = myTrips.filter((t) => {
    const matchType = typeFilter === "all" || t.tripType === typeFilter;
    const matchVis  =
      visibilityFilter === "all" ||
      (visibilityFilter === "public"   &&  t.isPublic) ||
      (visibilityFilter === "personal" && !t.isPublic);
    const matchSearch =
      !search ||
      t.location?.toLowerCase().includes(search.toLowerCase()) ||
      t.species?.toLowerCase().includes(search.toLowerCase()) ||
      t.notes?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchVis && matchSearch;
  });

  return (
    <div className="trips-page">
      <div className="trips-header">
        <div>
          <h2>My Trips</h2>
          <p className="trips-subtitle">
            {myTrips.length} trip{myTrips.length !== 1 ? "s" : ""} in your journal
          </p>
        </div>
        <Link to="/log" className="btn-accent">+ Log Trip</Link>
      </div>

      {/* Filters + Search */}
      <div className="trips-toolbar">
        <div className="filter-rows">
          {/* Type filter */}
          <div className="filter-pills">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-pill ${typeFilter === f.value ? "active" : ""}`}
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {/* Visibility filter */}
          <div className="filter-pills">
            {VISIBILITY.map((v) => (
              <button
                key={v.value}
                className={`filter-pill ${visibilityFilter === v.value ? "active" : ""}`}
                onClick={() => setVisibilityFilter(v.value)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search trips…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {myTrips.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🌲</p>
          <p>Your journal is empty.</p>
          <p className="empty-sub">Log your first outdoor trip to get started.</p>
          <Link to="/log" className="btn-accent" style={{ marginTop: "1.25rem", display: "inline-block" }}>
            Log Your First Trip
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🔍</p>
          <p>No trips match your filters.</p>
        </div>
      ) : (
        <div className="trip-grid">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
