import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "./pages/home";
import Rooms from "./pages/rooms";
import Facilities from "./pages/facilities";
import Restaurant from "./pages/restaurant";
import Gallery from "./pages/gallery";
import Login from "./pages/login";
import Register from "./pages/register";
import About from "./pages/about";
import Contact from "./pages/contact";

// Customer Pages
import Booking from "./pages/booking";
import Profile from "./pages/profile";

// Staff Pages
import StaffLogin from "./pages/staff/StaffLogin";
import StaffDashboard from "./pages/staff/StaffDashboard";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Website opens directly on Home */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/services" element={<Navigate to="/facilities" replace />} />
        <Route path="/restaurant" element={<Restaurant />} />
        <Route path="/food" element={<Navigate to="/restaurant" replace />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Customer Protected Routes */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute allowedRoles={["customer", "admin", "reception"]}>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["customer", "admin", "reception", "housekeeping", "kitchen"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["reception", "housekeeping", "kitchen", "admin"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
