import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { api } from "../services/api";
import "./profile.css";

function Profile() {
  const [activeTab, setActiveTab] = useState("roomBookings");
  const [user, setUser] = useState(null);
  const [roomBookings, setRoomBookings] = useState([]);
  const [facilityBookings, setFacilityBookings] = useState([]);
  const [foodOrders, setFoodOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Edit profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [userRes, roomsRes, facRes, ordersRes] = await Promise.all([
        api.getCurrentUser(),
        api.getMyBookings(),
        api.getMyFacilityBookings(),
        api.getMyFoodOrders(),
      ]);

      if (userRes.success) {
        setUser(userRes.user);
        setName(userRes.user.name || "");
        setPhone(userRes.user.phone || "");
      }

      if (roomsRes.success) setRoomBookings(roomsRes.bookings);
      if (facRes.success) setFacilityBookings(facRes.bookings);
      if (ordersRes.success) setFoodOrders(ordersRes.orders);
    } catch (err) {
      console.error("Error loading customer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile({ name, phone });
      if (res.success) {
        setProfileMessage("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(res.user));
        setUser(res.user);
      }
    } catch (err) {
      setProfileMessage(err.message || "Failed to update profile.");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you wish to cancel this reservation?")) return;
    try {
      const res = await api.cancelBooking(bookingId);
      if (res.success) {
        alert("Booking cancelled successfully.");
        loadProfileData();
      }
    } catch (err) {
      alert(err.message || "Cancellation failed.");
    }
  };

  const handleCancelFacility = async (bookingId) => {
    if (!window.confirm("Are you sure you wish to cancel this facility slot?")) return;
    try {
      const res = await api.cancelFacilityBooking(bookingId);
      if (res.success) {
        alert("Facility booking cancelled.");
        loadProfileData();
      }
    } catch (err) {
      alert(err.message || "Cancellation failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="profile-page">
      <Navbar />

      {/* HEADER HERO */}
      <section className="profile-header">
        <div className="profile-header-content">
          <div className="avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
          </div>
          <div className="profile-titles">
            <h1>{user?.name || "Valued Guest"}</h1>
            <p>✉️ {user?.email} • 📞 {user?.phone || "No phone registered"}</p>
            <span className="guest-badge">🌟 Preferred Riverside Guest</span>
          </div>
          <button onClick={handleLogout} className="btn-profile-logout">
            Log Out
          </button>
        </div>
      </section>

      <div className="profile-container">
        {/* TAB NAVIGATION */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "roomBookings" ? "active" : ""}`}
            onClick={() => setActiveTab("roomBookings")}
          >
            🛏️ Stay Bookings ({roomBookings.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "facilityBookings" ? "active" : ""}`}
            onClick={() => setActiveTab("facilityBookings")}
          >
            🏊 Facility Reservations ({facilityBookings.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "foodOrders" ? "active" : ""}`}
            onClick={() => setActiveTab("foodOrders")}
          >
            🍽️ Dining Orders ({foodOrders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Account Details
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Retrieving your reservation history...</p>
          </div>
        ) : (
          <div className="tab-content-panel">
            {/* TAB 1: ROOM BOOKINGS */}
            {activeTab === "roomBookings" && (
              <div className="bookings-tab">
                {roomBookings.length === 0 ? (
                  <div className="empty-tab-state">
                    <h3>No Room Bookings Found</h3>
                    <p>You have not made any room reservations yet.</p>
                    <Link to="/rooms" className="btn-action-cta">
                      Explore Rooms & Suites
                    </Link>
                  </div>
                ) : (
                  <div className="bookings-grid">
                    {roomBookings.map((b) => (
                      <div className="reservation-card" key={b._id}>
                        <div className="card-top-bar">
                          <span className="res-id">ID: <strong>{b.bookingId}</strong></span>
                          <span className={`status-badge status-${b.bookingStatus.toLowerCase()}`}>
                            {b.bookingStatus}
                          </span>
                        </div>

                        <div className="res-main-info">
                          <h3>{b.roomName}</h3>
                          <p className="res-room-num">Room Allocation: <strong>#{b.roomNumber || "Assigned on arrival"}</strong></p>

                          <div className="res-dates-box">
                            <div>
                              <small>CHECK-IN</small>
                              <strong>{new Date(b.checkIn).toLocaleDateString()}</strong>
                            </div>
                            <span className="arrow-sep">→</span>
                            <div>
                              <small>CHECK-OUT</small>
                              <strong>{new Date(b.checkOut).toLocaleDateString()}</strong>
                            </div>
                          </div>

                          {b.selectedFacilities?.length > 0 && (
                            <div className="res-addons-list">
                              <span>Bundled Add-ons:</span>
                              {b.selectedFacilities.map((f, i) => (
                                <span className="addon-tag" key={i}>
                                  ✓ {f.name} (₹{f.price})
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="res-pricing-row">
                            <span>Total Bill ({b.paymentMethod}):</span>
                            <strong className="res-total">₹{b.totalAmount?.toLocaleString()}</strong>
                          </div>

                          <div className="res-pay-status">
                            <span>Payment Status:</span>
                            <strong className={b.paymentStatus === "Paid" ? "paid-text" : "pending-text"}>
                              {b.paymentStatus === "Paid" ? "✓ Paid in Full" : "⏳ Pay at Reception"}
                            </strong>
                          </div>
                        </div>

                        <div className="res-actions">
                          <button
                            type="button"
                            className="btn-view-qr"
                            onClick={() => setSelectedTicket({ type: "room", data: b })}
                          >
                            📱 View Digital Pass / QR
                          </button>
                          {b.bookingStatus === "Confirmed" && (
                            <button
                              type="button"
                              className="btn-cancel-res"
                              onClick={() => handleCancelBooking(b._id)}
                            >
                              Cancel Stay
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FACILITY BOOKINGS */}
            {activeTab === "facilityBookings" && (
              <div className="bookings-tab">
                {facilityBookings.length === 0 ? (
                  <div className="empty-tab-state">
                    <h3>No Facility Bookings Found</h3>
                    <p>Reserve our riverside spa, infinity pool, gym, or banquet facilities.</p>
                    <Link to="/facilities" className="btn-action-cta">
                      View Amenities & Book Slots
                    </Link>
                  </div>
                ) : (
                  <div className="bookings-grid">
                    {facilityBookings.map((fb) => (
                      <div className="reservation-card" key={fb._id}>
                        <div className="card-top-bar">
                          <span className="res-id">ID: <strong>{fb.facilityBookingId}</strong></span>
                          <span className={`status-badge status-${fb.bookingStatus.toLowerCase()}`}>
                            {fb.bookingStatus}
                          </span>
                        </div>

                        <div className="res-main-info">
                          <h3>{fb.facilityName}</h3>
                          <div className="res-dates-box">
                            <div>
                              <small>RESERVED DATE</small>
                              <strong>{fb.date}</strong>
                            </div>
                            <span className="arrow-sep">•</span>
                            <div>
                              <small>SLOT</small>
                              <strong>{fb.timeSlot}</strong>
                            </div>
                          </div>

                          <p className="res-room-num">Guests: <strong>{fb.numberOfPeople} Person(s)</strong></p>

                          <div className="res-pricing-row">
                            <span>Total Amount ({fb.paymentMethod}):</span>
                            <strong className="res-total">₹{fb.totalAmount?.toLocaleString()}</strong>
                          </div>
                        </div>

                        <div className="res-actions">
                          <button
                            type="button"
                            className="btn-view-qr"
                            onClick={() => setSelectedTicket({ type: "facility", data: fb })}
                          >
                            📱 View Slot Pass / QR
                          </button>
                          {fb.bookingStatus === "Confirmed" && (
                            <button
                              type="button"
                              className="btn-cancel-res"
                              onClick={() => handleCancelFacility(fb._id)}
                            >
                              Cancel Slot
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FOOD ORDERS */}
            {activeTab === "foodOrders" && (
              <div className="orders-tab">
                {foodOrders.length === 0 ? (
                  <div className="empty-tab-state">
                    <h3>No Food Orders Placed</h3>
                    <p>Order fresh culinary specialties and room service from our kitchen.</p>
                    <Link to="/restaurant" className="btn-action-cta">
                      Order Food Online
                    </Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {foodOrders.map((ord) => (
                      <div className="order-history-card" key={ord._id}>
                        <div className="order-card-header">
                          <div>
                            <h4>Order #{ord.orderId}</h4>
                            <small>{new Date(ord.createdAt).toLocaleString()} • Dest: {ord.roomNumber}</small>
                          </div>
                          <span className={`order-status-tag status-${ord.orderStatus.toLowerCase()}`}>
                            {ord.orderStatus}
                          </span>
                        </div>

                        {/* LIVE PROGRESS STATUS BAR */}
                        <div className="order-progress-stepper">
                          <span className={["New", "Preparing", "Ready", "Delivered"].includes(ord.orderStatus) ? "step-dot active" : "step-dot"}>1. New</span>
                          <span className={["Preparing", "Ready", "Delivered"].includes(ord.orderStatus) ? "step-dot active" : "step-dot"}>2. Preparing</span>
                          <span className={["Ready", "Delivered"].includes(ord.orderStatus) ? "step-dot active" : "step-dot"}>3. Ready</span>
                          <span className={ord.orderStatus === "Delivered" ? "step-dot active" : "step-dot"}>4. Delivered</span>
                        </div>

                        <div className="order-items-table">
                          {ord.items.map((it, idx) => (
                            <div className="order-item-line" key={idx}>
                              <span>{it.quantity}x {it.name}</span>
                              <strong>₹{(it.price * it.quantity).toLocaleString()}</strong>
                            </div>
                          ))}
                        </div>

                        <div className="order-card-footer">
                          <span>Payment ({ord.paymentMethod}): <strong>{ord.paymentStatus}</strong></span>
                          <strong className="order-grand-total">Total: ₹{ord.totalAmount?.toLocaleString()}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ACCOUNT SETTINGS */}
            {activeTab === "settings" && (
              <div className="settings-tab">
                <form onSubmit={handleUpdateProfile} className="settings-form">
                  <h3>Guest Profile Details</h3>
                  {profileMessage && (
                    <div className="profile-alert">{profileMessage}</div>
                  )}

                  <div className="input-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-field">
                    <label>Email Address</label>
                    <input type="email" value={user?.email || ""} disabled />
                    <small>Email address cannot be modified.</small>
                  </div>

                  <div className="input-field">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <button type="submit" className="btn-save-profile">
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR TICKET MODAL */}
      {selectedTicket && (
        <div className="ticket-modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTicket(null)}>✕</button>

            <div className="ticket-modal-header">
              <span className="hotel-title">THE RIVERSIDE TREAT</span>
              <h2>Digital Verification Pass</h2>
            </div>

            <div className="ticket-modal-body">
              <QRCodeDisplay
                value={selectedTicket.data.qrCodeData || selectedTicket.data.bookingId || selectedTicket.data.facilityBookingId}
                size={180}
                title="VERIFICATION QR"
              />

              <div className="ticket-modal-info">
                <p>Ref: <strong>{selectedTicket.data.bookingId || selectedTicket.data.facilityBookingId}</strong></p>
                <p>Guest: <strong>{selectedTicket.data.guestName}</strong></p>
                {selectedTicket.type === "room" ? (
                  <>
                    <p>Room: <strong>{selectedTicket.data.roomName} (#{selectedTicket.data.roomNumber})</strong></p>
                    <p>Dates: <strong>{new Date(selectedTicket.data.checkIn).toLocaleDateString()} to {new Date(selectedTicket.data.checkOut).toLocaleDateString()}</strong></p>
                  </>
                ) : (
                  <>
                    <p>Facility: <strong>{selectedTicket.data.facilityName}</strong></p>
                    <p>Slot: <strong>{selectedTicket.data.date} ({selectedTicket.data.timeSlot})</strong></p>
                  </>
                )}
                <p>Total: <strong>₹{selectedTicket.data.totalAmount?.toLocaleString()}</strong></p>
                <p>Status: <strong className="paid-text">{selectedTicket.data.paymentStatus}</strong></p>
              </div>
            </div>

            <button type="button" onClick={() => window.print()} className="btn-ticket-print">
              Print Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;