// TripContext.jsx
// Global trip state with ownership — trips are tagged with the userId of whoever
// logged them. myTrips = only the current user's trips. publicTrips = all trips
// marked isPublic (visible to anyone on the Explore page).
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useAuth } from "./AuthContext";

const TripContext = createContext();
const STORAGE_KEY = "outdoor_tracker_trips";

export function TripProvider({ children }) {
  const { user } = useAuth();

  const [trips, setTrips] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  /** Only trips belonging to the currently logged-in user */
  const myTrips = useMemo(
    () => trips.filter((t) => t.userId === user?.id),
    [trips, user]
  );

  /** All trips marked public — visible on Explore page regardless of owner */
  const publicTrips = useMemo(
    () => trips.filter((t) => t.isPublic === true),
    [trips]
  );

  /** Add trip — automatically stamps it with the current user's id */
  function addTrip(trip) {
    const newTrip = { ...trip, id: Date.now(), userId: user?.id };
    setTrips((prev) => [newTrip, ...prev]);
    return newTrip;
  }

  function updateTrip(id, updates) {
    setTrips((prev) =>
      prev.map((t) => (t.id === Number(id) ? { ...t, ...updates } : t))
    );
  }

  function deleteTrip(id) {
    setTrips((prev) => prev.filter((t) => t.id !== Number(id)));
  }

  function getTripById(id) {
    return trips.find((t) => t.id === Number(id));
  }

  const value = useMemo(
    () => ({ trips, myTrips, publicTrips, addTrip, updateTrip, deleteTrip, getTripById }),
    [trips, myTrips, publicTrips]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error("useTrip must be used inside TripProvider");
  return context;
}
