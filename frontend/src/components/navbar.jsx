import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const isDarkHeroPage = location.pathname === "/" || location.pathname === "/home";

  return (
    <nav className={`top-navbar ${!isDarkHeroPage ? "navbar-scrolled" : ""}`}>
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <span className="brand-icon">🏛️</span>
          <div className="brand-text">
            <span className="brand-main">THE RIVERSIDE TREAT</span>
            <span className="brand-sub">LUXURY HOTEL & SPA</span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Overview</Link>
          <Link to="/rooms" onClick={() => setMenuOpen(false)}>Rooms</Link>
          <Link to="/facilities" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link to="/restaurant" onClick={() => setMenuOpen(false)}>Dining</Link>
          <Link to="/gallery" onClick={() => setMenuOpen(false)}>Gallery</Link>

          {/* User Auth Section */}
          <div className="auth-nav-actions">
            {user ? (
              <div className="user-profile-menu">
                {user.role === "admin" ? (
                  <Link to="/admin/dashboard" className="nav-badge-link admin-badge" onClick={() => setMenuOpen(false)}>
                    🛡️ Admin Panel
                  </Link>
                ) : ["reception", "housekeeping", "kitchen"].includes(user.role) ? (
                  <Link to="/staff/dashboard" className="nav-badge-link staff-badge" onClick={() => setMenuOpen(false)}>
                    💼 {user.role.toUpperCase()}
                  </Link>
                ) : (
                  <Link to="/profile" className="nav-badge-link profile-badge" onClick={() => setMenuOpen(false)}>
                    👤 {user.name ? user.name.split(" ")[0] : "Profile"}
                  </Link>
                )}
                <button onClick={handleLogout} className="nav-logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <div className="login-dropdown-container">
                <button
                  type="button"
                  className="nav-login-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  Sign In ▾
                </button>
                {dropdownOpen && (
                  <div className="login-dropdown-menu" onClick={() => setDropdownOpen(false)}>
                    <Link to="/login" className="dropdown-item">
                      <strong>Customer Login</strong>
                      <small>Book rooms & view reservations</small>
                    </Link>
                    <Link to="/register" className="dropdown-item">
                      <strong>New Guest Register</strong>
                      <small>Create your guest account</small>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <Link to="/staff/login" className="dropdown-item staff-item">
                      <strong>Staff Portal</strong>
                      <small>Reception, Housekeeping, Kitchen</small>
                    </Link>
                    <Link to="/admin/login" className="dropdown-item admin-item">
                      <strong>Admin Portal</strong>
                      <small>Hotel management & analytics</small>
                    </Link>
                  </div>
                )}
              </div>
            )}
            <Link to="/rooms" className="book-now-nav-btn" onClick={() => setMenuOpen(false)}>
              Book Stay
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;