// TripDetails.jsx — Full trip view. Personal trips are only visible to their owner.
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { useAuth } from "../context/AuthContext";

const TYPE_META = {
  fishing: { icon: "🎣", label: "Fishing" },
  hunting: { icon: "🦌", label: "Hunting" },
  hiking:  { icon: "🥾", label: "Hiking" },
  camping: { icon: "⛺", label: "Camping" },
  other:   { icon: "🌲", label: "Other" },
};

const WMO_EMOJI = {
  0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",
  51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"⛈️",
  71:"🌨️",73:"❄️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",
  95:"⛈️",96:"⛈️",99:"⛈️",
};

export default function TripDetails() {
  const { id }                    = useParams();
  const { getTripById, deleteTrip } = useTrip();
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const trip                      = getTripById(id);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Access control: personal trips only visible to their owner
  const isOwner  = trip?.userId === user?.id;
  const canView  = trip?.isPublic || isOwner;

  // Load Leaflet map dynamically
  useEffect(() => {
    if (!trip?.lat || mapLoaded || !canView) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = window.L;
      if (document.getElementById("trip-map")?._leaflet_id) return;
      const map = L.map("trip-map", { zoomControl: true, scrollWheelZoom: false })
        .setView([trip.lat, trip.lon], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:#4ade80;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
        iconAnchor: [7, 7],
      });
      L.marker([trip.lat, trip.lon], { icon }).addTo(map)
        .bindPopup(`<b>${trip.location}</b>`).openPopup();
      setMapLoaded(true);
    };
    document.head.appendChild(script);
  }, [trip, canView]);

  function handleDelete() {
    if (window.confirm("Delete this trip? This can't be undone.")) {
      deleteTrip(id);
      navigate("/trips");
    }
  }

  // Trip not found
  if (!trip) {
    return (
      <div className="page">
        <div className="card">
          <h2>Trip Not Found</h2>
          <p style={{ color: "var(--text-dim)", marginBottom: "1.5rem" }}>
            This trip doesn't exist or may have been deleted.
          </p>
          <Link to="/trips" className="back-link">← Back to My Trips</Link>
        </div>
      </div>
    );
  }

  // Personal trip viewed by someone who isn't the owner
  if (!canView) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</p>
          <h2>Private Trip</h2>
          <p style={{ color: "var(--text-dim)", marginBottom: "1.5rem" }}>
            This trip is personal and only visible to its owner.
          </p>
          <Link to="/explore" className="back-link">← Back to Explore</Link>
        </div>
      </div>
    );
  }

  const meta          = TYPE_META[trip.tripType] || TYPE_META.other;
  const formattedDate = trip.date
    ? new Date(trip.date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "No date recorded";

  return (
    <div className="detail-page">
      <div className="detail-topbar">
        <Link to={isOwner ? "/trips" : "/explore"} className="back-link">
          ← {isOwner ? "My Trips" : "Explore"}
        </Link>
        <div className="detail-actions">
          {/* Only the owner can delete */}
          {isOwner && (
            <button className="btn-danger-sm" onClick={handleDelete}>Delete</button>
          )}
        </div>
      </div>

      <div className="detail-header">
        <div className="detail-type-badge">{meta.icon} {meta.label}</div>
        <h1 className="detail-title">{trip.location}</h1>
        <p className="detail-date">{formattedDate}</p>
        <span className="vis-tag">
          {trip.isPublic ? "🌐 Public" : "🔒 Personal"}
        </span>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          {trip.lat && trip.lon && (
            <div className="detail-section">
              <h3 className="section-label">📍 Location</h3>
              <div id="trip-map" className="trip-map" />
              <p className="map-caption">{trip.locationFull || trip.location}</p>
            </div>
          )}
          {trip.notes ? (
            <div className="detail-section">
              <h3 className="section-label">📓 Trip Notes</h3>
              <div className="notes-box">{trip.notes}</div>
            </div>
          ) : (
            <div className="detail-section">
              <p style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "0.9rem" }}>
                No notes recorded for this trip.
              </p>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          {trip.species && (
            <div className="sidebar-card">
              <p className="sidebar-label">
                {trip.tripType === "fishing" ? "Species" :
                 trip.tripType === "hunting" ? "Game" : "Target"}
              </p>
              <p className="sidebar-value">{trip.species}</p>
            </div>
          )}

          {trip.weather ? (
            <div className="sidebar-card weather-card">
              <p className="sidebar-label">⛅ Weather at Time of Trip</p>
              <div className="weather-big">
                <span className="weather-emoji">{WMO_EMOJI[trip.weather.weatherCode] || "🌡️"}</span>
                <span className="weather-temp">{trip.weather.tempF}°F</span>
              </div>
              <p className="weather-cond">{trip.weather.conditions}</p>
              <div className="weather-stats">
                <div className="w-stat"><span>💨</span><span>{trip.weather.windMph} mph</span></div>
                <div className="w-stat"><span>💧</span><span>{trip.weather.humidity}% humidity</span></div>
              </div>
            </div>
          ) : (
            <div className="sidebar-card">
              <p className="sidebar-label">⛅ Weather</p>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                Weather wasn't captured for this trip.
              </p>
            </div>
          )}

          {trip.lat && (
            <div className="sidebar-card">
              <p className="sidebar-label">Coordinates</p>
              <p className="sidebar-value mono">
                {trip.lat.toFixed(5)}, {trip.lon.toFixed(5)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${trip.lat},${trip.lon}`}
                target="_blank" rel="noopener noreferrer"
                className="map-link"
              >
                Open in Google Maps →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
