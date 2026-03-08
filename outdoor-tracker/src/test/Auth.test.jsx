// Auth.test.jsx — Tests for authentication: authService, AuthContext, Login, Register, ProtectedRoute
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";
import {
  registerUser, loginUser, logoutUser,
  decodeToken, getToken, sanitizeInput,
  generateCsrfToken, validateCsrfToken,
} from "../services/authService";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";

// ── localStorage + sessionStorage mock ────────────────────────────────────────
const makeStoreMock = () => {
  let store = {};
  return {
    getItem:    (k)    => store[k] ?? null,
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: (k)    => { delete store[k]; },
    clear:      ()     => { store = {}; },
  };
};
const lsMock  = makeStoreMock();
const ssMock  = makeStoreMock();
Object.defineProperty(globalThis, "localStorage",  { value: lsMock,  writable: true });
Object.defineProperty(globalThis, "sessionStorage", { value: ssMock, writable: true });

beforeEach(() => { lsMock.clear(); ssMock.clear(); });

// ── authService ───────────────────────────────────────────────────────────────
describe("authService — registerUser", () => {
  test("returns a token and user on success", () => {
    const { token, user } = registerUser({ name: "Austin", email: "a@test.com", password: "Pass1234!" });
    expect(token).toBeTruthy();
    expect(user.email).toBe("a@test.com");
    expect(user.name).toBe("Austin");
  });

  test("throws if email already registered", () => {
    registerUser({ name: "Austin", email: "a@test.com", password: "Pass1234!" });
    expect(() => registerUser({ name: "Austin", email: "a@test.com", password: "Other123!" }))
      .toThrow("already exists");
  });

  test("token is saved to sessionStorage", () => {
    registerUser({ name: "Austin", email: "b@test.com", password: "Pass1234!" });
    expect(ssMock.getItem("ot_auth_token")).toBeTruthy();
  });
});

describe("authService — loginUser", () => {
  beforeEach(() => {
    registerUser({ name: "Austin", email: "login@test.com", password: "Pass1234!" });
    ssMock.clear(); // clear token so we can test login independently
  });

  test("returns token and user on correct credentials", () => {
    const { token, user } = loginUser({ email: "login@test.com", password: "Pass1234!" });
    expect(token).toBeTruthy();
    expect(user.email).toBe("login@test.com");
  });

  test("throws on wrong password", () => {
    expect(() => loginUser({ email: "login@test.com", password: "wrong" }))
      .toThrow("Invalid email or password");
  });

  test("throws on unknown email", () => {
    expect(() => loginUser({ email: "nobody@test.com", password: "Pass1234!" }))
      .toThrow("Invalid email or password");
  });
});

describe("authService — token / logout", () => {
  test("decodeToken returns payload for valid token", () => {
    const { token } = registerUser({ name: "T", email: "t@test.com", password: "Pass1234!" });
    const payload = decodeToken(token);
    expect(payload).not.toBeNull();
    expect(payload.email).toBe("t@test.com");
  });

  test("decodeToken returns null for garbage", () => {
    expect(decodeToken("not.a.token")).toBeNull();
  });

  test("logoutUser removes token from sessionStorage", () => {
    registerUser({ name: "T", email: "t2@test.com", password: "Pass1234!" });
    expect(ssMock.getItem("ot_auth_token")).toBeTruthy();
    logoutUser();
    expect(ssMock.getItem("ot_auth_token")).toBeNull();
  });
});

// ── Security utilities ────────────────────────────────────────────────────────
describe("authService — sanitizeInput (XSS prevention)", () => {
  test("strips script tags", () => {
    const out = sanitizeInput("<script>alert('xss')</script>");
    expect(out).not.toContain("<script>");
    expect(out).not.toContain("</script>");
  });

  test("encodes angle brackets", () => {
    expect(sanitizeInput("<b>bold</b>")).toContain("&lt;");
    expect(sanitizeInput("<b>bold</b>")).toContain("&gt;");
  });

  test("returns empty string for non-string input", () => {
    expect(sanitizeInput(null)).toBe("");
    expect(sanitizeInput(undefined)).toBe("");
  });

  test("passes through safe text unchanged in meaning", () => {
    const safe = sanitizeInput("John Smith");
    expect(safe).toBe("John Smith");
  });
});

describe("authService — CSRF protection", () => {
  test("generateCsrfToken returns a non-empty string", () => {
    const token = generateCsrfToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  test("validateCsrfToken returns true for matching token", () => {
    const token = generateCsrfToken();
    expect(validateCsrfToken(token)).toBe(true);
  });

  test("validateCsrfToken returns false for wrong token", () => {
    generateCsrfToken();
    expect(validateCsrfToken("fake-token")).toBe(false);
  });
});

// ── AuthContext ───────────────────────────────────────────────────────────────
function AuthConsumer() {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  return (
    <div>
      <p data-testid="auth-status">{isAuthenticated ? "logged-in" : "logged-out"}</p>
      <p data-testid="user-email">{user?.email || "none"}</p>
      <button onClick={() => register({ name: "Test", email: "ctx@test.com", password: "Pass1234!" })}>
        Register
      </button>
      <button onClick={() => login({ email: "ctx@test.com", password: "Pass1234!" })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  function renderConsumer() {
    return render(<AuthProvider><MemoryRouter><AuthConsumer /></MemoryRouter></AuthProvider>);
  }

  test("starts unauthenticated", () => {
    renderConsumer();
    expect(screen.getByTestId("auth-status").textContent).toBe("logged-out");
  });

  test("register sets authenticated state", async () => {
    renderConsumer();
    await act(async () => fireEvent.click(screen.getByText("Register")));
    expect(screen.getByTestId("auth-status").textContent).toBe("logged-in");
    expect(screen.getByTestId("user-email").textContent).toBe("ctx@test.com");
  });

  test("logout clears authenticated state", async () => {
    renderConsumer();
    await act(async () => fireEvent.click(screen.getByText("Register")));
    await act(async () => fireEvent.click(screen.getByText("Logout")));
    expect(screen.getByTestId("auth-status").textContent).toBe("logged-out");
    expect(screen.getByTestId("user-email").textContent).toBe("none");
  });

  test("useAuth throws outside AuthProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Bare() { useAuth(); return null; }
    expect(() => render(<Bare />)).toThrow("useAuth must be used inside AuthProvider");
    spy.mockRestore();
  });
});

// ── ProtectedRoute ────────────────────────────────────────────────────────────
describe("ProtectedRoute", () => {
  function renderProtected(authenticated = false) {
    // Pre-seed a token if we want authenticated state
    if (authenticated) {
      registerUser({ name: "T", email: "pr@test.com", password: "Pass1234!" });
    }
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route path="/login" element={<p>Login Page</p>} />
            <Route path="/protected" element={
              <ProtectedRoute><p>Secret Content</p></ProtectedRoute>
            } />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  }

  test("redirects unauthenticated users to /login", async () => {
    renderProtected(false);
    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  test("renders children for authenticated users", async () => {
    renderProtected(true);
    await waitFor(() => {
      expect(screen.getByText("Secret Content")).toBeInTheDocument();
    });
  });
});

// ── Login page UI ─────────────────────────────────────────────────────────────
describe("Login page", () => {
  function renderLogin() {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login"  element={<Login />} />
            <Route path="/trips"  element={<p>Trips Page</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  }

  test("renders email and password fields", () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("shows validation error for empty email", async () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  test("shows error for invalid credentials", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  test("redirects to /trips on successful login", async () => {
    registerUser({ name: "U", email: "good@test.com", password: "Pass1234!" });
    ssMock.clear();
    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "good@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Pass1234!" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(screen.getByText("Trips Page")).toBeInTheDocument());
  });
});

// ── Register page UI ──────────────────────────────────────────────────────────
describe("Register page", () => {
  function renderRegister() {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/register"]}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/trips"    element={<p>Trips Page</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );
  }

  test("renders all form fields", () => {
    renderRegister();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test("shows error when passwords don't match", async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Austin" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@test.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Pass1234!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Different1!" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("alert").textContent).toContain("match");
  });

  test("shows error for short password", async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Austin" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "short@test.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "abc" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("alert").textContent).toContain("8 character");
  });

  test("redirects to /trips on successful registration", async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Austin" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "brand@test.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Pass1234!" } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "Pass1234!" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => expect(screen.getByText("Trips Page")).toBeInTheDocument());
  });
});
