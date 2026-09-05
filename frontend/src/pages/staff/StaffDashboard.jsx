import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import "./staff.css";

function StaffDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("reception"); // default; updated from user.role

  // Reception state
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Housekeeping state
  const [cleaningTasks, setCleaningTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");

  // Kitchen state
  const [foodOrders, setFoodOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/staff/login");
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);

    if (["reception", "housekeeping", "kitchen"].includes(user.role)) {
      setActiveTab(user.role);
    } else if (user.role === "admin") {
      setActiveTab("reception");
    }

    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, roomsRes, tasksRes, ordersRes] = await Promise.all([
        api.getAllBookings(),
        api.getRooms(),
        api.getCleaningTasks(),
        api.getAllFoodOrders(),
      ]);

      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (roomsRes.success) setRooms(roomsRes.rooms);
      if (tasksRes.success) setCleaningTasks(tasksRes.tasks);
      if (ordersRes.success) setFoodOrders(ordersRes.orders);
    } catch (err) {
      console.error("Error loading staff data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reception Action: Check-in / Check-out
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.updateBookingStatus(bookingId, { bookingStatus: newStatus });
      if (res.success) {
        alert(res.message);
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || "Failed to update booking status.");
    }
  };

  // Housekeeping Action: Status Update (Needs Cleaning -> Under Cleaning -> Clean)
  const handleUpdateCleaningStatus = async (taskId, newStatus) => {
    try {
      const res = await api.updateCleaningTask(taskId, { status: newStatus });
      if (res.success) {
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || "Failed to update cleaning task.");
    }
  };

  // Kitchen Action: Order Status Update (New -> Preparing -> Ready -> Delivered)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateFoodOrderStatus(orderId, newStatus);
      if (res.success) {
        loadDashboardData();
      }
    } catch (err) {
      alert(err.message || "Failed to update order status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/staff/login");
  };

  // Metrics for Reception
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
  const availableRooms = rooms.filter((r) => r.status === "Available" && r.cleaningStatus === "Clean").length;
  const dirtyRooms = rooms.filter((r) => r.cleaningStatus === "Needs Cleaning" || r.cleaningStatus === "Under Cleaning").length;

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = bookingFilter === "all" || b.bookingStatus === bookingFilter;
    const matchesSearch =
      !searchQuery ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered Tasks
  const filteredTasks = cleaningTasks.filter(
    (t) => taskFilter === "all" || t.status === taskFilter
  );

  // Filtered Food Orders
  const filteredOrders = foodOrders.filter(
    (o) => orderFilter === "all" || o.orderStatus === orderFilter
  );

  return (
    <div className="staff-dashboard-page">
      {/* TOP BAR */}
      <header className="staff-top-header">
        <div className="staff-top-left">
          <Link to="/" className="staff-logo">
            🏛️ <strong>THE RIVERSIDE TREAT</strong>
          </Link>
          <span className="staff-tag">OPERATIONS CONSOLE</span>
        </div>

        <div className="staff-top-right">
          <div className="staff-user-chip">
            <span className="user-icon">👤</span>
            <div className="user-meta">
              <strong>{currentUser?.name || "Staff Member"}</strong>
              <span className="user-role-badge">[{currentUser?.role?.toUpperCase()}]</span>
            </div>
          </div>

          {currentUser?.role === "admin" && (
            <Link to="/admin/dashboard" className="btn-switch-admin">
              Go to Admin Suite →
            </Link>
          )}

          <button onClick={handleLogout} className="btn-staff-logout">
            Log Out
          </button>
        </div>
      </header>

      {/* ROLE SWITCHER TABS (Available for Admin or convenient role navigation) */}
      <div className="staff-role-subnav">
        <div className="subnav-container">
          {(currentUser?.role === "admin" || currentUser?.role === "reception") && (
            <button
              className={`subnav-tab ${activeTab === "reception" ? "active" : ""}`}
              onClick={() => setActiveTab("reception")}
            >
              🛎️ Reception & Front Desk
            </button>
          )}

          {(currentUser?.role === "admin" || currentUser?.role === "housekeeping") && (
            <button
              className={`subnav-tab ${activeTab === "housekeeping" ? "active" : ""}`}
              onClick={() => setActiveTab("housekeeping")}
            >
              🧹 Housekeeping ({dirtyRooms} dirty)
            </button>
          )}

          {(currentUser?.role === "admin" || currentUser?.role === "kitchen") && (
            <button
              className={`subnav-tab ${activeTab === "kitchen" ? "active" : ""}`}
              onClick={() => setActiveTab("kitchen")}
            >
              🍳 Kitchen Live Orders ({foodOrders.filter((o) => o.orderStatus !== "Delivered").length})
            </button>
          )}
        </div>
      </div>

      <main className="staff-main-content">
        {loading ? (
          <div className="staff-loading">
            <div className="spinner"></div>
            <p>Syncing live property status...</p>
          </div>
        ) : (
          <>
            {/* 1. RECEPTION DASHBOARD */}
            {activeTab === "reception" && (
              <div className="reception-view">
                {/* METRICS ROW */}
                <div className="metrics-row">
                  <div className="metric-card">
                    <span className="metric-icon">🚪</span>
                    <div className="metric-data">
                      <h3>{totalRooms}</h3>
                      <p>Total Property Rooms</p>
                    </div>
                  </div>

                  <div className="metric-card metric-green">
                    <span className="metric-icon">🟢</span>
                    <div className="metric-data">
                      <h3>{availableRooms}</h3>
                      <p>Ready / Available</p>
                    </div>
                  </div>

                  <div className="metric-card metric-orange">
                    <span className="metric-icon">🔴</span>
                    <div className="metric-data">
                      <h3>{occupiedRooms}</h3>
                      <p>Occupied Rooms</p>
                    </div>
                  </div>

                  <div className="metric-card metric-yellow">
                    <span className="metric-icon">🧹</span>
                    <div className="metric-data">
                      <h3>{dirtyRooms}</h3>
                      <p>Cleaning Required</p>
                    </div>
                  </div>
                </div>

                {/* ROOM STATUS GRID OVERVIEW */}
                <div className="panel-box">
                  <div className="panel-header">
                    <h3>Property Room Status Map</h3>
                    <span className="panel-hint">Live synchronized room occupancy</span>
                  </div>

                  <div className="room-map-grid">
                    {rooms.map((room) => {
                      let statusBadge = "map-available";
                      let label = "Clean & Ready";

                      if (room.status === "Occupied") {
                        statusBadge = "map-occupied";
                        label = "Occupied";
                      } else if (room.cleaningStatus === "Needs Cleaning") {
                        statusBadge = "map-dirty";
                        label = "Needs Cleaning";
                      } else if (room.cleaningStatus === "Under Cleaning") {
                        statusBadge = "map-cleaning";
                        label = "Cleaning in Progress";
                      }

                      return (
                        <div className={`room-map-card ${statusBadge}`} key={room._id}>
                          <span className="map-room-num">#{room.roomNumber}</span>
                          <strong className="map-room-name">{room.name}</strong>
                          <span className="map-status-pill">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* GUEST BOOKINGS MANAGEMENT */}
                <div className="panel-box">
                  <div className="panel-header search-header">
                    <div>
                      <h3>Guest Reservations & Check-In Desk</h3>
                      <span className="panel-hint">Manage check-in, checkout, and billing settlement</span>
                    </div>

                    <div className="panel-controls">
                      <input
                        type="text"
                        placeholder="Search guest or room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="staff-search-input"
                      />

                      <select
                        value={bookingFilter}
                        onChange={(e) => setBookingFilter(e.target.value)}
                        className="staff-select-filter"
                      >
                        <option value="all">All Bookings</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked-in">Checked-In</option>
                        <option value="Checked-out">Checked-Out</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="staff-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Guest Details</th>
                          <th>Room</th>
                          <th>Stay Dates</th>
                          <th>Billing Status</th>
                          <th>Reservation Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b) => (
                          <tr key={b._id}>
                            <td><strong>{b.bookingId}</strong></td>
                            <td>
                              <div className="guest-info">
                                <strong>{b.guestName}</strong>
                                <small>{b.guestEmail} • {b.guestPhone}</small>
                              </div>
                            </td>
                            <td>
                              <strong>Room #{b.roomNumber}</strong>
                              <small className="sub-tag">{b.roomName}</small>
                            </td>
                            <td>
                              <small>In: {new Date(b.checkIn).toLocaleDateString()}</small><br />
                              <small>Out: {new Date(b.checkOut).toLocaleDateString()}</small>
                            </td>
                            <td>
                              <strong>₹{b.totalAmount?.toLocaleString()}</strong>
                              <span className={`pill-badge ${b.paymentStatus === "Paid" ? "badge-paid" : "badge-pending"}`}>
                                {b.paymentStatus} ({b.paymentMethod})
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill pill-${b.bookingStatus.toLowerCase()}`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                {b.bookingStatus === "Confirmed" && (
                                  <button
                                    className="btn-action checkin"
                                    onClick={() => handleUpdateBookingStatus(b._id, "Checked-in")}
                                  >
                                    Check In Guest
                                  </button>
                                )}
                                {b.bookingStatus === "Checked-in" && (
                                  <button
                                    className="btn-action checkout"
                                    onClick={() => handleUpdateBookingStatus(b._id, "Checked-out")}
                                  >
                                    Check Out (Trigger Housekeeping)
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. HOUSEKEEPING DASHBOARD */}
            {activeTab === "housekeeping" && (
              <div className="housekeeping-view">
                <div className="panel-box">
                  <div className="panel-header">
                    <div>
                      <h3>Room Sanitization & Housekeeping Tasks</h3>
                      <p className="panel-hint">
                        Rooms automatically register as tasks upon checkout. Moving to "Clean" automatically restores room availability.
                      </p>
                    </div>

                    <div className="task-filter-chips">
                      <button
                        className={`chip ${taskFilter === "all" ? "active" : ""}`}
                        onClick={() => setTaskFilter("all")}
                      >
                        All Tasks ({cleaningTasks.length})
                      </button>
                      <button
                        className={`chip ${taskFilter === "Needs Cleaning" ? "active" : ""}`}
                        onClick={() => setTaskFilter("Needs Cleaning")}
                      >
                        🔴 Needs Cleaning
                      </button>
                      <button
                        className={`chip ${taskFilter === "Under Cleaning" ? "active" : ""}`}
                        onClick={() => setTaskFilter("Under Cleaning")}
                      >
                        🟡 In Progress
                      </button>
                      <button
                        className={`chip ${taskFilter === "Clean" ? "active" : ""}`}
                        onClick={() => setTaskFilter("Clean")}
                      >
                        🟢 Clean & Ready
                      </button>
                    </div>
                  </div>

                  <div className="tasks-cards-grid">
                    {filteredTasks.map((t) => (
                      <div className={`cleaning-task-card task-border-${t.status.replace(/\s+/g, '-').toLowerCase()}`} key={t._id}>
                        <div className="task-card-head">
                          <span className="task-id">{t.taskId}</span>
                          <span className={`task-badge badge-${t.status.replace(/\s+/g, '-').toLowerCase()}`}>
                            {t.status}
                          </span>
                        </div>

                        <h4>Room #{t.roomNumber} — {t.roomName}</h4>
                        <p className="task-notes">📝 {t.notes}</p>
                        <small className="task-assigned">Assigned: {t.assignedTo}</small>

                        <div className="task-actions-row">
                          {t.status === "Needs Cleaning" && (
                            <button
                              className="btn-task-progress start"
                              onClick={() => handleUpdateCleaningStatus(t._id, "Under Cleaning")}
                            >
                              ▶ Start Cleaning
                            </button>
                          )}
                          {t.status === "Under Cleaning" && (
                            <button
                              className="btn-task-progress finish"
                              onClick={() => handleUpdateCleaningStatus(t._id, "Clean")}
                            >
                              ✓ Mark as Clean & Ready
                            </button>
                          )}
                          {t.status === "Clean" && (
                            <button
                              className="btn-task-progress reset"
                              onClick={() => handleUpdateCleaningStatus(t._id, "Needs Cleaning")}
                            >
                              ↺ Mark for Re-cleaning
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. KITCHEN DASHBOARD */}
            {activeTab === "kitchen" && (
              <div className="kitchen-view">
                <div className="panel-box">
                  <div className="panel-header">
                    <div>
                      <h3>Live Kitchen Display System (KDS)</h3>
                      <p className="panel-hint">Live in-room and table dining orders stream directly from guests</p>
                    </div>

                    <div className="task-filter-chips">
                      <button
                        className={`chip ${orderFilter === "all" ? "active" : ""}`}
                        onClick={() => setOrderFilter("all")}
                      >
                        All Orders ({foodOrders.length})
                      </button>
                      <button
                        className={`chip ${orderFilter === "New" ? "active" : ""}`}
                        onClick={() => setOrderFilter("New")}
                      >
                        🆕 New Orders
                      </button>
                      <button
                        className={`chip ${orderFilter === "Preparing" ? "active" : ""}`}
                        onClick={() => setOrderFilter("Preparing")}
                      >
                        🍳 Preparing
                      </button>
                      <button
                        className={`chip ${orderFilter === "Ready" ? "active" : ""}`}
                        onClick={() => setOrderFilter("Ready")}
                      >
                        🔔 Ready for Delivery
                      </button>
                      <button
                        className={`chip ${orderFilter === "Delivered" ? "active" : ""}`}
                        onClick={() => setOrderFilter("Delivered")}
                      >
                        ✓ Delivered
                      </button>
                    </div>
                  </div>

                  <div className="kitchen-tickets-grid">
                    {filteredOrders.map((ord) => (
                      <div className={`kitchen-ticket ticket-${ord.orderStatus.toLowerCase()}`} key={ord._id}>
                        <div className="ticket-top">
                          <div>
                            <strong className="kds-order-id">{ord.orderId}</strong>
                            <span className="kds-dest">{ord.roomNumber}</span>
                          </div>
                          <span className={`kds-status-pill status-${ord.orderStatus.toLowerCase()}`}>
                            {ord.orderStatus}
                          </span>
                        </div>

                        <div className="kds-guest-line">
                          <span>Guest: {ord.customerName}</span>
                          <small>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>

                        <div className="kds-items-list">
                          {ord.items.map((it, idx) => (
                            <div className="kds-item-row" key={idx}>
                              <span className="kds-qty">{it.quantity}x</span>
                              <span className="kds-name">{it.name}</span>
                            </div>
                          ))}
                        </div>

                        {ord.notes && (
                          <div className="kds-notes">
                            <strong>Note:</strong> {ord.notes}
                          </div>
                        )}

                        <div className="kds-ticket-footer">
                          {ord.orderStatus === "New" && (
                            <button
                              className="btn-kds prep"
                              onClick={() => handleUpdateOrderStatus(ord._id, "Preparing")}
                            >
                              🍳 Start Cooking
                            </button>
                          )}
                          {ord.orderStatus === "Preparing" && (
                            <button
                              className="btn-kds ready"
                              onClick={() => handleUpdateOrderStatus(ord._id, "Ready")}
                            >
                              🔔 Mark Order Ready
                            </button>
                          )}
                          {ord.orderStatus === "Ready" && (
                            <button
                              className="btn-kds deliver"
                              onClick={() => handleUpdateOrderStatus(ord._id, "Delivered")}
                            >
                              🚀 Mark Delivered
                            </button>
                          )}
                          {ord.orderStatus === "Delivered" && (
                            <span className="kds-done-tag">✓ Order Delivered & Completed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default StaffDashboard;
