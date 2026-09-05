import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import "./staff.css";
import hotelImage from "../../assets/lobby.jpg";

function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await api.staffLogin({ email, password });
      if (res.success) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/staff/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid staff credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div
      className="staff-login-container"
      style={{
        backgroundImage: `linear-gradient(rgba(26, 18, 11, 0.75), rgba(26, 18, 11, 0.85)), url(${hotelImage})`,
      }}
    >
      <div className="staff-login-box">
        <div className="staff-brand">THE RIVERSIDE TREAT</div>
        <h2>Hotel Staff Portal</h2>
        <p className="staff-subtitle">Secure role-based dashboard for hotel operations</p>

        {errorMessage && (
          <div className="staff-error-alert">{errorMessage}</div>
        )}

        <form onSubmit={handleStaffLogin}>
          <div className="staff-input-group">
            <label>Staff Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. reception@riversidetreat.com"
              required
            />
          </div>

          <div className="staff-input-group">
            <label>Staff Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your security password"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-staff-submit">
            {isLoading ? "Authenticating Staff..." : "Sign In to Staff Console"}
          </button>
        </form>

        {/* DEMO SHORTCUTS FOR EVALUATORS */}
        <div className="staff-quick-role-presets">
          <span>Quick Demo Access:</span>
          <div className="preset-buttons">
            <button
              type="button"
              onClick={() => handleQuickFill("reception@riversidetreat.com", "Staff@123")}
            >
              🛎️ Reception
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("housekeeping@riversidetreat.com", "Staff@123")}
            >
              🧹 Housekeeping
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("kitchen@riversidetreat.com", "Staff@123")}
            >
              🍳 Kitchen
            </button>
          </div>
        </div>

        <div className="staff-footer-links">
          <Link to="/login">← Customer Website Login</Link>
          <Link to="/admin/login">Admin Management →</Link>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
