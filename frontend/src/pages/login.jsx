import "./Login.css";
import hotelImage from "../assets/hotel.jpg";

function Login() {
  const handleSubmit = (event) => {
    event.preventDefault();

    window.location.href="/";
  };

  return (
    <div
  className="login-container"
  style={{
    backgroundImage:
      `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${hotelImage})`
  }}
>

      <div className="login-box">

        
        <h1>Smart Hotel</h1>

        <p className="subtitle">
          Welcome back! Please login to continue.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="options">

            <label>
              <input type="checkbox" id="remember" />
              Remember me
            </label>

            <a href="#">Forgot Password?</a>

          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          <p className="signup-text">
            Don't have an account?{" "}
            <a href="/register">Sign Up</a>
          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;