import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../services/api";
import "./rooms.css";

import deluxeRoom1 from "../assets/river view 1.webp";
import deluxeRoom2 from "../assets/river view 2.webp";
import deluxeRoom3 from "../assets/river view 3.jpeg";
import deluxeRoom4 from "../assets/river view 4.webp";

import gardenRoom1 from "../assets/garden view 2.jpeg";
import gardenRoom2 from "../assets/garden view 1.webp";
import gardenRoom3 from "../assets/garden view 5.webp";
import gardenRoom4 from "../assets/garden view 3.webp";
import gardenRoom5 from "../assets/garden view 4.webp";

import riversideSuite1 from "../assets/suite 1.jpeg";
import riversideSuite2 from "../assets/suite 3.jpg";
import riversideSuite3 from "../assets/suite 2.jpg";
import riversideSuite4 from "../assets/suite 4.jpeg";

import familyRoom1 from "../assets/fam 5.webp";
import familyRoom2 from "../assets/fam 2.webp";
import familyRoom3 from "../assets/fam 1.webp";
import familyRoom4 from "../assets/fam 3.webp";
import familyRoom5 from "../assets/fam 4.jpg";

import executiveRoom1 from "../assets/executive 1.webp";
import executiveRoom2 from "../assets/executive 2.webp";
import executiveRoom3 from "../assets/executive 3.jpg";
import executiveRoom4 from "../assets/executive 4.jpg";

import luxurySuite1 from "../assets/pri bal 2.webp";
import luxurySuite2 from "../assets/pri bal 1.webp";
import luxurySuite3 from "../assets/pri bal 3.webp";
import luxurySuite4 from "../assets/pri bal 4.webp";

// Image mapping for the 6 existing room types
const roomImagesMap = {
  "Deluxe Riverside Room": [deluxeRoom1, deluxeRoom2, deluxeRoom3, deluxeRoom4],
  "Premium Garden Room": [gardenRoom1, gardenRoom2, gardenRoom3, gardenRoom4, gardenRoom5],
  "Riverside Suite": [riversideSuite1, riversideSuite2, riversideSuite3, riversideSuite4],
  "Family Room": [familyRoom1, familyRoom2, familyRoom3, familyRoom4, familyRoom5],
  "Executive Room": [executiveRoom1, executiveRoom2, executiveRoom3, executiveRoom4],
  "Luxury River Suite": [luxurySuite1, luxurySuite2, luxurySuite3, luxurySuite4],
};

function Rooms() {
  const [activeImages, setActiveImages] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const searchDates = location.state || {};
  const [checkIn, setCheckIn] = useState(searchDates.checkIn || "");
  const [checkOut, setCheckOut] = useState(searchDates.checkOut || "");
  const [guests, setGuests] = useState(searchDates.adults || 2);

  // Fetch rooms from backend with dynamic date availability
  const fetchRooms = async (inDate, outDate) => {
    try {
      setLoading(true);
      const res = await api.getRooms(inDate, outDate);
      if (res.success) {
        setRooms(res.rooms);
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
      setErrorMessage("Could not load rooms. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      try {
        setLoading(true);
        const res = await api.getRooms(checkIn, checkOut);
        if (!cancelled && res.success) {
          setRooms(res.rooms);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load rooms:", err);
          setErrorMessage("Could not load rooms. Please check backend connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRooms();
    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      alert("Check-out date must be after check-in date.");
      return;
    }
    fetchRooms(checkIn, checkOut);
  };

  const showPreviousImage = (roomId, totalImages) => {
    setActiveImages((prev) => {
      const current = prev[roomId] || 0;
      return {
        ...prev,
        [roomId]: current === 0 ? totalImages - 1 : current - 1,
      };
    });
  };

  const showNextImage = (roomId, totalImages) => {
    setActiveImages((prev) => {
      const current = prev[roomId] || 0;
      return {
        ...prev,
        [roomId]: current === totalImages - 1 ? 0 : current + 1,
      };
    });
  };

  const handleBookNow = (room) => {
    navigate("/booking", {
      state: {
        room,
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        guests,
      },
    });
  };

  const availableRooms = rooms.filter((r) => !r.isBooked);
  const bookedRooms = rooms.filter((r) => r.isBooked);

  const renderRoomCard = (room, isUnavailable = false) => {
    const images = roomImagesMap[room.name] || [deluxeRoom1];
    const currentImage = activeImages[room._id] || 0;

    return (
      <div
        className={`room-card ${isUnavailable ? "unavailable-room" : ""}`}
        key={room._id || room.roomNumber}
      >
        {/* IMAGE SLIDER */}
        <div className="room-image">
          <div
            className="room-image-slider"
            style={{
              transform: `translateX(-${currentImage * 100}%)`,
            }}
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${room.name} view ${idx + 1}`}
                loading="lazy"
              />
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="image-arrow image-arrow-left"
                onClick={() => showPreviousImage(room._id, images.length)}
                aria-label="Previous photo"
              >
                ❮
              </button>

              <button
                type="button"
                className="image-arrow image-arrow-right"
                onClick={() => showNextImage(room._id, images.length)}
                aria-label="Next photo"
              >
                ❯
              </button>

              <span className="image-count">
                {currentImage + 1} / {images.length}
              </span>
            </>
          )}

          <span className="room-number-tag">Room #{room.roomNumber}</span>
        </div>

        {/* ROOM DETAILS */}
        <div className="room-content">
          <h3>{room.name}</h3>

          {checkIn && checkOut ? (
            isUnavailable ? (
              <p className="room-booked">🔴 Booked for selected dates</p>
            ) : (
              <p className="room-available">🟢 Available for selected dates</p>
            )
          ) : (
            <p className="room-neutral-status">✨ Select dates above to check live availability</p>
          )}

          <p className="room-description">{room.description}</p>

          <div className="room-details">
            <span>🛏️ {room.bed}</span>
            <span>👤 Up to {room.guests} Guests</span>
            <span>🌊 Riverside View</span>
          </div>

          <div className="room-footer">
            <div className="price-tag">
              <strong>₹{room.price?.toLocaleString()}</strong>
              <span> / Night</span>
            </div>

            {isUnavailable ? (
              <button disabled className="btn-unavailable">
                Not Available
              </button>
            ) : (
              <button
                type="button"
                className="btn-book"
                onClick={() => handleBookNow(room)}
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rooms-page">
      <Navbar />

      {/* HEADER */}
      <section className="rooms-header">
        <div className="rooms-header-content">
          <p>STAY WITH US</p>
          <h1>Our Rooms & Suites</h1>
          <span>Comfort, elegance and a memorable riverside experience</span>
        </div>
      </section>

      {/* INTRO & DATE PICKER */}
      <section className="rooms-intro">
        <p className="intro-title">THE RIVERSIDE TREAT</p>
        <h2>Choose Your Perfect Stay</h2>
        <p>
          Discover our carefully designed rooms and suites, created to make your stay
          comfortable, peaceful and memorable.
        </p>

        {/* Dynamic Date Filter Bar */}
        <form className="rooms-date-bar" onSubmit={handleFilterSubmit}>
          <div className="date-field">
            <label>Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
          </div>

          <div className="date-field">
            <label>Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().split("T")[0]}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>

          <div className="date-field">
            <label>Guests</label>
            <input
              type="number"
              min="1"
              max="10"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>

          <button type="submit" className="date-filter-btn">
            Update Availability
          </button>
        </form>

        {checkIn && checkOut && (
          <p className="selected-dates">
            Showing dynamic availability for: <strong>{checkIn}</strong> → <strong>{checkOut}</strong>
          </p>
        )}
      </section>

      {errorMessage && (
        <div className="error-banner">{errorMessage}</div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Checking live room availability...</p>
        </div>
      ) : (
        <>
          {/* AVAILABLE ROOMS */}
          <section className="availability-heading">
            <h2>
              {checkIn && checkOut
                ? `🟢 Available Rooms (${availableRooms.length})`
                : "All Rooms & Suites"}
            </h2>
          </section>

          <section className="rooms-list">
            {availableRooms.map((room) => renderRoomCard(room, false))}
          </section>

          {/* UNAVAILABLE ROOMS */}
          {checkIn && checkOut && bookedRooms.length > 0 && (
            <>
              <section className="availability-heading unavailable-heading">
                <h2>🔴 Currently Booked ({bookedRooms.length})</h2>
                <p>These rooms have active reservations during your selected dates.</p>
              </section>

              <section className="rooms-list">
                {bookedRooms.map((room) => renderRoomCard(room, true))}
              </section>
            </>
          )}
        </>
      )}

      {/* ENDING */}
      <section className="rooms-ending">
        <p>THE RIVERSIDE TREAT</p>
        <h2>A stay that will always stay with you.</h2>
      </section>
    </div>
  );
}

export default Rooms;
