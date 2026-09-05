import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!token || !user) {
    // If target requires staff or admin role, redirect to staff login
    const isStaffOrAdmin = allowedRoles && allowedRoles.some((r) => ["admin", "reception", "housekeeping", "kitchen"].includes(r));
    const targetLogin = isStaffOrAdmin ? "/staff/login" : "/login";
    return <Navigate to={targetLogin} state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (["reception", "housekeeping", "kitchen"].includes(user.role)) {
      return <Navigate to="/staff/dashboard" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
