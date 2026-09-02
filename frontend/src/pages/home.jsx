import { useEffect, useState } from "react";
import "./home.css";
import Navbar from "../components/Navbar";
import hotelView from "../assets/img 2.jpg";
import lobby from "../assets/lobby.jpg";
import swimmingPool from "../assets/swimming pool.jpg";
import hotelRoom from "../assets/room img 1.webp";

const slides = [
  {
    image: hotelView,
    alt: "Hotel View",
    content: (
      <div className="welcome-text">
        <p>Welcome to Hotel</p>
        <h1>The Riverside Treat</h1>

        <p className="stay-quote">A stay that will always stay with you</p>
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

  const [booking, setBooking] = useState({
    checkIn: "",
    checkOut: "",
    adults: 2,
    rooms: 1,
    kids: 0,
  });

  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setCurrentSlide(
        (previous) => (previous + 1) % slides.length
      );
    }, 4000);

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

    alert(
      `Checking availability for ${booking.adults} adults, ${booking.kids} kids and ${booking.rooms} room(s).`
    );
  }

  return (
    <>
      {/* HERO SLIDER */}

      <section className="slider">
        <Navbar/>
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
        <form
          className="booking-bar"
          onSubmit={checkAvailability}
        >
          <div className="field">
            <label>📅 CHECK-IN DATE</label>

            <input
              type="date"
              name="checkIn"
              value={booking.checkIn}
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

      {/* FOOTER */}

      <footer className="hotel-footer">

        <div className="footer-top">

          <div className="footer-brand">
            <h2>THE RIVERSIDE TREAT</h2>

            <p>
              Experience comfort, relaxation and memorable
              stays at our riverside hotel.
            </p>
          </div>

          <div className="footer-column">
            <h3>EXPLORE</h3>

            <a href="/">Home</a>
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
          </div>

          <div className="footer-column contact-column">
            <h3>CONTACT</h3>

            <p>📍 Riverside Road, Hubli</p>
            <p>📞 +91 98765 43210</p>
            <p>✉️ riversidetreat@gmail.com</p>
          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © 2026 The Riverside Treat. All Rights Reserved.
          </p>

          <div className="social-links">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
          </div>

        </div>

      </footer>
    </>
  );
}

export default Home;