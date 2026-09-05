import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { api } from "../services/api";
import "./booking.css";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  // Route state parameters
  const state = location.state || {};
  const [bookingMode, setBookingMode] = useState(
    state.bookingType === "facility" ? "facility" : "room"
  );

  // Available options
  const [allRooms, setAllRooms] = useState([]);
  const [allFacilities, setAllFacilities] = useState([]);
  const [roomAddons, setRoomAddons] = useState([]);

  // Selected Room fields
  const [selectedRoomId, setSelectedRoomId] = useState(
    state.room?._id || ""
  );
  const [checkIn, setCheckIn] = useState(
    state.checkIn || new Date().toISOString().split("T")[0]
  );
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkOut, setCheckOut] = useState(
    state.checkOut || tomorrow.toISOString().split("T")[0]
  );
  const [guestsCount, setGuestsCount] = useState(state.guests || 2);
  const [selectedAddons, setSelectedAddons] = useState({});

  // Selected Facility fields
  const [selectedFacilityId, setSelectedFacilityId] = useState(
    state.facility?._id || ""
  );
  const [facilityDate, setFacilityDate] = useState(
    state.date || new Date().toISOString().split("T")[0]
  );
  const [facilityTimeSlot, setFacilityTimeSlot] = useState(
    state.timeSlot || ""
  );
  const [facilityPeople, setFacilityPeople] = useState(1);
  const [facilitySlotStatus, setFacilitySlotStatus] = useState(null);

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("aarav@okhdfcbank");
  const [cardData, setCardData] = useState({
    number: "4532 8910 2341 9021",
    name: "Aarav Sharma",
    expiry: "12/28",
    cvv: "821",
  });

  // Flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Load initial options from backend
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [roomsRes, facilitiesRes] = await Promise.all([
          api.getRooms(),
          api.getFacilities(),
        ]);

        if (roomsRes.success) {
          setAllRooms(roomsRes.rooms);
          if (!selectedRoomId && roomsRes.rooms.length > 0) {
            setSelectedRoomId(roomsRes.rooms[0]._id);
          }
        }

        if (facilitiesRes.success) {
          setAllFacilities(facilitiesRes.facilities);
          const eligibleAddons = facilitiesRes.facilities.filter(
            (f) => f.isRoomAddon
          );
          setRoomAddons(eligibleAddons);

          if (!selectedFacilityId && facilitiesRes.facilities.length > 0) {
            const firstSep = facilitiesRes.facilities.find((f) => f.isSeparateBooking);
            if (firstSep) {
              setSelectedFacilityId(firstSep._id);
              if (!facilityTimeSlot && firstSep.timeSlots?.length > 0) {
                setFacilityTimeSlot(firstSep.timeSlots[0]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading booking prerequisites:", err);
      }
    };

    loadInitialData();
  }, []);

  // Update dynamic facility slot status when facility, date, or slot changes
  useEffect(() => {
    if (bookingMode === "facility" && selectedFacilityId && facilityDate) {
      const checkSlotCapacity = async () => {
        try {
          const res = await api.getFacilityAvailability(selectedFacilityId, facilityDate);
          if (res.success && res.slots) {
            const currentSlot = res.slots.find((s) => s.slot === facilityTimeSlot);
            setFacilitySlotStatus(currentSlot || null);
          }
        } catch (err) {
          console.error("Slot capacity error:", err);
        }
      };
      checkSlotCapacity();
    }
  }, [bookingMode, selectedFacilityId, facilityDate, facilityTimeSlot]);

  // Calculations for Room Booking
  const selectedRoom = allRooms.find((r) => r._id === selectedRoomId);
  const calcNights = () => {
    if (!checkIn || !checkOut) return 1;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };
  const nights = calcNights();
  const roomPricePerNight = selectedRoom ? selectedRoom.price : 0;
  const roomTotal = roomPricePerNight * nights;

  let addonsTotal = 0;
  const chosenAddonsList = [];
  Object.keys(selectedAddons).forEach((addonId) => {
    if (selectedAddons[addonId]) {
      const addon = roomAddons.find((a) => a._id === addonId);
      if (addon) {
        addonsTotal += addon.price;
        chosenAddonsList.push({
          facilityId: addon._id,
          name: addon.name,
          price: addon.price,
        });
      }
    }
  });
  const roomGrandTotal = roomTotal + addonsTotal;

  // Calculations for Separate Facility Booking
  const selectedFacility = allFacilities.find((f) => f._id === selectedFacilityId);
  const facilityGrandTotal = selectedFacility
    ? selectedFacility.pricingType === "per_slot"
      ? selectedFacility.price
      : selectedFacility.price * (facilityPeople || 1)
    : 0;

  // Handle Addon Toggle
  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };

  // Submit Room Booking
  const handleRoomBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login or register to complete your reservation.");
      navigate("/login", { state: { from: "/booking" } });
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMessage("Check-out date must be after check-in date.");
      return;
    }

    try {
      setIsProcessing(true);
      const payload = {
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        guests: guestsCount,
        selectedFacilities: chosenAddonsList,
        paymentMethod,
      };

      const res = await api.createRoomBooking(payload);
      if (res.success) {
        setConfirmedBooking({
          type: "room",
          data: res.booking,
        });
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to process room booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Facility Booking
  const handleFacilityBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login or register to reserve hotel facilities.");
      navigate("/login", { state: { from: "/booking" } });
      return;
    }

    if (!facilityTimeSlot) {
      setErrorMessage("Please select an available time slot.");
      return;
    }

    try {
      setIsProcessing(true);
      const payload = {
        facilityId: selectedFacilityId,
        date: facilityDate,
        timeSlot: facilityTimeSlot,
        numberOfPeople: facilityPeople,
        paymentMethod,
      };

      const res = await api.createFacilityBooking(payload);
      if (res.success) {
        setConfirmedBooking({
          type: "facility",
          data: res.booking,
        });
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to book facility.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="booking-page">
      <Navbar />

      {/* HEADER BANNER */}
      <section className="booking-header">
        <div className="booking-header-content">
          <p>RESERVATION PORTAL</p>
          <h1>Complete Your Reservation</h1>
          <span>One seamless, verified booking flow for Riverside stays and hotel amenities</span>
        </div>
      </section>

      <div className="booking-main-container">
        {/* SUCCESS CONFIRMATION RECEIPT */}
        {confirmedBooking ? (
          <div className="confirmation-card">
            <div className="confirmation-header">
              <span className="success-icon">✓</span>
              <h2>Reservation Confirmed!</h2>
              <p className="conf-subtitle">
                A digital reservation has been created with real-time room & slot assignment.
              </p>
            </div>

            <div className="ticket-body">
              <div className="ticket-details">
                <div className="ticket-row">
                  <span>Booking Reference:</span>
                  <strong>
                    {confirmedBooking.type === "room"
                      ? confirmedBooking.data.bookingId
                      : confirmedBooking.data.facilityBookingId}
                  </strong>
                </div>

                <div className="ticket-row">
                  <span>Guest Name:</span>
                  <strong>{confirmedBooking.data.guestName}</strong>
                </div>

                {confirmedBooking.type === "room" ? (
                  <>
                    <div className="ticket-row">
                      <span>Room & Number:</span>
                      <strong>{confirmedBooking.data.roomName} (Room #{confirmedBooking.data.roomNumber})</strong>
                    </div>
                    <div className="ticket-row">
                      <span>Dates:</span>
                      <strong>
                        {new Date(confirmedBooking.data.checkIn).toLocaleDateString()} →{" "}
                        {new Date(confirmedBooking.data.checkOut).toLocaleDateString()} ({nights} Nights)
                      </strong>
                    </div>
                    {confirmedBooking.data.selectedFacilities?.length > 0 && (
                      <div className="ticket-row">
                        <span>Included Add-ons:</span>
                        <strong>
                          {confirmedBooking.data.selectedFacilities.map((f) => f.name).join(", ")}
                        </strong>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="ticket-row">
                      <span>Facility Reserved:</span>
                      <strong>{confirmedBooking.data.facilityName}</strong>
                    </div>
                    <div className="ticket-row">
                      <span>Date & Time Slot:</span>
                      <strong>
                        {confirmedBooking.data.date} at {confirmedBooking.data.timeSlot}
                      </strong>
                    </div>
                    <div className="ticket-row">
                      <span>Party Size:</span>
                      <strong>{confirmedBooking.data.numberOfPeople} Guest(s)</strong>
                    </div>
                  </>
                )}

                <div className="ticket-row">
                  <span>Payment Method:</span>
                  <strong>{confirmedBooking.data.paymentMethod}</strong>
                </div>

                <div className="ticket-row">
                  <span>Payment Status:</span>
                  <strong className={confirmedBooking.data.paymentStatus === "Paid" ? "status-paid" : "status-pending"}>
                    {confirmedBooking.data.paymentStatus === "Paid" ? "● Confirmed & Paid" : "● Pay at Reception"}
                  </strong>
                </div>

                <div className="ticket-divider"></div>

                <div className="ticket-row ticket-total">
                  <span>Total Amount:</span>
                  <strong>₹{confirmedBooking.data.totalAmount?.toLocaleString()}</strong>
                </div>
              </div>

              {/* Digital QR Code */}
              <div className="ticket-qr-section">
                <QRCodeDisplay
                  value={confirmedBooking.data.qrCodeData || confirmedBooking.data.bookingId}
                  size={160}
                  title="DIGITAL ENTRY PASS"
                />
                <p className="qr-hint">Scan at Reception or Facility Entrance</p>
              </div>
            </div>

            <div className="confirmation-actions">
              <Link to="/profile" className="btn-conf-profile">
                View in My Profile & History
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-conf-print"
              >
                Print Digital Receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null);
                  navigate("/rooms");
                }}
                className="btn-conf-new"
              >
                Book Another Stay
              </button>
            </div>
          </div>
        ) : (
          /* BOOKING FORM */
          <div className="booking-grid">
            {/* LEFT COLUMN: FORM DETAILS */}
            <div className="booking-form-card">
              {/* MODE SWITCHER */}
              <div className="mode-switcher">
                <button
                  type="button"
                  className={`mode-btn ${bookingMode === "room" ? "active" : ""}`}
                  onClick={() => setBookingMode("room")}
                >
                  🛏️ Stay / Room Booking
                </button>
                <button
                  type="button"
                  className={`mode-btn ${bookingMode === "facility" ? "active" : ""}`}
                  onClick={() => setBookingMode("facility")}
                >
                  🏊 Separate Facility Reservation
                </button>
              </div>

              {errorMessage && (
                <div className="booking-error-alert">{errorMessage}</div>
              )}

              {bookingMode === "room" ? (
                /* ROOM BOOKING FLOW */
                <form onSubmit={handleRoomBookingSubmit} className="flow-form">
                  <div className="form-section">
                    <h3>1. Select Your Room</h3>
                    <div className="input-field">
                      <label>Choose Room Category</label>
                      <select
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        required
                      >
                        {allRooms.map((room) => (
                          <option key={room._id} value={room._id}>
                            {room.name} (Room #{room.roomNumber}) — ₹{room.price?.toLocaleString()} / night
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid-2-col">
                      <div className="input-field">
                        <label>Check-in Date</label>
                        <input
                          type="date"
                          value={checkIn}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setCheckIn(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-field">
                        <label>Check-out Date</label>
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn || new Date().toISOString().split("T")[0]}
                          onChange={(e) => setCheckOut(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-field">
                      <label>Number of Guests</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* ROOM ADD-ONS */}
                  <div className="form-section">
                    <h3>2. Eligible Room Add-ons (Optional)</h3>
                    <p className="section-hint">
                      Selected facilities will automatically be bundled into your hotel stay.
                    </p>

                    <div className="addons-list">
                      {roomAddons.map((addon) => (
                        <label
                          key={addon._id}
                          className={`addon-item ${selectedAddons[addon._id] ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(selectedAddons[addon._id])}
                            onChange={() => toggleAddon(addon._id)}
                          />
                          <div className="addon-info">
                            <strong>{addon.name}</strong>
                            <small>{addon.description}</small>
                          </div>
                          <span className="addon-price">
                            + ₹{addon.price?.toLocaleString()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* PAYMENT METHOD */}
                  <div className="form-section">
                    <h3>3. Select Payment Option</h3>
                    <div className="payment-options-grid">
                      <label className={`payment-pill ${paymentMethod === "UPI" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="UPI"
                          checked={paymentMethod === "UPI"}
                          onChange={() => setPaymentMethod("UPI")}
                        />
                        <span>📱 Instant UPI (GPay/PhonePe/Paytm)</span>
                      </label>

                      <label className={`payment-pill ${paymentMethod === "Card" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="Card"
                          checked={paymentMethod === "Card"}
                          onChange={() => setPaymentMethod("Card")}
                        />
                        <span>💳 Debit / Credit Card</span>
                      </label>

                      <label className={`payment-pill ${paymentMethod === "Cash at Reception" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="Cash at Reception"
                          checked={paymentMethod === "Cash at Reception"}
                          onChange={() => setPaymentMethod("Cash at Reception")}
                        />
                        <span>💵 Pay Cash at Reception Desk</span>
                      </label>
                    </div>

                    {/* PAYMENT INPUT SIMULATOR */}
                    {paymentMethod === "UPI" && (
                      <div className="payment-simulator-box">
                        <label>Enter UPI Virtual Payment Address (VPA):</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          required
                        />
                        <span className="secure-badge">🔒 256-Bit Encrypted Riverside Payment Gateway</span>
                      </div>
                    )}

                    {paymentMethod === "Card" && (
                      <div className="payment-simulator-box">
                        <div className="input-field">
                          <label>Cardholder Full Name</label>
                          <input
                            type="text"
                            value={cardData.name}
                            onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="input-field">
                          <label>Card Number</label>
                          <input
                            type="text"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid-2-col">
                          <div className="input-field">
                            <label>Valid Thru (MM/YY)</label>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                              required
                            />
                          </div>
                          <div className="input-field">
                            <label>CVV / CVC</label>
                            <input
                              type="password"
                              maxLength="4"
                              value={cardData.cvv}
                              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-submit-booking"
                  >
                    {isProcessing ? "Verifying & Reserving Room..." : `Confirm & Pay ₹${roomGrandTotal?.toLocaleString()}`}
                  </button>
                </form>
              ) : (
                /* SEPARATE FACILITY BOOKING FLOW */
                <form onSubmit={handleFacilityBookingSubmit} className="flow-form">
                  <div className="form-section">
                    <h3>1. Select Facility & Slot</h3>
                    <div className="input-field">
                      <label>Choose Facility</label>
                      <select
                        value={selectedFacilityId}
                        onChange={(e) => {
                          setSelectedFacilityId(e.target.value);
                          const fac = allFacilities.find((f) => f._id === e.target.value);
                          if (fac?.timeSlots?.length > 0) {
                            setFacilityTimeSlot(fac.timeSlots[0]);
                          }
                        }}
                        required
                      >
                        {allFacilities
                          .filter((f) => f.isSeparateBooking)
                          .map((f) => (
                            <option key={f._id} value={f._id}>
                              {f.name} — {f.price === 0 ? "Complimentary" : `₹${f.price?.toLocaleString()} (${f.pricingType})`}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="grid-2-col">
                      <div className="input-field">
                        <label>Reservation Date</label>
                        <input
                          type="date"
                          value={facilityDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setFacilityDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-field">
                        <label>Number of People</label>
                        <input
                          type="number"
                          min="1"
                          max={selectedFacility?.capacity || 20}
                          value={facilityPeople}
                          onChange={(e) => setFacilityPeople(parseInt(e.target.value, 10) || 1)}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-field">
                      <label>Available Time Slot</label>
                      <select
                        value={facilityTimeSlot}
                        onChange={(e) => setFacilityTimeSlot(e.target.value)}
                        required
                      >
                        {selectedFacility?.timeSlots?.map((slot, idx) => (
                          <option key={idx} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* LIVE DYNAMIC CAPACITY BADGE */}
                    {facilitySlotStatus && (
                      <div className="live-capacity-indicator">
                        <span>Dynamic Slot Status:</span>
                        <strong className={facilitySlotStatus.isFull ? "badge-full" : "badge-avail"}>
                          {facilitySlotStatus.isFull
                            ? "🔴 Fully Booked"
                            : `🟢 ${facilitySlotStatus.available} of ${facilitySlotStatus.capacity} spots available`}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* PAYMENT METHOD */}
                  <div className="form-section">
                    <h3>2. Payment Option</h3>
                    <div className="payment-options-grid">
                      <label className={`payment-pill ${paymentMethod === "UPI" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="UPI"
                          checked={paymentMethod === "UPI"}
                          onChange={() => setPaymentMethod("UPI")}
                        />
                        <span>📱 Instant UPI</span>
                      </label>

                      <label className={`payment-pill ${paymentMethod === "Card" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="Card"
                          checked={paymentMethod === "Card"}
                          onChange={() => setPaymentMethod("Card")}
                        />
                        <span>💳 Card</span>
                      </label>

                      <label className={`payment-pill ${paymentMethod === "Cash at Reception" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="payment"
                          value="Cash at Reception"
                          checked={paymentMethod === "Cash at Reception"}
                          onChange={() => setPaymentMethod("Cash at Reception")}
                        />
                        <span>💵 Pay at Reception</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || facilitySlotStatus?.isFull}
                    className="btn-submit-booking"
                  >
                    {isProcessing
                      ? "Verifying Slot Capacity..."
                      : facilitySlotStatus?.isFull
                      ? "Slot is Full — Select Another"
                      : `Confirm & Reserve ₹${facilityGrandTotal?.toLocaleString()}`}
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT COLUMN: PRICE BREAKDOWN SUMMARY */}
            <div className="booking-summary-card">
              <h3>Reservation Summary</h3>

              {bookingMode === "room" ? (
                <div className="summary-body">
                  <div className="summary-item">
                    <span>Room:</span>
                    <strong>{selectedRoom ? selectedRoom.name : "Select a room"}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Duration:</span>
                    <strong>{nights} Night(s)</strong>
                  </div>
                  <div className="summary-item">
                    <span>Rate:</span>
                    <strong>₹{roomPricePerNight?.toLocaleString()} / night</strong>
                  </div>
                  <div className="summary-item">
                    <span>Room Subtotal:</span>
                    <strong>₹{roomTotal?.toLocaleString()}</strong>
                  </div>

                  {chosenAddonsList.length > 0 && (
                    <div className="summary-addons">
                      <span className="addons-heading">Selected Add-ons:</span>
                      {chosenAddonsList.map((a, i) => (
                        <div key={i} className="summary-sub-item">
                          <span>+ {a.name}</span>
                          <span>₹{a.price?.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="summary-item add-ons-total">
                        <span>Add-ons Total:</span>
                        <strong>₹{addonsTotal?.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}

                  <div className="summary-divider"></div>

                  <div className="summary-item summary-grand-total">
                    <span>Total Payable:</span>
                    <strong>₹{roomGrandTotal?.toLocaleString()}</strong>
                  </div>
                </div>
              ) : (
                <div className="summary-body">
                  <div className="summary-item">
                    <span>Facility:</span>
                    <strong>{selectedFacility ? selectedFacility.name : "Select facility"}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Date:</span>
                    <strong>{facilityDate}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Time Slot:</span>
                    <strong>{facilityTimeSlot || "Select slot"}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Guests:</span>
                    <strong>{facilityPeople} person(s)</strong>
                  </div>
                  <div className="summary-item">
                    <span>Rate:</span>
                    <strong>
                      ₹{selectedFacility?.price?.toLocaleString()} ({selectedFacility?.pricingType})
                    </strong>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-item summary-grand-total">
                    <span>Total Payable:</span>
                    <strong>₹{facilityGrandTotal?.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              <div className="summary-guarantee">
                <span>🛡️ Instant Digital Confirmation</span>
                <p>Digital QR ticket issued instantly with zero booking fees.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;
