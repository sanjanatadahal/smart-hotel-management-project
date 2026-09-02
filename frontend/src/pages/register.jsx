import "./Login.css";
import hotelImage from "../assets/hotel.jpg";

function Register() {
  return (
    <div
      className="login-container"
      style={{
        backgroundImage:
          `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)), url(${hotelImage})`
      }}
    >
      <div className="login-box">
        <h1>Smart Hotel</h1>

        <p className="subtitle">
          Create your account to continue.
        </p>

        <form onSubmit={(event) => {
  event.preventDefault();
  window.location.href = "/login";
}}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Register
          </button>

          <p className="signup-text">
            Already have an account?{" "}
            <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;4