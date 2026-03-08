// Header.test.jsx — Tests for the sticky navigation header
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";

// localStorage/sessionStorage mock (needed by AuthContext)
const makeStoreMock = () => {
  let store = {};
  return {
    getItem:    (k)    => store[k] ?? null,
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: (k)    => { delete store[k]; },
    clear:      ()     => { store = {}; },
  };
};
Object.defineProperty(globalThis, "localStorage",  { value: makeStoreMock() });
Object.defineProperty(globalThis, "sessionStorage", { value: makeStoreMock() });

// Helper: render Header inside both required providers
function renderHeader(initialRoute = "/") {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Header />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("Header", () => {
  test("renders the app logo/title", () => {
    renderHeader();
    expect(screen.getByText(/Outdoor Tracker/i)).toBeInTheDocument();
  });

  test("renders public navigation links when logged out", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  test("renders sign in and get started links when logged out", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
  });

  test("nav links point to correct routes", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute("href", "/about");
  });

  test("hamburger button is present for mobile menu", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
  });

  test("clicking hamburger opens mobile nav", () => {
    renderHeader();
    const hamburger = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(hamburger);
    // Mobile nav duplicates the links — there should now be more than one Home link
    const homeLinks = screen.getAllByRole("link", { name: /home/i });
    expect(homeLinks.length).toBeGreaterThanOrEqual(2);
  });
});
