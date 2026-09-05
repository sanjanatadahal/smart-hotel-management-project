import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../services/api";
import "./facilities.css";

// Fallback images from assets
import poolImg from "../assets/swimming pool.jpg";
import lobbyImg from "../assets/lobby.jpg";
import hotelImg from "../assets/hotel.jpg";
import heroImg from "../assets/hero.png";
import banquetImg from "../assets/img 2.jpg";
import famImg from "../assets/fam 3.webp";
import gardenImg from "../assets/garden view 1.webp";
import execImg from "../assets/executive 1.webp";

const facilityImageMap = {
  "Swimming Pool": poolImg,
  "Spa & Wellness": lobbyImg,
  "Gym & Fitness Studio": hotelImg,
  "Meeting Rooms": heroImg,
  "Banquet / Event Hall": banquetImg,
  "Fine Dining Restaurant": hotelImg,
  "Riverside Café": lobbyImg,
  "Kids Play Area": famImg,
  "Garden / Outdoor Seating": gardenImg,
  "Business Center": execImg,
};

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [slotData, setSlotData] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const res = await api.getFacilities();
      if (res.success) {
        setFacilities(res.facilities);
      }
    } catch (err) {
      console.error("Error loading facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSlots = async (facility) => {
    setSelectedFacility(facility);
    fetchSlots(facility._id, selectedDate);
  };

  const fetchSlots = async (facilityId, date) => {
    try {
      setSlotsLoading(true);
      const res = await api.getFacilityAvailability(facilityId, date);
      if (res.success) {
        setSlotData(res);
      }
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (selectedFacility) {
      fetchSlots(selectedFacility._id, newDate);
    }
  };

  const handleBookSlot = (facility, slot) => {
    navigate("/booking", {
      state: {
        facility,
        date: selectedDate,
        timeSlot: slot.slot,
        bookingType: "facility",
      },
    });
  };

  const filteredFacilities = facilities.filter((f) => {
    if (activeTab === "addon") return f.isRoomAddon;
    if (activeTab === "separate") return f.isSeparateBooking;
    return true;
  });

  return (
    <div className="facilities-page">
      <Navbar />

      {/* HEADER BANNER */}
      <section className="facilities-header">
        <div className="facilities-header-content">
          <p>EXPERIENCES & WELLNESS</p>
          <h1>Hotel Facilities & Services</h1>
          <span>Indulge in holistic relaxation, riverside leisure, and premier banquet amenities</span>
        </div>
      </section>

      {/* FILTER TABS & INTRO */}
      <section className="facilities-intro">
        <span className="intro-subtitle">CURATED AMENITIES</span>
        <h2>Designed for Complete Comfort</h2>
        <div className="intro-divider"></div>
        <p>
          Whether enhancing your room stay with complimentary and premium add-ons or reserving our
          exclusive spa, pool sessions, and banquet halls, enjoy world-class facilities managed
          with seamless real-time capacity tracking.
        </p>

        <div className="facility-filter-tabs">
          <button
            className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Amenities ({facilities.length})
          </button>
          <button
            className={`filter-tab ${activeTab === "addon" ? "active" : ""}`}
            onClick={() => setActiveTab("addon")}
          >
            🛏️ Room Add-ons (Selectable at Booking)
          </button>
          <button
            className={`filter-tab ${activeTab === "separate" ? "active" : ""}`}
            onClick={() => setActiveTab("separate")}
          >
            📅 Independent Bookings & Slots
          </button>
        </div>
      </section>

      {/* FACILITIES GRID */}
      <section className="facilities-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading hotel facilities & real-time schedules...</p>
          </div>
        ) : (
          <div className="facilities-grid">
            {filteredFacilities.map((facility) => {
              const imgSource = facilityImageMap[facility.name] || poolImg;
              return (
                <div className="facility-card" key={facility._id}>
                  <div className="facility-img-wrap">
                    <img src={imgSource} alt={facility.name} />
                    <div className="facility-badges">
                      {facility.isRoomAddon && (
                        <span className="badge badge-addon">Room Add-on</span>
                      )}
                      {facility.isSeparateBooking && (
                        <span className="badge badge-separate">Dynamic Slots</span>
                      )}
                    </div>
                  </div>

                  <div className="facility-card-body">
                    <h3>{facility.name}</h3>
                    <p className="facility-desc">{facility.description}</p>

                    <div className="facility-meta">
                      <div className="meta-item">
                        <span>Pricing:</span>
                        <strong>
                          {facility.price === 0
                            ? "Complimentary"
                            : `₹${facility.price?.toLocaleString()} ${facility.pricingType === "per_slot" ? "/ slot" : "/ person"}`}
                        </strong>
                      </div>
                      <div className="meta-item">
                        <span>Max Capacity:</span>
                        <strong>{facility.capacity} guests</strong>
                      </div>
                    </div>

                    <div className="facility-actions">
                      {facility.isSeparateBooking ? (
                        <button
                          type="button"
                          className="btn-check-slots"
                          onClick={() => handleOpenSlots(facility)}
                        >
                          Check Availability & Book
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-addon-info"
                          onClick={() => navigate("/rooms")}
                        >
                          Select with Room Stay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* DYNAMIC SLOT AVAILABILITY MODAL */}
      {selectedFacility && (
        <div className="slots-modal-overlay" onClick={() => setSelectedFacility(null)}>
          <div className="slots-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFacility(null)}>
              ✕
            </button>

            <div className="modal-header">
              <span className="modal-badge">DYNAMIC SLOT SYSTEM</span>
              <h2>{selectedFacility.name}</h2>
              <p>Real-time slot capacity calculation. Double booking is strictly prevented.</p>
            </div>

            <div className="date-picker-bar">
              <label>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            {slotsLoading ? (
              <div className="slots-loading">
                <div className="spinner"></div>
                <p>Querying real-time slot occupancy...</p>
              </div>
            ) : slotData && slotData.slots ? (
              <div className="slots-grid">
                {slotData.slots.map((slot, index) => {
                  let statusClass = "slot-avail";
                  let statusText = `🟢 ${slot.available}/${slot.capacity} available`;

                  if (slot.status === "Fully booked") {
                    statusClass = "slot-full";
                    statusText = "🔴 FULL";
                  } else if (slot.status === "Limited availability") {
                    statusClass = "slot-limited";
                    statusText = `🟡 ${slot.available}/${slot.capacity} limited`;
                  }

                  return (
                    <div className={`slot-card ${statusClass}`} key={index}>
                      <div className="slot-time">⏰ {slot.slot}</div>
                      <div className="slot-status-pill">{statusText}</div>
                      <button
                        type="button"
                        disabled={slot.isFull}
                        className="btn-reserve-slot"
                        onClick={() => handleBookSlot(selectedFacility, slot)}
                      >
                        {slot.isFull ? "Fully Booked" : "Reserve Slot"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No slot schedules configured for this facility.</p>
            )}

            <div className="modal-footer">
              <p>
                💡 Hotel guests with room reservations enjoy priority entry. Separate bookings receive a digital QR ticket upon confirmation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CALLOUT */}
      <footer className="facilities-footer-cta">
        <h2>Looking for Custom Celebrations or Corporate Banquets?</h2>
        <p>Contact our concierge desk directly at +91 98765 43210 for personalized packages.</p>
      </footer>
    </div>
  );
}

export default Facilities;
