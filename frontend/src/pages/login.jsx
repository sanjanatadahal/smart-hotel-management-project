import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../services/api";
import "./login.css";
import hotelImage from "../assets/hotel.jpg";

function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.registeredEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const returnUrl = location.state?.from || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        if (res.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (["reception", "housekeeping", "kitchen"].includes(res.user.role)) {
          navigate("/staff/dashboard");
        } else {
          navigate(returnUrl);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail("guest@example.com");
    setPassword("Guest@123");
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${hotelImage})`,
      }}
    >
      <div className="login-box">
        <div className="login-brand-tag">THE RIVERSIDE TREAT</div>
        <h1>Smart Hotel</h1>
        <p className="subtitle">Welcome back! Please login to your account.</p>

        {errorMessage && (
          <div className="login-error-alert">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "🙈" : "👁"}</button>
            </div>
          </div>

          <div className="options">
            <label>
              <input type="checkbox" id="remember" defaultChecked />
              Remember me
            </label>

            <button
              type="button"
              className="btn-demo-fill"
              onClick={handleQuickDemo}
            >
              Demo Guest Autofill
            </button>
          </div>

          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? "Signing in..." : "Login to Account"}
          </button>

          <p className="signup-text">
            Don't have an account? <Link to="/register">Register Here</Link>
          </p>

          <div className="portal-links">
            <span>Staff or Administrator?</span>
            <div className="portal-buttons">
              <Link to="/staff/login">Staff Portal</Link>
              <span>•</span>
              <Link to="/admin/login">Admin Portal</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
