// App.jsx — Root component: providers, routing, protected route wrappers
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";

import Home       from "./pages/Home";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import LogTrip    from "./pages/LogTrip";
import MyTrips    from "./pages/MyTrips";
import TripDetails from "./pages/TripDetails";
import Explore    from "./pages/Explore";
import About      from "./pages/About";
import NotFound   from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider must wrap TripProvider because TripContext uses useAuth */}
      <AuthProvider>
        <TripProvider>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explore"  element={<Explore />} />
              <Route path="/about"    element={<About />} />

              {/* Protected routes — require login */}
              <Route path="/log" element={
                <ProtectedRoute><LogTrip /></ProtectedRoute>
              } />
              <Route path="/trips" element={
                <ProtectedRoute><MyTrips /></ProtectedRoute>
              } />
              <Route path="/trips/:id" element={<TripDetails />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
