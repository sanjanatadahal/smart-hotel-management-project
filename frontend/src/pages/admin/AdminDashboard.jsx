import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import "./admin.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    roomNumber: "",
    type: "Deluxe Riverside Room",
    price: 4500,
    bed: "King Bed",
    guests: 2,
    description: "",
    status: "Available",
  });

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [foodFormData, setFoodFormData] = useState({
    name: "",
    category: "Starters",
    price: 250,
    description: "",
    isVeg: true,
    isAvailable: true,
  });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "Staff@123",
    role: "reception",
  });

  // Search & Filter state for Bookings
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");

  const navigate = useNavigate();

  async function loadAdminData() {
    try {
      setLoading(true);
      const [statsRes, roomsRes, bookingsRes, facRes, foodRes, staffRes, custRes] =
        await Promise.all([
          api.getAdminStats(),
          api.getRooms(),
          api.getAllBookings(),
          api.getFacilities(),
          api.getFoodItems(),
          api.getStaffList(),
          api.getCustomersList(),
        ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (roomsRes.success) setRooms(roomsRes.rooms);
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (facRes.success) setFacilities(facRes.facilities);
      if (foodRes.success) setFoodItems(foodRes.items);
      if (staffRes.success) setStaffList(staffRes.staff);
      if (custRes.success) setCustomers(custRes.customers);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/admin/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      alert("Access restricted to Hotel Administrators.");
      navigate("/");
      return;
    }

    void Promise.resolve().then(loadAdminData);
  }, [navigate]);

  // ROOM ACTIONS
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addRoom(roomFormData);
      if (res.success) {
        alert("Room created successfully.");
        setShowRoomModal(false);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || "Failed to create room.");
    }
  };

  const handleUpdateRoomStatus = async (roomId, newStatus) => {
    try {
      const res = await api.updateRoom(roomId, { status: newStatus });
      if (res.success) loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to update room.");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you wish to delete this room?")) return;
    try {
      const res = await api.deleteRoom(roomId);
      if (res.success) loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to delete room.");
    }
  };

  // FOOD ACTIONS
  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addFoodItem(foodFormData);
      if (res.success) {
        alert("Food item created successfully.");
        setShowFoodModal(false);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || "Failed to add food item.");
    }
  };

  const handleToggleFoodAvailable = async (itemId, currentVal) => {
    try {
      await api.updateFoodItem(itemId, { isAvailable: !currentVal });
      loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to update item.");
    }
  };

  const handleDeleteFood = async (itemId) => {
    if (!window.confirm("Remove this dish from the menu?")) return;
    try {
      await api.deleteFoodItem(itemId);
      loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to delete dish.");
    }
  };

  // STAFF ACTIONS
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createStaffAccount(staffFormData);
      if (res.success) {
        alert(res.message);
        setShowStaffModal(false);
        loadAdminData();
      }
    } catch (err) {
      alert(err.message || "Failed to create staff account.");
    }
  };

  const handleToggleStaffActive = async (staffId, currentStatus) => {
    try {
      const res = await api.updateStaffAccount(staffId, { isActive: !currentStatus });
      if (res.success) loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to update staff status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingFilter === "all" || b.bookingStatus === bookingFilter;
    const matchesSearch =
      !bookingSearch ||
      b.bookingId.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.roomNumber?.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-dashboard-page">
      {/* TOP HEADER */}
      <header className="admin-top-header">
        <div className="admin-top-left">
          <Link to="/" className="admin-logo">
            🏛️ <strong>THE RIVERSIDE TREAT</strong>
          </Link>
          <span className="admin-tag">MASTER ADMIN CONTROL</span>
        </div>

        <div className="admin-top-right">
          <Link to="/staff/dashboard" className="btn-link-staff">
            View Staff View →
          </Link>
          <button onClick={handleLogout} className="btn-admin-logout">
            Log Out
          </button>
        </div>
      </header>

      {/* ADMIN TABS NAVIGATION */}
      <nav className="admin-nav-tabs">
        <div className="admin-nav-container">
          <button
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview & Analytics
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "rooms" ? "active" : ""}`}
            onClick={() => setActiveTab("rooms")}
          >
            🛏️ Rooms ({rooms.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            📅 Bookings ({bookings.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "facilities" ? "active" : ""}`}
            onClick={() => setActiveTab("facilities")}
          >
            🏊 Facilities ({facilities.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "food" ? "active" : ""}`}
            onClick={() => setActiveTab("food")}
          >
            🍽️ Food Menu ({foodItems.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "staff" ? "active" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            👥 Staff ({staffList.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            💼 Customers ({customers.length})
          </button>
        </div>
      </nav>

      <main className="admin-main-body">
        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Gathering hotel analytics and records...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW & ANALYTICS */}
            {activeTab === "overview" && stats && (
              <div className="admin-overview-tab">
                {/* METRICS CARDS */}
                <div className="stats-cards-grid">
                  <div className="stat-card">
                    <span className="stat-icon">💰</span>
                    <div>
                      <small>Total Revenue</small>
                      <h3>₹{stats.totalRevenue?.toLocaleString()}</h3>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon">🛏️</span>
                    <div>
                      <small>Room Stays Revenue</small>
                      <h3>₹{stats.roomRevenue?.toLocaleString()}</h3>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon">🏊</span>
                    <div>
                      <small>Facilities Revenue</small>
                      <h3>₹{stats.facilityRevenue?.toLocaleString()}</h3>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon">🥘</span>
                    <div>
                      <small>Dining Orders Revenue</small>
                      <h3>₹{stats.foodRevenue?.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>

                {/* OCCUPANCY & VOLUMES */}
                <div className="stats-cards-grid secondary">
                  <div className="stat-mini-card">
                    <h4>{stats.totalRooms}</h4>
                    <span>Total Property Rooms</span>
                  </div>
                  <div className="stat-mini-card">
                    <h4 style={{ color: "#2e7d32" }}>{stats.availableRooms}</h4>
                    <span>Rooms Clean & Available</span>
                  </div>
                  <div className="stat-mini-card">
                    <h4 style={{ color: "#c62828" }}>{stats.occupiedRooms}</h4>
                    <span>Currently Occupied</span>
                  </div>
                  <div className="stat-mini-card">
                    <h4>{stats.todayBookingsCount}</h4>
                    <span>Today's Room Bookings</span>
                  </div>
                  <div className="stat-mini-card">
                    <h4>{stats.totalFacilityBookings}</h4>
                    <span>Facility Slot Reservations</span>
                  </div>
                  <div className="stat-mini-card">
                    <h4>{stats.totalFoodOrders}</h4>
                    <span>Food Orders Processed</span>
                  </div>
                </div>

                {/* RECENT BOOKINGS */}
                <div className="admin-box">
                  <h3>Recent Customer Bookings</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Guest Name</th>
                          <th>Room</th>
                          <th>Dates</th>
                          <th>Amount</th>
                          <th>Payment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b._id}>
                            <td><strong>{b.bookingId}</strong></td>
                            <td>{b.guestName}</td>
                            <td>#{b.roomNumber} ({b.roomName})</td>
                            <td>{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</td>
                            <td><strong>₹{b.totalAmount?.toLocaleString()}</strong></td>
                            <td><span className="badge-paid">{b.paymentStatus}</span></td>
                            <td><span className="status-tag">{b.bookingStatus}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROOMS MANAGEMENT */}
            {activeTab === "rooms" && (
              <div className="admin-box">
                <div className="box-header-row">
                  <div>
                    <h3>Property Rooms Inventory</h3>
                    <p className="box-subtitle">Manage room rates, bed arrangements, and active statuses</p>
                  </div>
                  <button
                    className="btn-admin-primary"
                    onClick={() => setShowRoomModal(true)}
                  >
                    + Add New Room
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Room #</th>
                        <th>Category Name</th>
                        <th>Bed Type</th>
                        <th>Capacity</th>
                        <th>Price / Night</th>
                        <th>Occupancy</th>
                        <th>Cleaning</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room) => (
                        <tr key={room._id}>
                          <td><strong>#{room.roomNumber}</strong></td>
                          <td>{room.name}</td>
                          <td>{room.bed}</td>
                          <td>{room.guests} Guests</td>
                          <td><strong>₹{room.price?.toLocaleString()}</strong></td>
                          <td>
                            <select
                              value={room.status}
                              onChange={(e) => handleUpdateRoomStatus(room._id, e.target.value)}
                              className="status-dropdown"
                            >
                              <option value="Available">Available</option>
                              <option value="Occupied">Occupied</option>
                              <option value="Maintenance">Maintenance</option>
                            </select>
                          </td>
                          <td>
                            <span className={`clean-tag tag-${room.cleaningStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                              {room.cleaningStatus}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-delete-item"
                              onClick={() => handleDeleteRoom(room._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: BOOKINGS MANAGEMENT */}
            {activeTab === "bookings" && (
              <div className="admin-box">
                <div className="box-header-row">
                  <div>
                    <h3>Reservations & Billings Log</h3>
                    <p className="box-subtitle">All stay bookings recorded across the hotel</p>
                  </div>

                  <div className="box-filters">
                    <input
                      type="text"
                      placeholder="Search ID, guest, room..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="admin-input-search"
                    />

                    <select
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value)}
                      className="admin-select"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked-in">Checked-In</option>
                      <option value="Checked-out">Checked-Out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Dates</th>
                        <th>Add-ons</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr key={b._id}>
                          <td><strong>{b.bookingId}</strong></td>
                          <td>
                            <strong>{b.guestName}</strong><br />
                            <small>{b.guestEmail}</small>
                          </td>
                          <td>Room #{b.roomNumber}</td>
                          <td>
                            {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}
                          </td>
                          <td>
                            {b.selectedFacilities?.map((f) => f.name).join(", ") || "None"}
                          </td>
                          <td><strong>₹{b.totalAmount?.toLocaleString()}</strong></td>
                          <td>
                            <span className={b.paymentStatus === "Paid" ? "badge-paid" : "badge-pending"}>
                              {b.paymentStatus} ({b.paymentMethod})
                            </span>
                          </td>
                          <td>
                            <span className="status-tag">{b.bookingStatus}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: FACILITIES MANAGEMENT */}
            {activeTab === "facilities" && (
              <div className="admin-box">
                <div className="box-header-row">
                  <div>
                    <h3>Hotel Facilities & Amenity Rules</h3>
                    <p className="box-subtitle">Set dynamic slot capacity, room add-on flags, and pricing</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Facility Name</th>
                        <th>Pricing</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Available as Room Add-on?</th>
                        <th>Separate Slots?</th>
                        <th>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilities.map((fac) => (
                        <tr key={fac._id}>
                          <td><strong>{fac.name}</strong></td>
                          <td>{fac.price === 0 ? "Complimentary" : `₹${fac.price?.toLocaleString()}`}</td>
                          <td>{fac.pricingType}</td>
                          <td><strong>{fac.capacity} guests / slot</strong></td>
                          <td>{fac.isRoomAddon ? "✓ Yes (Selectable with Stay)" : "No"}</td>
                          <td>{fac.isSeparateBooking ? "✓ Yes (Has Time Slots)" : "No"}</td>
                          <td>{fac.isActive ? "🟢 Active" : "🔴 Inactive"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: FOOD MENU MANAGEMENT */}
            {activeTab === "food" && (
              <div className="admin-box">
                <div className="box-header-row">
                  <div>
                    <h3>Restaurant & Room Dining Menu</h3>
                    <p className="box-subtitle">Manage dishes, prices, and kitchen availability</p>
                  </div>
                  <button
                    className="btn-admin-primary"
                    onClick={() => setShowFoodModal(true)}
                  >
                    + Add Dish to Menu
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Dish Name</th>
                        <th>Category</th>
                        <th>Diet</th>
                        <th>Price</th>
                        <th>Availability</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodItems.map((dish) => (
                        <tr key={dish._id}>
                          <td><strong>{dish.name}</strong></td>
                          <td>{dish.category}</td>
                          <td>{dish.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}</td>
                          <td><strong>₹{dish.price}</strong></td>
                          <td>
                            <button
                              className={`btn-toggle-avail ${dish.isAvailable ? "avail" : "unavail"}`}
                              onClick={() => handleToggleFoodAvailable(dish._id, dish.isAvailable)}
                            >
                              {dish.isAvailable ? "In Stock" : "Sold Out"}
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn-delete-item"
                              onClick={() => handleDeleteFood(dish._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: STAFF ACCOUNTS */}
            {activeTab === "staff" && (
              <div className="admin-box">
                <div className="box-header-row">
                  <div>
                    <h3>Hotel Staff Accounts</h3>
                    <p className="box-subtitle">Staff are created by administrators with role-based access</p>
                  </div>
                  <button
                    className="btn-admin-primary"
                    onClick={() => setShowStaffModal(true)}
                  >
                    + Create Staff Account
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Official Email</th>
                        <th>Contact Phone</th>
                        <th>Assigned Role</th>
                        <th>Account Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((st) => (
                        <tr key={st._id}>
                          <td><strong>{st.name}</strong></td>
                          <td>{st.email}</td>
                          <td>{st.phone || "—"}</td>
                          <td>
                            <span className={`staff-role-pill role-${st.role}`}>
                              {st.role.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span className={st.isActive ? "badge-paid" : "badge-pending"}>
                              {st.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-action-toggle"
                              onClick={() => handleToggleStaffActive(st._id, st.isActive)}
                            >
                              {st.isActive ? "Disable Access" : "Re-activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 7: CUSTOMERS LIST */}
            {activeTab === "customers" && (
              <div className="admin-box">
                <div className="box-header-row">
                  <div>
                    <h3>Customer Directory & Loyalty</h3>
                    <p className="box-subtitle">Registered guests and cumulative booking activities</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Guest Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Room Bookings</th>
                        <th>Facility Bookings</th>
                        <th>Food Orders</th>
                        <th>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c._id}>
                          <td><strong>{c.name}</strong></td>
                          <td>{c.email}</td>
                          <td>{c.phone || "—"}</td>
                          <td><strong>{c.bookingsCount || 0} stays</strong></td>
                          <td>{c.facilityBookingsCount || 0} slots</td>
                          <td>{c.foodOrdersCount || 0} orders</td>
                          <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL: ADD ROOM */}
      {showRoomModal && (
        <div className="admin-modal-overlay" onClick={() => setShowRoomModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowRoomModal(false)}>✕</button>
            <h3>Add New Property Room</h3>
            <form onSubmit={handleSaveRoom}>
              <div className="modal-input-field">
                <label>Room Category Name</label>
                <input
                  type="text"
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  placeholder="e.g. Deluxe Riverside Room"
                  required
                />
              </div>

              <div className="modal-grid-2">
                <div className="modal-input-field">
                  <label>Room Number</label>
                  <input
                    type="text"
                    value={roomFormData.roomNumber}
                    onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                    placeholder="e.g. 701"
                    required
                  />
                </div>
                <div className="modal-input-field">
                  <label>Rate per Night (₹)</label>
                  <input
                    type="number"
                    value={roomFormData.price}
                    onChange={(e) => setRoomFormData({ ...roomFormData, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="modal-grid-2">
                <div className="modal-input-field">
                  <label>Bed Configuration</label>
                  <input
                    type="text"
                    value={roomFormData.bed}
                    onChange={(e) => setRoomFormData({ ...roomFormData, bed: e.target.value })}
                    placeholder="King Bed, 2 Double Beds"
                    required
                  />
                </div>
                <div className="modal-input-field">
                  <label>Max Guests</label>
                  <input
                    type="number"
                    value={roomFormData.guests}
                    onChange={(e) => setRoomFormData({ ...roomFormData, guests: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="modal-input-field">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  placeholder="Describe room features, view, and furnishings..."
                />
              </div>

              <button type="submit" className="btn-modal-save">Save Room</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FOOD ITEM */}
      {showFoodModal && (
        <div className="admin-modal-overlay" onClick={() => setShowFoodModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowFoodModal(false)}>✕</button>
            <h3>Add Dish to Restaurant Menu</h3>
            <form onSubmit={handleSaveFood}>
              <div className="modal-input-field">
                <label>Dish Name</label>
                <input
                  type="text"
                  value={foodFormData.name}
                  onChange={(e) => setFoodFormData({ ...foodFormData, name: e.target.value })}
                  placeholder="e.g. Tandoori Stuffed Mushroom"
                  required
                />
              </div>

              <div className="modal-grid-2">
                <div className="modal-input-field">
                  <label>Category</label>
                  <select
                    value={foodFormData.category}
                    onChange={(e) => setFoodFormData({ ...foodFormData, category: e.target.value })}
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Riverside Specials">Riverside Specials</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="modal-input-field">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={foodFormData.price}
                    onChange={(e) => setFoodFormData({ ...foodFormData, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="modal-input-field">
                <label>Description</label>
                <input
                  type="text"
                  value={foodFormData.description}
                  onChange={(e) => setFoodFormData({ ...foodFormData, description: e.target.value })}
                  placeholder="Ingredients, preparation, and flavors..."
                />
              </div>

              <div className="modal-checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={foodFormData.isVeg}
                    onChange={(e) => setFoodFormData({ ...foodFormData, isVeg: e.target.checked })}
                  />
                  Pure Vegetarian
                </label>
              </div>

              <button type="submit" className="btn-modal-save">Save Dish</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE STAFF */}
      {showStaffModal && (
        <div className="admin-modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowStaffModal(false)}>✕</button>
            <h3>Create Official Staff Account</h3>
            <form onSubmit={handleCreateStaff}>
              <div className="modal-input-field">
                <label>Staff Member Name</label>
                <input
                  type="text"
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </div>

              <div className="modal-input-field">
                <label>Official Email</label>
                <input
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  placeholder="e.g. priya.reception@riversidetreat.com"
                  required
                />
              </div>

              <div className="modal-grid-2">
                <div className="modal-input-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                  />
                </div>

                <div className="modal-input-field">
                  <label>Assigned Department / Role</label>
                  <select
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                  >
                    <option value="reception">Reception & Front Desk</option>
                    <option value="housekeeping">Housekeeping Operations</option>
                    <option value="kitchen">Kitchen / Dining Chef</option>
                  </select>
                </div>
              </div>

              <div className="modal-input-field">
                <label>Temporary Password</label>
                <input
                  type="password"
                  value={staffFormData.password}
                  onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-modal-save">Create Staff Member</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
