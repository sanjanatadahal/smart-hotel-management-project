import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>Hotel</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
}

export default Navbar;