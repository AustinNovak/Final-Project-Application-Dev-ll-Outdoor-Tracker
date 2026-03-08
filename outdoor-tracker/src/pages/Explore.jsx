// Explore.jsx — Public feed of all trips marked isPublic.
// Visible to anyone, including unauthenticated users.
import { useState } from "react";
import { useTrip } from "../context/TripContext";
import TripCard from "../components/TripCard";

const FILTERS = [
  { value: "all",     label: "All" },
  { value: "fishing", label: "🎣 Fishing" },
  { value: "hunting", label: "🦌 Hunting" },
  { value: "hiking",  label: "🥾 Hiking" },
  { value: "camping", label: "⛺ Camping" },
  { value: "other",   label: "🌲 Other" },
];

export default function Explore() {
  const { publicTrips } = useTrip();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = publicTrips.filter((t) => {
    const matchType = filter === "all" || t.tripType === filter;
    const matchSearch =
      !search ||
      t.location?.toLowerCase().includes(search.toLowerCase()) ||
      t.species?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="trips-page">
      <div className="trips-header">
        <div>
          <h2>Explore</h2>
          <p className="trips-subtitle">
            Public trips shared by the community
          </p>
        </div>
      </div>

      <div className="trips-toolbar">
        <div className="filter-pills">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-pill ${filter === f.value ? "active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search by location or species…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {publicTrips.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🌐</p>
          <p>No public trips yet.</p>
          <p className="empty-sub">
            Log a trip and set it to Public to share it here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🔍</p>
          <p>No trips match your search.</p>
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
