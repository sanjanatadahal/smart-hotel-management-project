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
        <p>Welcome to</p>
        <h1>The Riverside Treat</h1>
        <p className="stay-quote">
          Timeless stays beside the river
        </p>
      </div>
    ),
  },
  {
    image: lobby,
    alt: "Hotel Lobby",
    content: (
      <div className="slide-quote lobby-quote">
        Arrive gracefully. Unwind completely.
      </div>
    ),
  },
  {
    image: swimmingPool,
    alt: "Swimming Pool",
    content: (
      <div className="slide-quote pool-quote">
        Leisure, elevated by the water
      </div>
    ),
  },
  {
    image: hotelRoom,
    alt: "Hotel Room",
    content: (
      <div className="slide-quote room-quote">
        Wake to the river. Rest in refinement.
      </div>
    ),
  },
];

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlideTransitionEnabled, setIsSlideTransitionEnabled] = useState(true);
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
      setCurrentSlide((previous) => previous + 1);
    }, 4500);

    return () => clearInterval(sliderTimer);
  }, []);

  function handleSlideTransitionEnd() {
    // The last item is a copy of the first slide. Reset invisibly after reaching it.
    if (currentSlide === slides.length) {
      setIsSlideTransitionEnabled(false);
      setCurrentSlide(0);
      requestAnimationFrame(() => setIsSlideTransitionEnabled(true));
    }
  }

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
          onTransitionEnd={handleSlideTransitionEnd}
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: isSlideTransitionEnabled ? undefined : "none",
          }}
        >
          {[...slides, slides[0]].map((slide, index) => (
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
          <span className="section-subtitle">RIVERSIDE HOSPITALITY, REFINED</span>
          <h2>An Exceptional Escape, Shaped by the River</h2>
          <div className="intro-divider"></div>
          <p>
            Set beside tranquil riverbanks, The Riverside Treat is a place for unhurried days, thoughtful comfort,
            and warm hospitality. From restorative stays and fine dining to quiet moments with a view, every detail
            is composed to make your time here feel beautifully your own.
          </p>
        </div>

        {/* PROPERTY HIGHLIGHTS */}
        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-img-wrap">
              <img src={riverSuiteImg} alt="Riverside Suites" />
            </div>
            <h3>Riverside Suites</h3>
            <p>Generous, beautifully appointed suites with private balconies overlooking tranquil water.</p>
            <Link to="/rooms" className="highlight-link">Explore Rooms →</Link>
          </div>

          <div className="highlight-card">
            <div className="highlight-img-wrap">
              <img src={swimmingPool} alt="Infinity Pool" />
            </div>
            <h3>Infinity Pool & Spa</h3>
            <p>Unhurried poolside moments and traditional Ayurvedic rituals for complete restoration.</p>
            <Link to="/facilities" className="highlight-link">View Services →</Link>
          </div>

          <div className="highlight-card">
            <div className="highlight-img-wrap">
              <img src={gardenImg} alt="Riverside Dining" />
            </div>
            <h3>Gourmet Dining</h3>
            <p>Regional delicacies and continental classics, thoughtfully prepared and beautifully served.</p>
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
              A considered riverside retreat where warm service,
              quiet luxury, and memorable stays come naturally.
            </p>
            <div className="footer-badges">
              <span>⭐️⭐️⭐️⭐️⭐️ 5-Star Riverside Resort</span>
            </div>
          </div>

          <div className="footer-column">
            <h3>EXPLORE</h3>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
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
