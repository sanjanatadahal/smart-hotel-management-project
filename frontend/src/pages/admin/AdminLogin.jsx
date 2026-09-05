import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import "./admin.css";
import hotelImage from "../../assets/img 2.jpg";

function AdminLogin() {
  const [email, setEmail] = useState("admin@riversidetreat.com");
  const [password, setPassword] = useState("Admin@123");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await api.adminLogin({ email, password });
      if (res.success) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid administrator credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="admin-login-container"
      style={{
        backgroundImage: `linear-gradient(rgba(20, 14, 10, 0.8), rgba(20, 14, 10, 0.9)), url(${hotelImage})`,
      }}
    >
      <div className="admin-login-box">
        <div className="admin-brand-tag">EXECUTIVE CONTROL PORTAL</div>
        <h2>Hotel Management Admin</h2>
        <p className="admin-subtitle">Master administrative panel for analytics, inventory & personnel</p>

        {errorMessage && (
          <div className="admin-error-alert">{errorMessage}</div>
        )}

        <form onSubmit={handleAdminLogin}>
          <div className="admin-input-group">
            <label>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-input-group">
            <label>Security Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-admin-submit">
            {isLoading ? "Validating Authorization..." : "Enter Admin Management Portal"}
          </button>
        </form>

        <div className="admin-demo-hint">
          <small>Default credentials prefilled: <code>admin@riversidetreat.com</code> / <code>Admin@123</code></small>
        </div>

        <div className="admin-footer-links">
          <Link to="/">← Back to Hotel Website</Link>
          <Link to="/staff/login">Staff Portal →</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
