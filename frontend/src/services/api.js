const API_BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "An error occurred with the request.");
  }
  return data;
};

export const api = {
  // Auth
  register: (userData) => request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  staffLogin: (credentials) => request("/auth/staff-login", { method: "POST", body: JSON.stringify(credentials) }),
  adminLogin: (credentials) => request("/auth/admin-login", { method: "POST", body: JSON.stringify(credentials) }),
  getCurrentUser: () => request("/auth/me"),
  updateProfile: (profileData) => request("/auth/profile", { method: "PUT", body: JSON.stringify(profileData) }),

  // Rooms
  getRooms: (checkIn, checkOut) => {
    let url = "/rooms";
    if (checkIn && checkOut) {
      url += `?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`;
    }
    return request(url);
  },
  getRoomById: (id) => request(`/rooms/${id}`),
  addRoom: (roomData) => request("/rooms", { method: "POST", body: JSON.stringify(roomData) }),
  updateRoom: (id, roomData) => request(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(roomData) }),
  deleteRoom: (id) => request(`/rooms/${id}`, { method: "DELETE" }),

  // Facilities
  getFacilities: (type) => request(`/facilities${type ? `?type=${type}` : ""}`),
  getFacilityAvailability: (id, date) => request(`/facilities/${id}/availability?date=${date}`),
  addFacility: (facilityData) => request("/facilities", { method: "POST", body: JSON.stringify(facilityData) }),
  updateFacility: (id, facilityData) => request(`/facilities/${id}`, { method: "PUT", body: JSON.stringify(facilityData) }),
  deleteFacility: (id) => request(`/facilities/${id}`, { method: "DELETE" }),

  // Room Bookings
  createRoomBooking: (bookingData) => request("/bookings/room", { method: "POST", body: JSON.stringify(bookingData) }),
  getMyBookings: () => request("/bookings/my"),
  getAllBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bookings${query ? `?${query}` : ""}`);
  },
  updateBookingStatus: (id, statusData) => request(`/bookings/${id}/status`, { method: "PUT", body: JSON.stringify(statusData) }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: "PUT" }),

  // Facility Bookings
  createFacilityBooking: (bookingData) => request("/facility-bookings", { method: "POST", body: JSON.stringify(bookingData) }),
  getMyFacilityBookings: () => request("/facility-bookings/my"),
  getAllFacilityBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/facility-bookings${query ? `?${query}` : ""}`);
  },
  updateFacilityBookingStatus: (id, statusData) => request(`/facility-bookings/${id}/status`, { method: "PUT", body: JSON.stringify(statusData) }),
  cancelFacilityBooking: (id) => request(`/facility-bookings/${id}/cancel`, { method: "PUT" }),

  // Restaurant & Food
  getFoodItems: (category, onlyAvailable = false) => {
    const query = new URLSearchParams();
    if (category) query.append("category", category);
    if (onlyAvailable) query.append("onlyAvailable", "true");
    const qStr = query.toString();
    return request(`/food/items${qStr ? `?${qStr}` : ""}`);
  },
  addFoodItem: (itemData) => request("/food/items", { method: "POST", body: JSON.stringify(itemData) }),
  updateFoodItem: (id, itemData) => request(`/food/items/${id}`, { method: "PUT", body: JSON.stringify(itemData) }),
  deleteFoodItem: (id) => request(`/food/items/${id}`, { method: "DELETE" }),
  createFoodOrder: (orderData) => request("/food/orders", { method: "POST", body: JSON.stringify(orderData) }),
  getMyFoodOrders: () => request("/food/orders/my"),
  getAllFoodOrders: (status) => request(`/food/orders${status ? `?status=${status}` : ""}`),
  updateFoodOrderStatus: (id, orderStatus) => request(`/food/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ orderStatus }) }),

  // Housekeeping
  getCleaningTasks: (status) => request(`/housekeeping/tasks${status ? `?status=${status}` : ""}`),
  updateCleaningTask: (id, taskData) => request(`/housekeeping/tasks/${id}`, { method: "PUT", body: JSON.stringify(taskData) }),
  createCleaningTask: (taskData) => request("/housekeeping/tasks", { method: "POST", body: JSON.stringify(taskData) }),

  // Admin
  getAdminStats: () => request("/admin/stats"),
  getStaffList: () => request("/admin/staff"),
  createStaffAccount: (staffData) => request("/admin/staff", { method: "POST", body: JSON.stringify(staffData) }),
  updateStaffAccount: (id, staffData) => request(`/admin/staff/${id}`, { method: "PUT", body: JSON.stringify(staffData) }),
  getCustomersList: () => request("/admin/customers"),
};
