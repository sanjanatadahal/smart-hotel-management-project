import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import "./login.css";
import hotelImage from "../assets/hotel.jpg";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await api.register(formData);
      if (res.success) {
        alert("Account registered successfully! Please sign in to continue.");
        navigate("/login", { state: { registeredEmail: formData.email } });
      }
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <p className="subtitle">Create your guest account to manage stays & dining.</p>

        {errorMessage && (
          <div className="login-error-alert">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Create Password</label>
            <div className="password-input-wrap">
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Minimum 6 characters" value={formData.password} onChange={handleChange} minLength="6" required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "🙈" : "👁"}</button>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="password-input-wrap">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} minLength="6" required />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? "🙈" : "👁"}</button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? "Creating Account..." : "Complete Registration"}
          </button>

          <p className="signup-text">
            Already have an account? <Link to="/login">Login Here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
