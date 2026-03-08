// authService.js
// Handles JWT-style token generation, validation, and security utilities.
// In production this would call a real backend — here we simulate it
// with localStorage-persisted users and a signed token pattern.

const TOKEN_KEY = "ot_auth_token";
const USERS_KEY = "ot_users";

// ── TOKEN HELPERS ─────────────────────────────────────────────────────────────

/**
 * Build a minimal JWT-style token (header.payload.signature).
 * Not cryptographically secure — demonstrates the pattern for a frontend course.
 */
function createToken(userId, email) {
  const header  = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    email,
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24, // 24-hour expiry
  }));
  // Simple signature: base64 of reversed payload (simulates signing)
  const signature = btoa(payload.split("").reverse().join(""));
  return `${header}.${payload}.${signature}`;
}

/** Decode and return the payload from a token, or null if invalid/expired. */
export function decodeToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (Date.now() > payload.exp) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

// ── SECURE STORAGE ────────────────────────────────────────────────────────────

/** Store token in sessionStorage (cleared on tab close — more secure than localStorage). */
export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  return decodeToken(token) !== null;
}

// ── USER STORE ────────────────────────────────────────────────────────────────

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Simple hash — XOR + base64 to avoid storing plain-text passwords. */
function hashPassword(password) {
  return btoa(
    password.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (i % 7 + 1))).join("")
  );
}

// ── AUTH ACTIONS ──────────────────────────────────────────────────────────────

/**
 * Register a new user. Returns { token, user } or throws an error string.
 */
export function registerUser({ name, email, password }) {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with that email already exists.");
  }
  const user = {
    id: Date.now(),
    name: sanitizeInput(name),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  const token = createToken(user.id, user.email);
  saveToken(token);
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

/**
 * Log in an existing user. Returns { token, user } or throws an error string.
 */
export function loginUser({ email, password }) {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error("Invalid email or password.");
  }
  const token = createToken(user.id, user.email);
  saveToken(token);
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

/**
 * Log out — remove token from sessionStorage.
 */
export function logoutUser() {
  removeToken();
}

// ── SECURITY UTILITIES ────────────────────────────────────────────────────────

/**
 * Sanitize user input to prevent XSS.
 * Strips HTML tags and encodes dangerous characters.
 */
export function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Generate a CSRF token for forms and store it in sessionStorage.
 * Forms include this token; the app verifies it before processing submissions.
 */
export function generateCsrfToken() {
  const token = btoa(String(Math.random()) + String(Date.now()));
  sessionStorage.setItem("ot_csrf", token);
  return token;
}

export function validateCsrfToken(token) {
  return token === sessionStorage.getItem("ot_csrf");
}
