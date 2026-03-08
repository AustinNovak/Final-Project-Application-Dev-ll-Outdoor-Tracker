# 🌲 Outdoor Tracker

A production-ready single-page React application for hunters, anglers, hikers, and campers to securely log outdoor trips with automatic weather data, interactive maps, and personal notes.

**Live Demo:** [https://your-app.vercel.app](https://your-app.vercel.app) ← replace after deploying

---

## Problem Statement

Hunters and anglers rely on memory, handwritten notes, or multiple disconnected apps to track where they found game, caught fish, or discovered great spots. **Outdoor Tracker** solves this by combining location tracking, weather conditions, and personal trip logs in one secure, easy-to-use application. Users can log trips, record catches, review past conditions, and use that data to plan better future outings.

---

## Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT-style register/login/logout with protected routes |
| 📍 Location Autocomplete | Nominatim (OpenStreetMap) — free, no API key |
| 📡 GPS Detection | One-tap "use my location" button |
| ⛅ Auto Weather Snapshot | Open-Meteo captures temp, wind, humidity at log time |
| 🗺️ Interactive Map | Leaflet + OpenStreetMap pin on every trip detail |
| 📓 Trip Notes | Record species, conditions, notes — public or private |
| 🔍 Filter & Search | Filter by trip type; search by location, species, notes |
| 💾 Persistent Storage | Trips saved to localStorage across sessions |
| 📱 Responsive Design | Mobile-first; works great in the field |
| 🛡️ Security | XSS input sanitization, CSRF token validation, sessionStorage token storage |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| State | useState + Context API (Auth + Trip) |
| Location Search | Nominatim / OpenStreetMap — free |
| Weather | Open-Meteo API — free, no key |
| Maps | Leaflet.js + OpenStreetMap — free |
| Auth | JWT-style tokens, sessionStorage, client-side hashing |
| Styling | Vanilla CSS with custom properties |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |

---

## Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/AustinNovak/Final-Project-Part-2-MVP.git
cd Final-Project-Part-2-MVP

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Run tests
npm run test
```

> **No environment variables or API keys required.** All APIs are free and open.

---

## Available Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home dashboard — hero, features, recent trips |
| `/login` | Public | Sign in to your account |
| `/register` | Public | Create a new account |
| `/about` | Public | About the app and tech stack |
| `/log` | 🔐 Protected | Log a new trip (2-step form) |
| `/trips` | 🔐 Protected | All trips with filter + search |
| `/trips/:id` | 🔐 Protected | Full trip detail — map, weather, notes |

Protected routes redirect unauthenticated users to `/login`, which remembers the intended destination and redirects back after sign-in.

---

## Authentication System

Outdoor Tracker implements a frontend JWT-style authentication pattern:

- **Registration:** User submits name, email, password → password is hashed → user stored in localStorage → JWT-style token generated and saved to **sessionStorage**
- **Login:** Credentials checked against stored hash → new token issued → saved to sessionStorage
- **Session Restore:** On page load, token is read from sessionStorage and decoded → if valid and not expired (24-hour TTL), user is restored automatically
- **Logout:** Token removed from sessionStorage, global auth state cleared
- **Protected Routes:** `ProtectedRoute` component checks auth state before rendering; unauthenticated users are redirected to `/login`

### Security Practices

- Tokens stored in **sessionStorage** (cleared on tab close, not accessible cross-tab)
- **XSS prevention:** `sanitizeInput()` strips HTML tags and encodes dangerous characters on all user text inputs
- **CSRF protection:** Forms generate and validate a CSRF token via `generateCsrfToken()` / `validateCsrfToken()`
- Passwords are never stored in plain text — hashed before localStorage persistence

---

## API Documentation

### Open-Meteo (Weather)
- **Base URL:** `https://api.open-meteo.com/v1/forecast`
- **Auth:** None required
- **Data:** temperature (°F), wind speed (mph), humidity (%), weather code
- **Docs:** https://open-meteo.com/en/docs

### Nominatim (Location Autocomplete)
- **Base URL:** `https://nominatim.openstreetmap.org`
- **Auth:** None required
- **Usage:** Debounced search (400ms), max 1 req/sec per OSM policy
- **Docs:** https://nominatim.org/release-docs/latest/api/Search/

### Leaflet + OpenStreetMap (Maps)
- **Library:** Leaflet 1.9.4 (loaded dynamically)
- **Tiles:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Auth:** None required

---

## Testing

```bash
npm run test
```

**Test coverage includes:**

| File | What's tested |
|---|---|
| `Auth.test.jsx` | registerUser, loginUser, token decode/expiry, logout, CSRF, XSS sanitization, AuthContext, ProtectedRoute, Login UI, Register UI |
| `TripContext.test.jsx` | addTrip, deleteTrip, localStorage persistence, error boundary |
| `TripCard.test.jsx` | Rendering, links, weather display, trip types, visibility icons |
| `MyTrips.test.jsx` | Filter by type, search, empty states, navigation |
| `Header.test.jsx` | Nav links, hamburger menu, active states |
| `LogTrip.test.jsx` | Form fields, validation, step indicators |

**~65 total tests** across 6 test files.

---

## Deployment

Deployed to Vercel from GitHub. No environment variables needed.

```bash
# Option 1: Vercel CLI
npm install -g vercel
vercel

# Option 2: Connect GitHub repo at vercel.com
# → Import Project → Select repo → Deploy (all defaults)
```

---

## Screenshots

> *(Add screenshots here before final submission)*
> - <img width="1901" height="894" alt="image" src="https://github.com/user-attachments/assets/0c321deb-165f-4cab-973a-510ed2f46ebd" />
> - <img width="1902" height="894" alt="image" src="https://github.com/user-attachments/assets/6d690cdf-8c0e-49ad-9603-63c203ec097b" />
> - <img width="1910" height="933" alt="image" src="https://github.com/user-attachments/assets/51804508-f842-41e9-9d0e-580fcef02aca" />
> - <img width="1911" height="935" alt="image" src="https://github.com/user-attachments/assets/1be3ceee-84a1-4ede-92f3-c16beec1d576" />
> - <img width="1907" height="933" alt="image" src="https://github.com/user-attachments/assets/b60a17a0-2849-4d85-abea-d869f605b5b4" />
> - <img width="1912" height="930" alt="image" src="https://github.com/user-attachments/assets/ca3d4d8b-4e57-4ecd-ad4b-288576e5d073" />
> - <img width="1907" height="936" alt="image" src="https://github.com/user-attachments/assets/2f55c85b-b8ba-45bd-bedc-161472c0644c" />
> - <img width="1916" height="932" alt="image" src="https://github.com/user-attachments/assets/efe6cbf2-b257-4b20-b26a-b1d6541c6d24" />


---

## Known Issues / Limitations

- Authentication is entirely client-side — data is not synced across devices or browsers. A backend (Node + PostgreSQL) is planned for the full-stack version.
- Trip data is scoped to the browser's localStorage, not to the logged-in user account. Multi-user support requires a real backend.

---

## Future Improvements

- [ ] Backend API (Node.js + Express + PostgreSQL) for persistent, cross-device data
- [ ] Photo upload for catches and sightings
- [ ] Favorites / saved locations list
- [ ] Species database integration (USGS fishing regulations)
- [ ] Export trip log as PDF
- [ ] Social sharing of public trips
- [ ] Trip statistics dashboard (best locations, seasonal trends)
- [ ] Push notifications for weather alerts at saved locations

---

*Built as a React SPA final project — Austin Novak | Front End Software Engineering*
