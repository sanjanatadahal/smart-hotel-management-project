import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="top-navbar">
      <div className="nav-links">
        <Link to="/">Overview</Link>
        <Link to="/rooms">Rooms</Link>
        <Link to="/services">Services</Link>
        <Link to="/gallery">Gallery</Link>
      </div>
    </nav>
  );
}

export default Navbar;