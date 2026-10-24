
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../services/api";
import { normalizeFacility } from "../data/facilityConfig";
import "./facilities.css";

import banquetImg from "../assets/event hall.jpg";
import kidsPlayImg from "../assets/kids area.jpg";
import spaImg from "../assets/Spa.webp";
import boatRideImg from "../assets/boat ride.jpg";
import businessCenterImg from "../assets/meeting room fac.jpg";
import poolImg from "../assets/swim pool fac.jpg";
import fineDiningImg from "../assets/fine dine.jpg";
import gardenImg from "../assets/garden_area.jpg";
import gymImg from "../assets/gym facility.webp";
import riversideCafeImg from "../assets/riverside cafe.jpg";

const facilityImageMap = {
  "Swimming Pool": poolImg,
  "Spa & Wellness": spaImg,
  "Gym & Fitness Studio": gymImg,
  "Boat Ride": boatRideImg,
  "Banquet / Event Hall": banquetImg,
  "Fine Dining Restaurant": fineDiningImg,
  "Riverside Café": riversideCafeImg,
  "Kids Play Area": kidsPlayImg,
  "Garden / Outdoor Seating": gardenImg,
  "Business Center": businessCenterImg,
};

const facilityDisplayOrder = [
  "Swimming Pool", "Gym & Fitness Studio", "Spa & Wellness",
  "Kids Play Area", "Garden / Outdoor Seating", "Boat Ride",
  "Fine Dining Restaurant", "Riverside Café", "Business Center",
  "Banquet / Event Hall",
];

const today = () => new Date().toISOString().split("T")[0];

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [pendingTableSlot, setPendingTableSlot] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today());
  const [slotData, setSlotData] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  async function loadFacilities() {
    try {
      setLoading(true);
      const res = await api.getFacilities();
      if (res.success) setFacilities(res.facilities.map(normalizeFacility));
    } catch (err) {
      console.error("Error loading facilities:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFacilities();
  }, []);

  async function fetchSlots(id, date) {
    try {
      setSlotsLoading(true);
      const res = await api.getFacilityAvailability(id, date);
      if (res.success) setSlotData(res);
    } catch (err) {
      console.error("Error loading slots:", err);
    } finally {
      setSlotsLoading(false);
    }
  }

  function handleOpenSlots(facility) {
    setSelectedFacility(facility);
    setPendingTableSlot(
      facility.name === "Riverside Café" ? { slot: "All Day" } : null
    );
    setSelectedTable(null);

    if (facility.isAllDayBooking) {
      setSlotData(null);
      return;
    }
    void fetchSlots(facility._id, selectedDate);
  }

  function handleDateChange(date) {
    setSelectedDate(date);
    if (selectedFacility) void fetchSlots(selectedFacility._id, date);
  }

  function handleBookSlot(facility, slot, tableNumber = null) {
    navigate("/booking", {
      state: {
        facility,
        date: selectedDate,
        timeSlot: slot.slot,
        tableNumber,
        bookingType: "facility",
      },
    });
  }

  const filteredFacilities = facilities
    .filter((f) =>
      activeTab === "addon" ? f.isRoomAddon :
      activeTab === "separate" ? f.isSeparateBooking : true
    )
    .sort((a, b) =>
      facilityDisplayOrder.indexOf(a.name) - facilityDisplayOrder.indexOf(b.name)
    );

  return (
    <div className="facilities-page">
      <Navbar />

      <section className="facilities-header">
        <div className="facilities-header-content">
          <p>EXPERIENCES & WELLNESS</p>
          <h1>Hotel Facilities & Services</h1>
          <span>Indulge in holistic relaxation, riverside leisure, and premier banquet amenities</span>
        </div>
      </section>

      <section className="facilities-intro">
        <span className="intro-subtitle">CURATED AMENITIES</span>
        <h2>Designed for Complete Comfort</h2>
        <div className="intro-divider" />
        <p>
          Whether enhancing your room stay with complimentary and premium add-ons or reserving our
          exclusive spa, pool sessions, and banquet halls, enjoy world-class facilities managed
          with seamless real-time capacity tracking.
        </p>

        <div className="facility-filter-tabs">
          {[
            ["all", `All Amenities (${facilities.length})`],
            ["addon", "🛏️ Room Add-ons (Selectable at Booking)"],
            ["separate", "📅 Independent Bookings & Slots"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="facilities-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading hotel facilities & real-time schedules...</p>
          </div>
        ) : (
          <div className="facilities-grid">
            {filteredFacilities.map((f) => (
              <div className="facility-card" key={f._id}>
                <div className="facility-img-wrap">
                  <img src={facilityImageMap[f.name] || poolImg} alt={f.name} />
                </div>

                <div className="facility-card-body">
                  <h3>{f.name}</h3>
                  <p className="facility-desc">{f.description}</p>

                  {(!f.hidePrice || !f.hideCapacity) && (
                    <div className="facility-meta">
                      {!f.hidePrice && (
                        <div className="meta-item">
                          <span>Pricing:</span>
                          <strong>
                            {f.price === 0
                              ? f.pricingType === "as_per_order" ? "As per your order" : "Complimentary"
                              : `₹${f.price?.toLocaleString()} ${f.pricingType === "per_slot" ? "/ slot" : "/ person"}`}
                          </strong>
                        </div>
                      )}
                      {!f.hideCapacity && (
                        <div className="meta-item">
                          <span>Max Capacity:</span>
                          <strong>{f.capacity} guests</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {f.availabilityLabel && (
                    <div className="availability-bar">{f.availabilityLabel}</div>
                  )}

                  <div className="facility-actions">
                    <button
                      type="button"
                      className={f.isSeparateBooking ? "btn-check-slots" : "btn-addon-info"}
                      onClick={() => f.isSeparateBooking ? handleOpenSlots(f) : navigate("/rooms")}
                    >
                      {f.isSeparateBooking
                        ? f.tableBooking ? "Book Table"
                          : f.name === "Garden / Outdoor Seating" ? "Complimentary" : "Book Now"
                        : "Book Now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedFacility && (
        <div className="slots-modal-overlay" onClick={() => setSelectedFacility(null)}>
          <div className="slots-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFacility(null)}>✕</button>

            <div className="modal-header">
              <span className="modal-badge">DYNAMIC SLOT SYSTEM</span>
              <h2>{selectedFacility.name}</h2>
            </div>

            {!["Garden / Outdoor Seating", "Riverside Café"].includes(selectedFacility.name) && (
              <div className="date-picker-bar">
                <label>Select Date:</label>
                <input type="date" value={selectedDate} min={today()}
                  onChange={(e) => handleDateChange(e.target.value)} />
              </div>
            )}

            {pendingTableSlot ? (
              <div className="table-selection-panel">
                <h3>Select Your Table</h3>
                <p>Available tables</p>
                <div className="table-selection-grid">
                  {selectedFacility.availableTables.map((table) => (
                    <button type="button" key={table}
                      className={`table-choice ${selectedTable === table ? "selected" : ""}`}
                      onClick={() => setSelectedTable(table)}>
                      Table {table}
                    </button>
                  ))}
                </div>
                <button type="button" className="btn-reserve-slot" disabled={!selectedTable}
                  onClick={() => handleBookSlot(selectedFacility, pendingTableSlot, selectedTable)}>
                  Book Selected Table
                </button>
              </div>
            ) : selectedFacility.isAllDayBooking ? (
              <div className="slot-card slot-avail">
                <div className="slot-time">
                  {selectedFacility.availabilityLabel || "Full-day reservation"}
                </div>
                <div className="slot-status-pill">Available for the selected date</div>
                {selectedFacility.name !== "Garden / Outdoor Seating" && (
                  <button type="button" className="btn-reserve-slot"
                    onClick={() => handleBookSlot(selectedFacility, { slot: "All Day" })}>
                    Reserve for This Day
                  </button>
                )}
              </div>
            ) : slotsLoading ? (
              <div className="slots-loading">
                <div className="spinner" />
                <p>Querying real-time slot occupancy...</p>
              </div>
            ) : slotData?.slots ? (
              <div className="slots-grid">
                {slotData.slots.map((slot, index) => {
                  const full = slot.status === "Fully booked";
                  const limited = slot.status === "Limited availability";
                  const statusClass = full ? "slot-full" : limited ? "slot-limited" : "slot-avail";
                  const statusText = full ? "🔴 FULL" : limited
                    ? `🟡 ${slot.available}/${slot.capacity} limited`
                    : `🟢 ${slot.available}/${slot.capacity} available`;

                  return (
                    <div className={`slot-card ${statusClass}`} key={index}>
                      <div className="slot-time">⏰ {slot.slot}</div>
                      <div className="slot-status-pill">{statusText}</div>
                      <button type="button" disabled={slot.isFull} className="btn-reserve-slot"
                        onClick={() => selectedFacility.tableBooking
                          ? (setPendingTableSlot(slot), setSelectedTable(null))
                          : handleBookSlot(selectedFacility, slot)}>
                        {slot.isFull ? "Fully Booked"
                          : selectedFacility.tableBooking ? "Select Time Slot" : "Reserve Slot"}
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

      <footer className="facilities-footer-cta">
        <h2>Looking for Custom Celebrations or Corporate Banquets?</h2>
        <p>Contact our concierge desk directly at +91 98765 43210 for personalized packages.</p>
      </footer>
    </div>
  );
}

export default Facilities;
