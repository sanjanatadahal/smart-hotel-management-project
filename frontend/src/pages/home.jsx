import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./home.css";
import Navbar from "../components/Navbar";
import hotelView from "../assets/img 2.jpg";
import lobby from "../assets/lobby.jpg";
import swimmingPool from "../assets/swimming pool.jpg";
import hotelRoom from "../assets/room img 1.webp";
import riverSuiteImg from "../assets/suite 1.jpeg";
import gardenImg from "../assets/garden view 1.webp";

const slides = [
  {
    image: hotelView,
    alt: "Hotel View",
    content: (
      <div className="welcome-text">
        <p>Welcome to Hotel</p>
        <h1>The Riverside Treat</h1>
        <p className="stay-quote">
          A stay that will always stay with you
        </p>
      </div>
    ),
  },
  {
    image: lobby,
    alt: "Hotel Lobby",
    content: (
      <div className="slide-quote lobby-quote">
        Wait or Relax here
      </div>
    ),
  },
  {
    image: swimmingPool,
    alt: "Swimming Pool",
    content: (
      <div className="slide-quote pool-quote">
        Dive into Relaxation
      </div>
    ),
  },
  {
    image: hotelRoom,
    alt: "Hotel Room",
    content: (
      <div className="slide-quote room-quote">
        Enjoy the River Side View
      </div>
    ),
  },
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const [booking, setBooking] = useState({
    checkIn: "",
    checkOut: "",
    adults: 2,
    rooms: 1,
    kids: 0,
  });

  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % slides.length);
    }, 4500);

    return () => clearInterval(sliderTimer);
  }, []);

  function updateBooking(event) {
    setBooking((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  function checkAvailability(event) {
    event.preventDefault();

    if (!booking.checkIn || !booking.checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }

    if (booking.checkOut <= booking.checkIn) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    navigate("/rooms", {
      state: {
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: booking.adults,
        rooms: booking.rooms,
        kids: booking.kids,
      },
    });
  }

  return (
    <>
      {/* HERO SLIDER */}
      <section className="slider">
        <Navbar />

        <div
          className="slides"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <div className="slide" key={index}>
              <img src={slide.image} alt={slide.alt} />
              {slide.content}
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING SECTION */}
      <section className="booking-section">
        <form className="booking-bar" onSubmit={checkAvailability}>
          <div className="field">
            <label>📅 CHECK-IN DATE</label>
            <input
              type="date"
              name="checkIn"
              value={booking.checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={updateBooking}
              required
            />
          </div>

          <div className="field">
            <label>🗓️ CHECK-OUT DATE</label>
            <input
              type="date"
              name="checkOut"
              value={booking.checkOut}
              min={booking.checkIn || new Date().toISOString().split("T")[0]}
              onChange={updateBooking}
              required
            />
          </div>

          <div className="field">
            <label>👤 ADULTS</label>
            <input
              type="number"
              name="adults"
              min="1"
              value={booking.adults}
              onChange={updateBooking}
            />
          </div>

          <div className="field">
            <label>🛏️ ROOMS</label>
            <input
              type="number"
              name="rooms"
              min="1"
              value={booking.rooms}
              onChange={updateBooking}
            />
          </div>

          <div className="field">
            <label>👶 KIDS</label>
            <input
              type="number"
              name="kids"
              min="0"
              value={booking.kids}
              onChange={updateBooking}
            />
          </div>

          <button className="search-btn" type="submit">
            Check Availability
          </button>
        </form>
      </section>

      {/* WELCOME / ABOUT SECTION */}
      <section className="home-intro-section" id="about">
        <div className="home-intro-content">
          <span className="section-subtitle">WELCOME TO LUXURY</span>
          <h2>Where Nature Meets Riverside Hospitality</h2>
          <div className="intro-divider"></div>
          <p>
            Nestled along the tranquil riverbanks, The Riverside Treat offers a sanctuary of refined elegance,
            unhurried relaxation, and impeccable hospitality. Whether seeking a peaceful retreat, fine dining
            with panoramic views, or tailored rejuvenation, our sanctuary is designed to leave an everlasting imprint.
          </p>
        </div>

        {/* PROPERTY HIGHLIGHTS */}
        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-img-wrap">
              <img src={riverSuiteImg} alt="Riverside Suites" />
            </div>
            <h3>Riverside Suites</h3>
            <p>Spacious, elegantly appointed suites with private balconies overlooking calm waters.</p>
            <Link to="/rooms" className="highlight-link">Explore Rooms →</Link>
          </div>

          <div className="highlight-card">
            <div className="highlight-img-wrap">
              <img src={swimmingPool} alt="Infinity Pool" />
            </div>
            <h3>Infinity Pool & Spa</h3>
            <p>Temperature-controlled infinity pool and traditional Ayurvedic rejuvenation rituals.</p>
            <Link to="/facilities" className="highlight-link">View Services →</Link>
          </div>

          <div className="highlight-card">
            <div className="highlight-img-wrap">
              <img src={gardenImg} alt="Riverside Dining" />
            </div>
            <h3>Gourmet Dining</h3>
            <p>Authentic regional delicacies and continental cuisine prepared by master chefs.</p>
            <Link to="/restaurant" className="highlight-link">View Menu →</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hotel-footer" id="contact">
        <div className="footer-top">
          <div className="footer-brand">
            <h2>THE RIVERSIDE TREAT</h2>
            <p>
              Experience comfort, relaxation and memorable
              stays at our luxury riverside sanctuary.
            </p>
            <div className="footer-badges">
              <span>⭐️⭐️⭐️⭐️⭐️ 5-Star Riverside Resort</span>
            </div>
          </div>

          <div className="footer-column">
            <h3>EXPLORE</h3>
            <Link to="/">Home</Link>
            <Link to="/rooms">Rooms & Suites</Link>
            <Link to="/facilities">Facilities & Spa</Link>
            <Link to="/restaurant">Restaurant & Dining</Link>
            <Link to="/gallery">Photo Gallery</Link>
          </div>

          <div className="footer-column contact-column">
            <h3>CONTACT & LOCATION</h3>
            <p>📍 Riverside Road, Hubli, Karnataka</p>
            <p>📞 +91 98765 43210</p>
            <p>✉️ riversidetreat@gmail.com</p>
            <p>⏰ Reception Open 24/7</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 The Riverside Treat. All Rights Reserved.</p>
          <div className="social-links">
            <a href="#facebook">Facebook</a>
            <a href="#instagram">Instagram</a>
            <a href="#twitter">Twitter</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;