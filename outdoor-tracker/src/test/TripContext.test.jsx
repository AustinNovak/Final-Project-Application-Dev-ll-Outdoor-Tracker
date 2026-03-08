// TripContext.test.jsx — Tests for global trip state
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { TripProvider, useTrip } from "../context/TripContext";

// Storage mocks
const makeStoreMock = () => {
  let store = {};
  return {
    getItem:    (k)    => store[k] ?? null,
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: (k)    => { delete store[k]; },
    clear:      ()     => { store = {}; },
  };
};
const lsMock = makeStoreMock();
const ssMock = makeStoreMock();
Object.defineProperty(globalThis, "localStorage",  { value: lsMock });
Object.defineProperty(globalThis, "sessionStorage", { value: ssMock });

function TestConsumer() {
  const { myTrips, addTrip, deleteTrip } = useTrip();
  return (
    <div>
      <p data-testid="count">{myTrips.length}</p>
      <button onClick={() =>
        addTrip({ location: "Test Lake", date: "2025-01-01", tripType: "fishing" })
      }>Add</button>
      <button onClick={() => myTrips[0] && deleteTrip(myTrips[0].id)}>
        Delete First
      </button>
      {myTrips.map((t) => (
        <p key={t.id} data-testid="trip-location">{t.location}</p>
      ))}
    </div>
  );
}

function renderWithProviders() {
  return render(
    <AuthProvider>
      <TripProvider>
        <MemoryRouter>
          <TestConsumer />
        </MemoryRouter>
      </TripProvider>
    </AuthProvider>
  );
}

describe("TripContext", () => {
  beforeEach(() => { lsMock.clear(); ssMock.clear(); });

  test("starts with zero trips", () => {
    renderWithProviders();
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  test("addTrip increases trip count", () => {
    renderWithProviders();
    act(() => screen.getByText("Add").click());
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  test("addTrip saves the correct location", () => {
    renderWithProviders();
    act(() => screen.getByText("Add").click());
    expect(screen.getByTestId("trip-location").textContent).toBe("Test Lake");
  });

  test("addTrip assigns a numeric id", () => {
    let captured = [];
    function Capture() {
      const { myTrips, addTrip } = useTrip();
      captured = myTrips;
      return <button onClick={() => addTrip({ location: "X", date: "2025-01-01", tripType: "hiking" })}>Add</button>;
    }
    const { getByText } = render(
      <AuthProvider><TripProvider><MemoryRouter><Capture /></MemoryRouter></TripProvider></AuthProvider>
    );
    act(() => getByText("Add").click());
    expect(typeof captured[0].id).toBe("number");
  });

  test("deleteTrip removes a trip", () => {
    renderWithProviders();
    act(() => screen.getByText("Add").click());
    expect(screen.getByTestId("count").textContent).toBe("1");
    act(() => screen.getByText("Delete First").click());
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  test("multiple trips can be added", () => {
    renderWithProviders();
    act(() => screen.getByText("Add").click());
    act(() => screen.getByText("Add").click());
    act(() => screen.getByText("Add").click());
    expect(screen.getByTestId("count").textContent).toBe("3");
  });

  test("useTrip throws when used outside TripProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Bare() { useTrip(); return null; }
    expect(() => render(<Bare />)).toThrow("useTrip must be used inside TripProvider");
    spy.mockRestore();
  });

  test("trips persist to localStorage", () => {
    renderWithProviders();
    act(() => screen.getByText("Add").click());
    const saved = JSON.parse(lsMock.getItem("outdoor_tracker_trips"));
    expect(saved).toHaveLength(1);
    expect(saved[0].location).toBe("Test Lake");
  });
});
